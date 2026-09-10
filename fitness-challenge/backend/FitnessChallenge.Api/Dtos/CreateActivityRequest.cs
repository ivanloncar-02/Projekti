namespace FitnessChallenge.Api.Dtos;

// Datetime/Distance/Steps stay strongly typed to match the assignment's JSON schema.
// A malformed value for any of them (non-ISO-8601 datetime, non-numeric distance,
// non-integer steps) fails during JSON deserialization, before this object exists -
// ASP.NET Core turns that into a 400 automatically once the controller exists (A6).
public class CreateActivityRequest
{
    public string? UserId { get; set; }
    public DateTimeOffset? Datetime { get; set; }
    public string? Sport { get; set; }
    public int? Steps { get; set; }
    public decimal? Distance { get; set; }
    public string? Duration { get; set; }
}
