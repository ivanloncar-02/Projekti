namespace FitnessChallenge.Api.Dtos;

public class ActivityResponse
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }

    // Lowercase activity type name, matching the request contract - null for Daily Steps
    // (mirrors the write side, where an absent sport means Daily Steps).
    public string? Sport { get; set; }

    public DateTimeOffset Datetime { get; set; }
    public decimal? Distance { get; set; }
    public int? DurationSeconds { get; set; }
    public int? Steps { get; set; }
    public int Points { get; set; }
}
