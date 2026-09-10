using FitnessChallenge.Api.Controllers;
using FitnessChallenge.Api.Data;
using FitnessChallenge.Api.Dtos;
using FitnessChallenge.Api.Models;
using FitnessChallenge.Api.Validation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace FitnessChallenge.Tests.Controllers;

public class UsersControllerDashboardTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly AppDbContext _db;
    private readonly UsersController _controller;

    public UsersControllerDashboardTests()
    {
        _connection = new SqliteConnection("Data Source=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<AppDbContext>().UseSqlite(_connection).Options;
        _db = new AppDbContext(options);
        _db.Database.EnsureCreated();

        _controller = new UsersController(_db, new CreateUserRequestValidator());

        // ValidationProblem() needs a real HttpContext.RequestServices to resolve
        // ProblemDetailsFactory - see UsersControllerTests for the full explanation.
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddControllers();
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { RequestServices = services.BuildServiceProvider() },
        };
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

    private async Task AddActivityAsync(
        Guid userId,
        DateTimeOffset occurredAt,
        ActivityType type = ActivityType.Running,
        decimal? distance = null,
        int? durationSeconds = null,
        int? steps = null,
        int points = 0)
    {
        _db.Activities.Add(new Activity
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = type,
            OccurredAt = occurredAt,
            DistanceKm = distance,
            DurationSeconds = durationSeconds,
            Steps = steps,
            Points = points,
            CreatedAt = DateTimeOffset.UtcNow,
        });
        await _db.SaveChangesAsync();
    }

    [Fact]
    public async Task UnknownUser_Returns404()
    {
        var result = await _controller.GetDashboard(Guid.NewGuid(), null, null, CancellationToken.None);

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task FromAfterTo_Returns400()
    {
        var user = await AddUserAsync("Ivan", "Horvat");
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var result = await _controller.GetDashboard(user.Id, today, today.AddDays(-1), CancellationToken.None);

        var objectResult = Assert.IsAssignableFrom<ObjectResult>(result);
        Assert.Equal(400, objectResult.StatusCode);
    }

    [Fact]
    public async Task NoActivities_ReturnsZeroedResponse_NotACrash()
    {
        var user = await AddUserAsync("Ivan", "Horvat");

        var result = await _controller.GetDashboard(user.Id, null, null, CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result);
        var dashboard = Assert.IsType<DashboardResponse>(ok.Value);

        Assert.Equal(0, dashboard.TotalPoints);
        Assert.Equal(1, dashboard.Rank); // sole user still ranks 1st, not a crash
        Assert.Equal(0, dashboard.Totals.Activities);
        Assert.Empty(dashboard.SportBreakdown);
        Assert.Equal(0, dashboard.Streak.Current);
        Assert.Equal(0, dashboard.Streak.Longest);
        Assert.All(dashboard.Daily, d => Assert.Equal(0, d.Points));
        Assert.Equal(30, dashboard.Daily.Count); // default 30-day window, inclusive both ends
    }

    [Fact]
    public async Task GapDays_AreFilledWithZeroPoints()
    {
        var user = await AddUserAsync("Ivan", "Horvat");
        var day1 = new DateOnly(2026, 6, 1);
        var day3 = new DateOnly(2026, 6, 3);

        await AddActivityAsync(user.Id, day1.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc), points: 100);
        await AddActivityAsync(user.Id, day3.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc), points: 200);

        var result = await _controller.GetDashboard(user.Id, day1, day3, CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result);
        var dashboard = Assert.IsType<DashboardResponse>(ok.Value);

        Assert.Equal(3, dashboard.Daily.Count);
        Assert.Equal(100, dashboard.Daily[0].Points);
        Assert.Equal(0, dashboard.Daily[1].Points); // the gap day
        Assert.Equal(0, dashboard.Daily[1].Activities);
        Assert.Empty(dashboard.Daily[1].ByType);
        Assert.Equal(200, dashboard.Daily[2].Points);
    }

    // Added for B4: the chart's metric toggle (points/km/minutes) needs real
    // per-day data, not points reconstructed client-side via the scoring
    // rates - see docs/01-spec-backend.md section 3.6.
    [Fact]
    public async Task Daily_IncludesDistanceMinutesAndSteps_NotJustPoints()
    {
        var user = await AddUserAsync("Ivan", "Horvat");
        var day = new DateOnly(2026, 6, 1);
        var occurredAt = day.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);

        await AddActivityAsync(user.Id, occurredAt, ActivityType.Running, distance: 5m, points: 500);
        await AddActivityAsync(user.Id, occurredAt, ActivityType.Walking, distance: 2m, points: 100);
        await AddActivityAsync(user.Id, occurredAt, ActivityType.Gym, durationSeconds: 1800, points: 150);
        await AddActivityAsync(user.Id, occurredAt, ActivityType.DailySteps, steps: 8000, points: 80);

        var result = await _controller.GetDashboard(user.Id, day, day, CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result);
        var dashboard = Assert.IsType<DashboardResponse>(ok.Value);

        var entry = Assert.Single(dashboard.Daily);
        Assert.Equal(7m, entry.DistanceKm); // 5 (running) + 2 (walking)
        Assert.Equal(30, entry.Minutes); // 1800s gym
        Assert.Equal(8000, entry.Steps);
        Assert.Equal(830, entry.Points);
    }

    // Added for B5: the heatmap's matTooltip needs "date + points + activity
    // count" per spec section 8 - Points alone can't tell one big activity
    // apart from several small ones on the same day.
    [Fact]
    public async Task Daily_IncludesActivityCount()
    {
        var user = await AddUserAsync("Ivan", "Horvat");
        var day = new DateOnly(2026, 6, 1);
        var occurredAt = day.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);

        await AddActivityAsync(user.Id, occurredAt, ActivityType.Running, distance: 5m, points: 500);
        await AddActivityAsync(user.Id, occurredAt, ActivityType.Walking, distance: 2m, points: 100);

        var result = await _controller.GetDashboard(user.Id, day, day, CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result);
        var dashboard = Assert.IsType<DashboardResponse>(ok.Value);

        var entry = Assert.Single(dashboard.Daily);
        Assert.Equal(2, entry.Activities);
        Assert.Equal(600, entry.Points);
    }

    [Fact]
    public async Task TotalsAndRank_AreAllTime_NotScopedToRange()
    {
        var user = await AddUserAsync("Ivan", "Horvat");
        var outsideRange = new DateOnly(2026, 1, 1);
        var insideRangeStart = new DateOnly(2026, 6, 1);
        var insideRangeEnd = new DateOnly(2026, 6, 2);

        await AddActivityAsync(user.Id, outsideRange.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc), points: 500);
        await AddActivityAsync(user.Id, insideRangeStart.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc), points: 100);

        var result = await _controller.GetDashboard(user.Id, insideRangeStart, insideRangeEnd, CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result);
        var dashboard = Assert.IsType<DashboardResponse>(ok.Value);

        Assert.Equal(600, dashboard.TotalPoints); // all-time: both activities
        Assert.Equal(1, dashboard.Totals.Activities); // scoped: only the in-range one
        Assert.Equal(100, dashboard.Daily[0].Points);
    }

    [Fact]
    public async Task SportBreakdown_GroupsByTypeAcrossRange()
    {
        var user = await AddUserAsync("Ivan", "Horvat");
        var day = new DateOnly(2026, 6, 1);
        var occurredAt = day.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);

        await AddActivityAsync(user.Id, occurredAt, ActivityType.Running, distance: 5m, points: 500);
        await AddActivityAsync(user.Id, occurredAt, ActivityType.Running, distance: 3m, points: 300);
        await AddActivityAsync(user.Id, occurredAt, ActivityType.Gym, durationSeconds: 1800, points: 150);

        var result = await _controller.GetDashboard(user.Id, day, day, CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result);
        var dashboard = Assert.IsType<DashboardResponse>(ok.Value);

        var running = dashboard.SportBreakdown.Single(s => s.Sport == "running");
        Assert.Equal(2, running.Activities);
        Assert.Equal(800, running.Points);
        Assert.Equal(8m, running.DistanceKm);

        var gym = dashboard.SportBreakdown.Single(s => s.Sport == "gym");
        Assert.Equal(1, gym.Activities);
        Assert.Equal(0m, gym.DistanceKm);
    }

    // Must match docs/02-spec-frontend.md's --sport-steps CSS variable exactly - the
    // frontend resolves chart colours via `--sport-${sport}`. "dailysteps" (the
    // lowercased C# enum name) would silently fail that lookup.
    [Fact]
    public async Task SportBreakdownAndDailyByType_UseStepsNotDailyStepsAsTheSportKey()
    {
        var user = await AddUserAsync("Ivan", "Horvat");
        var day = new DateOnly(2026, 6, 1);
        var occurredAt = day.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);

        await AddActivityAsync(user.Id, occurredAt, ActivityType.DailySteps, steps: 8000, points: 80);

        var result = await _controller.GetDashboard(user.Id, day, day, CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result);
        var dashboard = Assert.IsType<DashboardResponse>(ok.Value);

        Assert.Contains(dashboard.SportBreakdown, s => s.Sport == "steps");
        Assert.DoesNotContain(dashboard.SportBreakdown, s => s.Sport == "dailysteps");
        Assert.Contains("steps", dashboard.Daily[0].ByType.Keys);
        Assert.DoesNotContain("dailysteps", dashboard.Daily[0].ByType.Keys);
    }

    [Fact]
    public async Task Streak_MostRecentActivityToday_CurrentIncludesToday()
    {
        var user = await AddUserAsync("Ivan", "Horvat");
        var now = DateTimeOffset.UtcNow;

        await AddActivityAsync(user.Id, now, points: 10);
        await AddActivityAsync(user.Id, now.AddDays(-1), points: 10);
        await AddActivityAsync(user.Id, now.AddDays(-2), points: 10);

        var result = await _controller.GetDashboard(user.Id, null, null, CancellationToken.None);

        var dashboard = (DashboardResponse)((OkObjectResult)result).Value!;
        Assert.Equal(3, dashboard.Streak.Current);
    }

    [Fact]
    public async Task Streak_MostRecentActivityYesterday_StillCountsAsCurrent()
    {
        var user = await AddUserAsync("Ivan", "Horvat");
        var now = DateTimeOffset.UtcNow;

        // Nothing logged today, but yesterday continues an unbroken run - the day
        // isn't over yet, so this must NOT read as broken.
        await AddActivityAsync(user.Id, now.AddDays(-1), points: 10);
        await AddActivityAsync(user.Id, now.AddDays(-2), points: 10);

        var result = await _controller.GetDashboard(user.Id, null, null, CancellationToken.None);

        var dashboard = (DashboardResponse)((OkObjectResult)result).Value!;
        Assert.Equal(2, dashboard.Streak.Current);
    }

    [Fact]
    public async Task Streak_MostRecentActivityTwoDaysAgo_CurrentIsBroken()
    {
        var user = await AddUserAsync("Ivan", "Horvat");
        var now = DateTimeOffset.UtcNow;

        // A full UTC day (yesterday) passed with nothing logged - streak is broken,
        // even though there's real history.
        await AddActivityAsync(user.Id, now.AddDays(-2), points: 10);
        await AddActivityAsync(user.Id, now.AddDays(-3), points: 10);

        var result = await _controller.GetDashboard(user.Id, null, null, CancellationToken.None);

        var dashboard = (DashboardResponse)((OkObjectResult)result).Value!;
        Assert.Equal(0, dashboard.Streak.Current);
    }

    [Fact]
    public async Task Streak_Longest_FindsBestRunEvenIfNotCurrent()
    {
        var user = await AddUserAsync("Ivan", "Horvat");
        var now = DateTimeOffset.UtcNow;

        // A 4-day run far in the past, then a break, then today alone.
        await AddActivityAsync(user.Id, now.AddDays(-40), points: 10);
        await AddActivityAsync(user.Id, now.AddDays(-39), points: 10);
        await AddActivityAsync(user.Id, now.AddDays(-38), points: 10);
        await AddActivityAsync(user.Id, now.AddDays(-37), points: 10);
        await AddActivityAsync(user.Id, now, points: 10);

        var result = await _controller.GetDashboard(user.Id, null, null, CancellationToken.None);

        var dashboard = (DashboardResponse)((OkObjectResult)result).Value!;
        Assert.Equal(4, dashboard.Streak.Longest);
        Assert.Equal(1, dashboard.Streak.Current);
    }
}
