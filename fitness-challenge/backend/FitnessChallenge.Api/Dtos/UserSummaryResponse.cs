namespace FitnessChallenge.Api.Dtos;

public class UserSummaryResponse
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = default!;
    public string LastName { get; set; } = default!;
    public int TotalPoints { get; set; }
}
