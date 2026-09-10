namespace FitnessChallenge.Api.Models;

public class Activity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    public ActivityType Type { get; set; }
    public DateTimeOffset OccurredAt { get; set; } // stored as UTC

    public decimal? DistanceKm { get; set; } // running / walking / cycling
    public int? DurationSeconds { get; set; } // gym / swimming
    public int? Steps { get; set; } // daily steps

    public int Points { get; set; } // computed & stored at ingestion
    public DateTimeOffset CreatedAt { get; set; }
}
