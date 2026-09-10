using FitnessChallenge.Api.Dtos;
using FitnessChallenge.Api.Validation;
using Xunit;

namespace FitnessChallenge.Tests.Validation;

public class CreateActivityRequestValidatorTests : IClassFixture<ActivityValidatorFixture>
{
    private readonly ActivityValidatorFixture _fixture;
    private readonly CreateActivityRequestValidator _sut;

    public CreateActivityRequestValidatorTests(ActivityValidatorFixture fixture)
    {
        _fixture = fixture;
        _sut = new CreateActivityRequestValidator(fixture.Db);
    }

    private CreateActivityRequest ValidBase() => new()
    {
        UserId = _fixture.ExistingUserId.ToString(),
        Datetime = DateTimeOffset.UtcNow,
    };

    // --- One passing case per activity type ---

    [Fact]
    public async Task Valid_Running_Passes()
    {
        var request = ValidBase();
        request.Sport = "running";
        request.Distance = 5.0m;

        var result = await _sut.ValidateAsync(request);

        Assert.True(result.IsValid);
    }

    [Fact]
    public async Task Valid_Walking_Passes()
    {
        var request = ValidBase();
        request.Sport = "walking";
        request.Distance = 3.2m;

        var result = await _sut.ValidateAsync(request);

        Assert.True(result.IsValid);
    }

    [Fact]
    public async Task Valid_Cycling_Passes()
    {
        var request = ValidBase();
        request.Sport = "cycling";
        request.Distance = 10m;

        var result = await _sut.ValidateAsync(request);

        Assert.True(result.IsValid);
    }

    [Fact]
    public async Task Valid_Gym_Passes()
    {
        var request = ValidBase();
        request.Sport = "gym";
        request.Duration = "45:00";

        var result = await _sut.ValidateAsync(request);

        Assert.True(result.IsValid);
    }

    [Fact]
    public async Task Valid_Swimming_Passes()
    {
        var request = ValidBase();
        request.Sport = "swimming";
        request.Duration = "30:00";

        var result = await _sut.ValidateAsync(request);

        Assert.True(result.IsValid);
    }

    [Fact]
    public async Task Valid_DailySteps_Passes()
    {
        var request = ValidBase();
        request.Sport = null;
        request.Steps = 8000;

        var result = await _sut.ValidateAsync(request);

        Assert.True(result.IsValid);
    }

    // --- userId missing, blank, not a GUID, or not an existing user ---

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("not-a-guid")]
    public async Task Invalid_UserId_Malformed_Fails(string? userId)
    {
        var request = ValidBase();
        request.UserId = userId;
        request.Sport = "running";
        request.Distance = 5m;

        var result = await _sut.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "userId");
    }

    [Fact]
    public async Task Invalid_UserId_DoesNotExist_Fails()
    {
        var request = ValidBase();
        request.UserId = Guid.NewGuid().ToString();
        request.Sport = "running";
        request.Distance = 5m;

        var result = await _sut.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "userId");
    }

    // --- datetime missing ---

    [Fact]
    public async Task Invalid_Datetime_Missing_Fails()
    {
        var request = ValidBase();
        request.Datetime = null;
        request.Sport = "running";
        request.Distance = 5m;

        var result = await _sut.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "datetime");
    }

    // --- datetime more than 24h in the future ---

    [Fact]
    public async Task Invalid_Datetime_MoreThan24hInFuture_Fails()
    {
        var request = ValidBase();
        request.Datetime = DateTimeOffset.UtcNow.AddHours(25);
        request.Sport = "running";
        request.Distance = 5m;

        var result = await _sut.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "datetime");
    }

    // --- sport present but not one of the five allowed values ---

    [Theory]
    [InlineData("football")]
    [InlineData("dailysteps")] // a real enum name, but never a valid literal sport value
    public async Task Invalid_Sport_NotRecognized_Fails(string sport)
    {
        var request = ValidBase();
        request.Sport = sport;
        request.Distance = 5m;

        var result = await _sut.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "sport");
    }

    // --- sport omitted and steps omitted ---

    [Fact]
    public async Task Invalid_SportAndStepsBothOmitted_Fails()
    {
        var request = ValidBase();
        request.Sport = null;
        request.Steps = null;

        var result = await _sut.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "sport");
    }

    // --- assignment's own example: swimming with distance instead of duration ---

    [Fact]
    public async Task Invalid_SwimmingWithDistance_Fails()
    {
        var request = ValidBase();
        request.Sport = "swimming";
        request.Distance = 1.5m;

        var result = await _sut.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "distance");
    }

    // --- any extra metric alongside the correct one ---

    [Fact]
    public async Task Invalid_RunningWithDistanceAndSteps_Fails()
    {
        var request = ValidBase();
        request.Sport = "running";
        request.Distance = 5m;
        request.Steps = 1000;

        var result = await _sut.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "steps");
    }

    [Fact]
    public async Task Invalid_GymWithDurationAndDistance_Fails()
    {
        var request = ValidBase();
        request.Sport = "gym";
        request.Duration = "30:00";
        request.Distance = 2m;

        var result = await _sut.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "distance");
    }

    // --- distance: 0 is accepted (scores 0 points), only a negative distance fails ---

    [Fact]
    public async Task Valid_DistanceZero_Passes()
    {
        var request = ValidBase();
        request.Sport = "running";
        request.Distance = 0m;

        var result = await _sut.ValidateAsync(request);

        Assert.True(result.IsValid);
    }

    [Theory]
    [InlineData(-0.5)]
    [InlineData(-1)]
    public async Task Invalid_DistanceNegative_Fails(decimal distance)
    {
        var request = ValidBase();
        request.Sport = "running";
        request.Distance = distance;

        var result = await _sut.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "distance");
    }

    // --- duration not matching ^\d{1,4}:[0-5]\d$ ---

    [Theory]
    [InlineData("10:75")]
    [InlineData("90")]
    [InlineData("1:2:3")]
    public async Task Invalid_DurationFormat_Fails(string duration)
    {
        var request = ValidBase();
        request.Sport = "gym";
        request.Duration = duration;

        var result = await _sut.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "duration");
    }

    // --- duration present with sport that expects distance ---

    [Fact]
    public async Task Invalid_DurationWithDistanceSport_Fails()
    {
        var request = ValidBase();
        request.Sport = "running";
        request.Duration = "30:00";

        var result = await _sut.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "duration");
    }

    // --- steps: 0 is accepted (scores 0 points), only a negative count fails ---

    [Fact]
    public async Task Valid_StepsZero_Passes()
    {
        var request = ValidBase();
        request.Sport = null;
        request.Steps = 0;

        var result = await _sut.ValidateAsync(request);

        Assert.True(result.IsValid);
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(-100)]
    public async Task Invalid_StepsNegative_Fails(int steps)
    {
        var request = ValidBase();
        request.Sport = null;
        request.Steps = steps;

        var result = await _sut.ValidateAsync(request);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == "steps");
    }
}
