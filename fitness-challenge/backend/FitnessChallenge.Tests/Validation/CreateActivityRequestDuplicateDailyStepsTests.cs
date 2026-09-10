using FitnessChallenge.Api.Data;
using FitnessChallenge.Api.Dtos;
using FitnessChallenge.Api.Models;
using FitnessChallenge.Api.Validation;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace FitnessChallenge.Tests.Validation;

// Fresh in-memory Sqlite per test (not the shared, read-only ActivityValidatorFixture
// from A4) because every test here inserts an Activity to set up its precondition, and
// different tests need different, non-interfering existing-activity scenarios.
public class CreateActivityRequestDuplicateDailyStepsTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly AppDbContext _db;
    private readonly CreateActivityRequestValidator _sut;
    private readonly Guid _userId;

    public CreateActivityRequestDuplicateDailyStepsTests()
    {
        _connection = new SqliteConnection("Data Source=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<AppDbContext>().UseSqlite(_connection).Options;
        _db = new AppDbContext(options);
        _db.Database.EnsureCreated();

        var user = User.Create("Ivan", "Horvat");
        _db.Users.Add(user);
        _db.SaveChanges();
        _userId = user.Id;

        _sut = new CreateActivityRequestValidator(_db);
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }

    private async Task SeedDailyStepsAsync(DateTimeOffset occurredAt)
    {
        _db.Activities.Add(new Activity
        {
            Id = Guid.NewGuid(),
            UserId = _userId,
            Type = ActivityType.DailySteps,
            OccurredAt = occurredAt,
            Steps = 5000,
            Points = 50,
            CreatedAt = DateTimeOffset.UtcNow,
        });
        await _db.SaveChangesAsync();
    }

    [Fact]
    public async Task NoExistingEntry_Passes()
    {
        var request = new CreateActivityRequest
        {
            UserId = _userId.ToString(),
            Datetime = DateTimeOffset.UtcNow,
            Steps = 6000,
        };

        var result = await _sut.ValidateAsync(request);

        Assert.True(result.IsValid);
    }

    [Fact]
    public async Task ExistingEntrySameUtcDay_Fails()
    {
        var today = new DateTimeOffset(2026, 6, 30, 12, 0, 0, TimeSpan.Zero);
        await SeedDailyStepsAsync(today);

        var request = new CreateActivityRequest
        {
            UserId = _userId.ToString(),
            Datetime = today.AddHours(2), // same UTC day, different time
            Steps = 6000,
        };

        var result = await _sut.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "steps");
    }

    [Fact]
    public async Task ExistingEntryDifferentUtcDay_Passes()
    {
        var yesterday = new DateTimeOffset(2026, 6, 29, 12, 0, 0, TimeSpan.Zero);
        await SeedDailyStepsAsync(yesterday);

        var request = new CreateActivityRequest
        {
            UserId = _userId.ToString(),
            Datetime = yesterday.AddDays(1),
            Steps = 6000,
        };

        var result = await _sut.ValidateAsync(request);

        Assert.True(result.IsValid);
    }

    [Fact]
    public async Task ExistingEntrySameDayDifferentType_Passes()
    {
        var today = DateTimeOffset.UtcNow;
        _db.Activities.Add(new Activity
        {
            Id = Guid.NewGuid(),
            UserId = _userId,
            Type = ActivityType.Running,
            OccurredAt = today,
            DistanceKm = 5m,
            Points = 500,
            CreatedAt = today,
        });
        await _db.SaveChangesAsync();

        var request = new CreateActivityRequest
        {
            UserId = _userId.ToString(),
            Datetime = today,
            Steps = 6000,
        };

        var result = await _sut.ValidateAsync(request);

        Assert.True(result.IsValid);
    }

    // Documents the deliberate UTC-day decision (docs/01-spec-backend.md section 4):
    // these two instants are only 1 hour apart but fall on different UTC calendar
    // days, so they must NOT collide - proving this is a UTC day boundary, not a
    // rolling 24h window or the user's local day.
    [Fact]
    public async Task EntriesAcrossUtcMidnightBoundary_DoNotCollide()
    {
        var lateOnDayOne = new DateTimeOffset(2026, 6, 30, 23, 30, 0, TimeSpan.Zero);
        await SeedDailyStepsAsync(lateOnDayOne);

        var earlyOnDayTwo = new DateTimeOffset(2026, 7, 1, 0, 30, 0, TimeSpan.Zero);
        var request = new CreateActivityRequest
        {
            UserId = _userId.ToString(),
            Datetime = earlyOnDayTwo,
            Steps = 6000,
        };

        var result = await _sut.ValidateAsync(request);

        Assert.True(result.IsValid);
    }
}
