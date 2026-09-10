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

// Each test gets its own in-memory Sqlite connection/context - these tests write data,
// so sharing a context across tests (like the read-only ActivityValidatorFixture in A4)
// would leak state between them (e.g. the duplicate-name test polluting the GetAll test).
public class UsersControllerTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly AppDbContext _db;
    private readonly UsersController _controller;

    public UsersControllerTests()
    {
        _connection = new SqliteConnection("Data Source=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<AppDbContext>().UseSqlite(_connection).Options;
        _db = new AppDbContext(options);
        _db.Database.EnsureCreated();

        _controller = new UsersController(_db, new CreateUserRequestValidator());

        // ValidationProblem() resolves ProblemDetailsFactory from HttpContext.RequestServices -
        // without a real request pipeline there's no HttpContext at all, so it silently leaves
        // StatusCode/Status unset instead of 400. AddControllers() registers the same
        // DefaultProblemDetailsFactory the real app uses, so this reproduces production behavior.
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

    [Fact]
    public async Task Create_ValidRequest_Returns201WithId()
    {
        var request = new CreateUserRequest { FirstName = "Ivan", LastName = "Horvat" };

        var result = await _controller.Create(request, CancellationToken.None);

        var created = Assert.IsType<CreatedAtActionResult>(result);
        Assert.Equal(nameof(UsersController.GetById), created.ActionName);
        var body = Assert.IsType<CreateUserResponse>(created.Value);
        Assert.NotEqual(Guid.Empty, body.Id);
        Assert.Equal(1, await _db.Users.CountAsync());
    }

    [Fact]
    public async Task Create_DuplicateName_CaseInsensitive_Returns409()
    {
        await _controller.Create(new CreateUserRequest { FirstName = "Ivan", LastName = "Horvat" }, CancellationToken.None);

        var result = await _controller.Create(
            new CreateUserRequest { FirstName = "ivan", LastName = "HORVAT" },
            CancellationToken.None);

        var conflict = Assert.IsType<ConflictObjectResult>(result);
        var problem = Assert.IsType<ProblemDetails>(conflict.Value);
        Assert.Equal(409, problem.Status);
        Assert.Equal(1, await _db.Users.CountAsync());
    }

    [Fact]
    public async Task Create_InvalidRequest_Returns400ValidationProblem()
    {
        var request = new CreateUserRequest { FirstName = "", LastName = "Horvat" };

        var result = await _controller.Create(request, CancellationToken.None);

        var objectResult = Assert.IsAssignableFrom<ObjectResult>(result);
        Assert.Equal(400, objectResult.StatusCode);
        var problem = Assert.IsType<ValidationProblemDetails>(objectResult.Value);
        Assert.Contains("firstName", problem.Errors.Keys);
        Assert.Equal(0, await _db.Users.CountAsync());
    }

    [Fact]
    public async Task GetAll_ReturnsUsersWithTotalPoints_IncludingZeroForNoActivities()
    {
        var withActivities = User.Create("Ivan", "Horvat");
        var withoutActivities = User.Create("Ana", "Kovac");
        _db.Users.AddRange(withActivities, withoutActivities);

        _db.Activities.AddRange(
            new Activity
            {
                Id = Guid.NewGuid(),
                UserId = withActivities.Id,
                Type = ActivityType.Running,
                DistanceKm = 5m,
                OccurredAt = DateTimeOffset.UtcNow,
                Points = 500,
                CreatedAt = DateTimeOffset.UtcNow,
            },
            new Activity
            {
                Id = Guid.NewGuid(),
                UserId = withActivities.Id,
                Type = ActivityType.Gym,
                DurationSeconds = 1800,
                OccurredAt = DateTimeOffset.UtcNow,
                Points = 150,
                CreatedAt = DateTimeOffset.UtcNow,
            });
        await _db.SaveChangesAsync();

        var result = await _controller.GetAll(CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result);
        var users = Assert.IsAssignableFrom<IEnumerable<UserSummaryResponse>>(ok.Value).ToList();

        Assert.Equal(650, users.Single(u => u.Id == withActivities.Id).TotalPoints);
        Assert.Equal(0, users.Single(u => u.Id == withoutActivities.Id).TotalPoints);
    }

    [Fact]
    public async Task GetById_ExistingUser_ReturnsUser()
    {
        var user = User.Create("Ivan", "Horvat");
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        var result = await _controller.GetById(user.Id, CancellationToken.None);

        var ok = Assert.IsType<OkObjectResult>(result);
        var body = Assert.IsType<UserSummaryResponse>(ok.Value);
        Assert.Equal(user.Id, body.Id);
    }

    [Fact]
    public async Task GetById_UnknownUser_Returns404()
    {
        var result = await _controller.GetById(Guid.NewGuid(), CancellationToken.None);

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task Create_NullBody_Returns400WithBodyKey_NotFrameworkParameterName()
    {
        var result = await _controller.Create(null, CancellationToken.None);

        var objectResult = Assert.IsAssignableFrom<ObjectResult>(result);
        Assert.Equal(400, objectResult.StatusCode);
        var problem = Assert.IsType<ValidationProblemDetails>(objectResult.Value);
        Assert.Contains("body", problem.Errors.Keys);
        Assert.DoesNotContain("request", problem.Errors.Keys);
        Assert.DoesNotContain(string.Empty, problem.Errors.Keys);
    }
}
