using FitnessChallenge.Api.Data;
using FitnessChallenge.Api.Models;
using FitnessChallenge.Api.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Xunit;
using Xunit.Abstractions;

namespace FitnessChallenge.Tests.Data;

public class DbSeederSanityTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly AppDbContext _db;
    private readonly ITestOutputHelper _output;

    public DbSeederSanityTests(ITestOutputHelper output)
    {
        _output = output;

        _connection = new SqliteConnection("Data Source=:memory:");
        _connection.Open();
        var options = new DbContextOptionsBuilder<AppDbContext>().UseSqlite(_connection).Options;
        _db = new AppDbContext(options);
        _db.Database.EnsureCreated();
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }

    [Fact]
    public async Task SeedsSixUsersAndApproximately200Activities()
    {
        await DbSeeder.SeedAsync(_db, new ScoringService());

        var userCount = await _db.Users.CountAsync();
        var activityCount = await _db.Activities.CountAsync();
        _output.WriteLine($"Users: {userCount}, Activities: {activityCount}");

        Assert.Equal(6, userCount);
        Assert.InRange(activityCount, 100, 300); // "~200" - not exact, but in the right neighborhood
    }

    [Fact]
    public async Task NoUserHasTwoDailyStepsEntriesOnTheSameUtcDay()
    {
        await DbSeeder.SeedAsync(_db, new ScoringService());

        var dailySteps = await _db.Activities
            .Where(a => a.Type == ActivityType.DailySteps)
            .Select(a => new { a.UserId, a.OccurredAt })
            .ToListAsync();

        var duplicates = dailySteps
            .GroupBy(a => (a.UserId, Day: a.OccurredAt.UtcDateTime.Date))
            .Where(g => g.Count() > 1)
            .ToList();

        Assert.Empty(duplicates);
    }

    [Fact]
    public async Task EveryUserHasAtLeastOneActivity_AndNoOneIsActiveEveryDay()
    {
        await DbSeeder.SeedAsync(_db, new ScoringService());

        var users = await _db.Users.Select(u => new { u.Id, u.FirstName }).ToListAsync();
        var activitiesByUser = await _db.Activities
            .Select(a => new { a.UserId, a.OccurredAt })
            .ToListAsync();

        foreach (var user in users)
        {
            var activeDays = activitiesByUser
                .Where(a => a.UserId == user.Id)
                .Select(a => a.OccurredAt.UtcDateTime.Date)
                .Distinct()
                .Count();

            _output.WriteLine($"{user.FirstName}: {activeDays} distinct active days out of 30");

            Assert.True(activeDays > 0, $"{user.FirstName} has zero activities.");
            Assert.True(activeDays < 30, $"{user.FirstName} is active every single day - no gaps for the heatmap/streak to show.");
        }
    }

    [Fact]
    public async Task PointsAreNeverZeroAcrossTheBoard_ScoringServiceActuallyRan()
    {
        await DbSeeder.SeedAsync(_db, new ScoringService());

        var totalPoints = await _db.Activities.SumAsync(a => a.Points);

        Assert.True(totalPoints > 0);
    }
}
