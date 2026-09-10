using FitnessChallenge.Api.Models;

namespace FitnessChallenge.Api.Services;

// Takes DurationSeconds already parsed to an int - "mm:ss" string parsing is a request
// validation concern (A4), not scoring, so this service never sees the raw duration string.
public class ScoringService : IScoringService
{
    public int Calculate(Activity activity) => activity.Type switch
    {
        ActivityType.Running => (int)Math.Floor(activity.DistanceKm!.Value * 100m),
        ActivityType.Walking => (int)Math.Floor(activity.DistanceKm!.Value * 50m),
        ActivityType.Cycling => (int)Math.Floor(activity.DistanceKm!.Value * 25m),
        ActivityType.Swimming => (activity.DurationSeconds!.Value / 60) * 15,
        ActivityType.Gym => (activity.DurationSeconds!.Value / 60) * 5,
        ActivityType.DailySteps => activity.Steps!.Value / 100,
        _ => throw new ArgumentOutOfRangeException(nameof(activity), activity.Type, "Unknown activity type."),
    };
}
