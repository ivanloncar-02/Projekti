using System.Globalization;
using FitnessChallenge.Api.Models;
using FitnessChallenge.Api.Services;
using Xunit;

namespace FitnessChallenge.Tests.Services;

public class ScoringServiceTests
{
    private readonly IScoringService _sut = new ScoringService();

    [Theory]
    [InlineData(ActivityType.Walking, "1.55", 77)] // 77.5 floored
    [InlineData(ActivityType.Running, "42.195", 4219)] // 4219.5 floored
    [InlineData(ActivityType.Cycling, "0.039", 0)] // 0.975 floored - well under 1, not rounded up
    [InlineData(ActivityType.Walking, "1.549999", 77)] // just under the 77.5 boundary
    [InlineData(ActivityType.Walking, "2.0", 100)] // exact integer result, no flooring needed
    [InlineData(ActivityType.Running, "0", 0)] // zero distance
    public void Calculate_DistanceBasedSports_FloorsCorrectly(ActivityType type, string distanceKm, int expectedPoints)
    {
        var activity = new Activity
        {
            Type = type,
            DistanceKm = decimal.Parse(distanceKm, CultureInfo.InvariantCulture),
        };

        var points = _sut.Calculate(activity);

        Assert.Equal(expectedPoints, points);
    }

    // DurationSeconds arrives already parsed - "mm:ss" parsing is A4's job, not the service's.
    [Theory]
    [InlineData(ActivityType.Gym, 115, 5)] // "1:55" - 1 completed minute x 5
    [InlineData(ActivityType.Swimming, 59, 0)] // "0:59" - under 1 minute
    [InlineData(ActivityType.Swimming, 5430, 1350)] // "90:30" - 90 min x 15
    [InlineData(ActivityType.Gym, 3599, 295)] // "59:59" - just under the 60-minute boundary
    [InlineData(ActivityType.Gym, 3600, 300)] // "60:00" - exactly 60 minutes
    [InlineData(ActivityType.Gym, 0, 0)] // "0:00" - zero duration must not throw
    public void Calculate_DurationBasedSports_FloorsCompletedMinutes(ActivityType type, int durationSeconds, int expectedPoints)
    {
        var activity = new Activity
        {
            Type = type,
            DurationSeconds = durationSeconds,
        };

        var points = _sut.Calculate(activity);

        Assert.Equal(expectedPoints, points);
    }

    [Theory]
    [InlineData(399, 3)]
    [InlineData(99, 0)]
    [InlineData(100, 1)]
    [InlineData(100000, 1000)]
    [InlineData(0, 0)] // zero steps must not throw
    public void Calculate_DailySteps_UsesIntegerDivision(int steps, int expectedPoints)
    {
        var activity = new Activity
        {
            Type = ActivityType.DailySteps,
            Steps = steps,
        };

        var points = _sut.Calculate(activity);

        Assert.Equal(expectedPoints, points);
    }
}
