using FitnessChallenge.Api.Controllers;
using FitnessChallenge.Api.Data;
using FitnessChallenge.Api.Dtos;
using FitnessChallenge.Api.Models;
using FitnessChallenge.Api.Services;
using FitnessChallenge.Api.Validation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace FitnessChallenge.Tests.Controllers;

public class ActivitiesControllerTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly AppDbContext _db;
    private readonly ActivitiesController _controller;
    private readonly Guid _userId;

    public ActivitiesControllerTests()
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

        _controller = new ActivitiesController(_db, new CreateActivityRequestValidator(_db), new ScoringService());

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

    private CreateActivityRequest ValidBase() => new()
    {
        UserId = _userId.ToString(),
        Datetime = DateTimeOffset.UtcNow,
    };

    [Fact]
    public async Task Create_ValidRunning_Returns201WithIdAndComputedPoints()
    {
        var request = ValidBase();
        request.Sport = "running";
        request.Distance = 5m;

        var result = await _controller.Create(request, CancellationToken.None);

        var created = Assert.IsType<CreatedAtActionResult>(result);
        Assert.Equal(nameof(ActivitiesController.GetById), created.ActionName);
        var body = Assert.IsType<CreateActivityResponse>(created.Value);
        Assert.Equal(500, body.Points); // 5km * 100 pts/km
        Assert.Equal(1, await _db.Activities.CountAsync());
    }

    [Fact]
    public async Task Create_ValidDailySteps_Returns201WithComputedPoints()
    {
        var request = ValidBase();
        request.Steps = 8000;

        var result = await _controller.Create(request, CancellationToken.None);

        var created = Assert.IsType<CreatedAtActionResult>(result);
        Assert.Equal(nameof(ActivitiesController.GetById), created.ActionName);
        var body = Assert.IsType<CreateActivityResponse>(created.Value);
        Assert.Equal(80, body.Points); // 8000 / 100
    }

    [Fact]
    public async Task Create_InvalidRequest_Returns400ValidationProblem()
    {
        var request = ValidBase();
        request.Sport = "not-a-sport";

        var result = await _controller.Create(request, CancellationToken.None);

        var objectResult = Assert.IsAssignableFrom<ObjectResult>(result);
        Assert.Equal(400, objectResult.StatusCode);
        var problem = Assert.IsType<ValidationProblemDetails>(objectResult.Value);
        Assert.Contains("sport", problem.Errors.Keys);
        Assert.Equal(0, await _db.Activities.CountAsync());
    }

    [Fact]
    public async Task Create_NullBody_Returns400WithBodyKey()
    {
        var result = await _controller.Create(null, CancellationToken.None);

        var objectResult = Assert.IsAssignableFrom<ObjectResult>(result);
        Assert.Equal(400, objectResult.StatusCode);
        var problem = Assert.IsType<ValidationProblemDetails>(objectResult.Value);
        Assert.Contains("body", problem.Errors.Keys);
        Assert.DoesNotContain("request", problem.Errors.Keys);
    }

    [Fact]
    public async Task Create_SecondDailyStepsSameUtcDay_Returns400_EndToEnd()
    {
        var first = ValidBase();
        first.Steps = 5000;
        await _controller.Create(first, CancellationToken.None);

        var second = ValidBase();
        second.Steps = 6000;
        var result = await _controller.Create(second, CancellationToken.None);

        var objectResult = Assert.IsAssignableFrom<ObjectResult>(result);
        Assert.Equal(400, objectResult.StatusCode);
        var problem = Assert.IsType<ValidationProblemDetails>(objectResult.Value);
        Assert.Contains("steps", problem.Errors.Keys);
        Assert.Equal(1, await _db.Activities.CountAsync());
    }

    [Fact]
    public async Task GetById_ExistingActivity_ReturnsIt()
    {
        var request = ValidBase();
        request.Sport = "running";
        request.Distance = 5m;
        var createResult = await _controller.Create(request, CancellationToken.None);
        var created = (CreateActivityResponse)((CreatedAtActionResult)createResult).Value!;

        var result = await _controller.GetById(created.Id, CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result);
        var body = Assert.IsType<ActivityResponse>(ok.Value);
        Assert.Equal(created.Id, body.Id);
        Assert.Equal("running", body.Sport);
        Assert.Equal(500, body.Points);
    }

    [Fact]
    public async Task GetById_UnknownActivity_Returns404()
    {
        var result = await _controller.GetById(Guid.NewGuid(), CancellationToken.None);

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task GetAll_FiltersBySportAndPages()
    {
        await SeedActivityAsync(ActivityType.Running, DateTimeOffset.UtcNow.AddDays(-1), distance: 5m, points: 500);
        await SeedActivityAsync(ActivityType.Gym, DateTimeOffset.UtcNow.AddDays(-2), durationSeconds: 1800, points: 150);
        await SeedActivityAsync(ActivityType.Running, DateTimeOffset.UtcNow.AddDays(-3), distance: 2m, points: 200);

        var result = await _controller.GetAll(userId: _userId, from: null, to: null, sport: "running", page: 1, pageSize: 20, ct: CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result);
        var page = Assert.IsType<PagedResult<ActivityResponse>>(ok.Value);
        Assert.Equal(2, page.TotalCount);
        Assert.All(page.Items, a => Assert.Equal("running", a.Sport));
    }

    // "dailysteps" (the raw C# enum name) is deliberately NOT accepted - "steps" is
    // the one and only spelling for this filter value (see ActivityTypeResolver).
    [Fact]
    public async Task GetAll_DailyStepsSpelling_IsRejected()
    {
        var result = await _controller.GetAll(userId: _userId, from: null, to: null, sport: "dailysteps", page: 1, pageSize: 20, ct: CancellationToken.None);

        var objectResult = Assert.IsAssignableFrom<ObjectResult>(result);
        Assert.Equal(400, objectResult.StatusCode);
    }

    [Fact]
    public async Task GetAll_StepsFilter_ReturnsDailySteps()
    {
        await SeedActivityAsync(ActivityType.DailySteps, DateTimeOffset.UtcNow, steps: 8000, points: 80);
        await SeedActivityAsync(ActivityType.Running, DateTimeOffset.UtcNow, distance: 5m, points: 500);

        var result = await _controller.GetAll(userId: _userId, from: null, to: null, sport: "steps", page: 1, pageSize: 20, ct: CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result);
        var page = Assert.IsType<PagedResult<ActivityResponse>>(ok.Value);
        Assert.Equal(1, page.TotalCount);
    }

    [Fact]
    public async Task GetAll_InvalidSportFilter_Returns400()
    {
        var result = await _controller.GetAll(userId: null, from: null, to: null, sport: "not-a-sport", page: 1, pageSize: 20, ct: CancellationToken.None);

        var objectResult = Assert.IsAssignableFrom<ObjectResult>(result);
        Assert.Equal(400, objectResult.StatusCode);
    }

    private async Task SeedActivityAsync(
        ActivityType type,
        DateTimeOffset occurredAt,
        decimal? distance = null,
        int? durationSeconds = null,
        int? steps = null,
        int points = 0)
    {
        _db.Activities.Add(new Activity
        {
            Id = Guid.NewGuid(),
            UserId = _userId,
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
}
