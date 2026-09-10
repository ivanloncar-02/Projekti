using FitnessChallenge.Api.Controllers;
using FitnessChallenge.Api.Data;
using FitnessChallenge.Api.Dtos;
using FitnessChallenge.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace FitnessChallenge.Tests.Controllers;

public class LeaderboardControllerTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly AppDbContext _db;
    private readonly LeaderboardController _controller;

    public LeaderboardControllerTests()
    {
        _connection = new SqliteConnection("Data Source=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<AppDbContext>().UseSqlite(_connection).Options;
        _db = new AppDbContext(options);
        _db.Database.EnsureCreated();

        _controller = new LeaderboardController(_db);
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }

    private async Task<User> AddUserAsync(string first, string last)
    {
        var user = User.Create(first, last);
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return user;
    }

    private async Task AddActivityAsync(Guid userId, DateTimeOffset occurredAt, int points)
    {
        _db.Activities.Add(new Activity
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = ActivityType.DailySteps,
            OccurredAt = occurredAt,
            Steps = 100,
            Points = points,
            CreatedAt = DateTimeOffset.UtcNow,
        });
        await _db.SaveChangesAsync();
    }

    // Edge case: no users at all - must return an empty list, not throw.
    [Fact]
    public async Task EmptyDatabase_ReturnsEmptyList()
    {
        var result = await _controller.Get();

        var ok = Assert.IsType<OkObjectResult>(result);
        var entries = Assert.IsAssignableFrom<IEnumerable<LeaderboardEntryResponse>>(ok.Value);
        Assert.Empty(entries);
    }

    // Edge case: exactly one user, no activities at all - rank 1, isNew (no prior
    // history to rank against), not a crash from an empty prior-ranking dictionary.
    [Fact]
    public async Task SingleUser_NoActivities_RankOneAndIsNew()
    {
        var user = await AddUserAsync("Ivan", "Horvat");

        var result = await _controller.Get();

        var ok = Assert.IsType<OkObjectResult>(result);
        var entry = Assert.IsAssignableFrom<IEnumerable<LeaderboardEntryResponse>>(ok.Value).Single();
        Assert.Equal(1, entry.Rank);
        Assert.Equal(user.Id, entry.UserId);
        Assert.Equal(0, entry.TotalPoints);
        Assert.True(entry.IsNew);
        Assert.Null(entry.PreviousRank);
        Assert.Null(entry.RankChange);
        Assert.Equal(0, entry.PointsInWindow);
    }

    // Edge case: single user who DOES have activity both before and within the
    // window - previousRank must be 1 (only participant in that ranking too), not
    // null/isNew, and rankChange must be 0, not blow up on a size-1 ranking.
    [Fact]
    public async Task SingleUser_WithPriorActivity_RankOneNotNewRankChangeZero()
    {
        var user = await AddUserAsync("Ivan", "Horvat");
        await AddActivityAsync(user.Id, DateTimeOffset.UtcNow.AddDays(-10), 300); // before the 7-day cutoff
        await AddActivityAsync(user.Id, DateTimeOffset.UtcNow.AddDays(-1), 50); // inside the window

        var result = await _controller.Get(trendWindowDays: 7);

        var ok = Assert.IsType<OkObjectResult>(result);
        var entry = Assert.IsAssignableFrom<IEnumerable<LeaderboardEntryResponse>>(ok.Value).Single();
        Assert.Equal(1, entry.Rank);
        Assert.Equal(350, entry.TotalPoints);
        Assert.False(entry.IsNew);
        Assert.Equal(1, entry.PreviousRank);
        Assert.Equal(0, entry.RankChange);
        Assert.Equal(50, entry.PointsInWindow);
    }

    [Fact]
    public async Task DenseRanking_TiesShareRank_NextDistinctScoreIsPlusOne()
    {
        var a = await AddUserAsync("Ana", "Ana");
        var b = await AddUserAsync("Bero", "Bero");
        var c = await AddUserAsync("Cvijeta", "Cvijeta");
        await AddActivityAsync(a.Id, DateTimeOffset.UtcNow, 300);
        await AddActivityAsync(b.Id, DateTimeOffset.UtcNow, 300); // ties with Ana
        await AddActivityAsync(c.Id, DateTimeOffset.UtcNow, 200);

        var result = await _controller.Get();

        var ok = Assert.IsType<OkObjectResult>(result);
        var entries = Assert.IsAssignableFrom<IEnumerable<LeaderboardEntryResponse>>(ok.Value).ToList();

        Assert.Equal(1, entries.Single(e => e.UserId == a.Id).Rank);
        Assert.Equal(1, entries.Single(e => e.UserId == b.Id).Rank);
        Assert.Equal(2, entries.Single(e => e.UserId == c.Id).Rank); // dense: 2, not 3
    }

    [Fact]
    public async Task RankChange_PositiveWhenClimbed()
    {
        var climber = await AddUserAsync("Ana", "Ana");
        var stable = await AddUserAsync("Bero", "Bero");

        // Before the cutoff: climber was behind stable.
        await AddActivityAsync(climber.Id, DateTimeOffset.UtcNow.AddDays(-10), 100);
        await AddActivityAsync(stable.Id, DateTimeOffset.UtcNow.AddDays(-10), 300);

        // Within the window: climber earns enough to overtake.
        await AddActivityAsync(climber.Id, DateTimeOffset.UtcNow.AddDays(-1), 500);

        var result = await _controller.Get(trendWindowDays: 7);

        var ok = Assert.IsType<OkObjectResult>(result);
        var entries = Assert.IsAssignableFrom<IEnumerable<LeaderboardEntryResponse>>(ok.Value).ToList();

        var climberEntry = entries.Single(e => e.UserId == climber.Id);
        Assert.Equal(1, climberEntry.Rank);
        Assert.Equal(2, climberEntry.PreviousRank);
        Assert.Equal(1, climberEntry.RankChange); // previousRank(2) - rank(1) = +1, climbed
    }

    [Fact]
    public async Task IsNew_UserWithNoActivityBeforeCutoff_ButActivityWithinWindow()
    {
        var user = await AddUserAsync("Ivan", "Horvat");
        await AddActivityAsync(user.Id, DateTimeOffset.UtcNow.AddDays(-1), 200); // only within window

        var result = await _controller.Get(trendWindowDays: 7);

        var ok = Assert.IsType<OkObjectResult>(result);
        var entry = Assert.IsAssignableFrom<IEnumerable<LeaderboardEntryResponse>>(ok.Value).Single();
        Assert.True(entry.IsNew);
        Assert.Null(entry.PreviousRank);
        Assert.Equal(200, entry.PointsInWindow);
    }
}
