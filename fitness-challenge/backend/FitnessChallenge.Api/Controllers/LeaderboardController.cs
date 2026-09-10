using FitnessChallenge.Api.Data;
using FitnessChallenge.Api.Dtos;
using FitnessChallenge.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FitnessChallenge.Api.Controllers;

[ApiController]
[Route("api/leaderboard")]
public class LeaderboardController : ControllerBase
{
    private const int DefaultTrendWindowDays = 7;

    private readonly AppDbContext _db;

    public LeaderboardController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<LeaderboardEntryResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Get([FromQuery] int trendWindowDays = DefaultTrendWindowDays, CancellationToken ct = default)
    {
        if (trendWindowDays <= 0)
        {
            trendWindowDays = DefaultTrendWindowDays;
        }

        var cutoff = DateTimeOffset.UtcNow.AddDays(-trendWindowDays);

        // Three queries total, independent of how many users exist - not one per user.
        var users = await _db.Users
            .Select(u => new { u.Id, u.FirstName, u.LastName })
            .ToListAsync(ct);

        var totalsByUser = await _db.Activities
            .GroupBy(a => a.UserId)
            .Select(g => new { UserId = g.Key, Total = g.Sum(a => a.Points) })
            .ToDictionaryAsync(x => x.UserId, x => x.Total, ct);

        var priorTotalsByUser = await _db.Activities
            .Where(a => a.OccurredAt <= cutoff)
            .GroupBy(a => a.UserId)
            .Select(g => new { UserId = g.Key, Total = g.Sum(a => a.Points) })
            .ToDictionaryAsync(x => x.UserId, x => x.Total, ct);

        var rows = users.Select(u => new
        {
            u.Id,
            Name = $"{u.FirstName} {u.LastName}",
            TotalPoints = totalsByUser.GetValueOrDefault(u.Id, 0),
            // Absent key (not a 0 value) means no activity existed before the cutoff -
            // that's what makes a user "new" rather than a genuine zero scorer.
            HadPriorActivity = priorTotalsByUser.TryGetValue(u.Id, out var prior),
            PriorPoints = priorTotalsByUser.GetValueOrDefault(u.Id, 0),
        }).ToList();

        var currentRanks = DenseRanker.Rank(rows, r => r.TotalPoints, r => r.Name, r => r.Id);

        // Only users with prior-cutoff activity participate in the previous ranking -
        // mathematically identical to including "new" users at 0 (dense rank gives
        // ties the same number either way), but avoids conflating "no history" with
        // "a real zero."
        var previousRanks = DenseRanker.Rank(
            rows.Where(r => r.HadPriorActivity),
            r => r.PriorPoints,
            r => r.Name,
            r => r.Id);

        var response = rows
            .Select(r =>
            {
                var rank = currentRanks[r.Id];
                var previousRank = r.HadPriorActivity ? previousRanks[r.Id] : (int?)null;

                return new LeaderboardEntryResponse
                {
                    Rank = rank,
                    UserId = r.Id,
                    Name = r.Name,
                    TotalPoints = r.TotalPoints,
                    PreviousRank = previousRank,
                    RankChange = previousRank.HasValue ? previousRank.Value - rank : null,
                    PointsInWindow = r.TotalPoints - r.PriorPoints,
                    IsNew = !r.HadPriorActivity,
                };
            })
            .OrderBy(e => e.Rank)
            .ThenBy(e => e.Name, StringComparer.OrdinalIgnoreCase)
            .ToList();

        return Ok(response);
    }
}
