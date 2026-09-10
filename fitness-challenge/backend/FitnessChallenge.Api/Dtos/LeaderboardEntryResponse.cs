namespace FitnessChallenge.Api.Dtos;

public class LeaderboardEntryResponse
{
    public int Rank { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = default!;
    public int TotalPoints { get; set; }
    public int? PreviousRank { get; set; }
    public int? RankChange { get; set; }
    public int PointsInWindow { get; set; }
    public bool IsNew { get; set; }
}
