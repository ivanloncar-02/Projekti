using FitnessChallenge.Api.Data;
using FitnessChallenge.Api.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Xunit;
using Xunit.Abstractions;

namespace FitnessChallenge.Tests.Data;

// The trend design is keyed to day-offset-from-anchor, never to weekday/month -
// verified here at today / +23 days / +91 days rather than trusting that "should be
// anchor-invariant by construction" holds without checking.
public class DbSeederTests
{
    private readonly ITestOutputHelper _output;

    public DbSeederTests(ITestOutputHelper output)
    {
        _output = output;
    }

    public static IEnumerable<object[]> AnchorDates()
    {
        var today = new DateTimeOffset(DateTime.UtcNow.Date, TimeSpan.Zero).AddHours(12);
        yield return new object[] { today };
        yield return new object[] { today.AddDays(23) };
        yield return new object[] { today.AddDays(91) };
    }

    [Theory]
    [MemberData(nameof(AnchorDates))]
    public async Task Leaderboard_HasAtLeastOneClimbAndOneDrop_AtEachAnchorDate(DateTimeOffset anchor)
    {
        using var connection = new SqliteConnection("Data Source=:memory:");
        connection.Open();
        var options = new DbContextOptionsBuilder<AppDbContext>().UseSqlite(connection).Options;
        using var db = new AppDbContext(options);
        db.Database.EnsureCreated();

        var scoring = new ScoringService();
        await DbSeeder.SeedAsync(db, scoring, anchor);

        // Reproduces LeaderboardController's query/ranking shape (including the real,
        // shared DenseRanker), but with cutoff computed relative to the SIMULATED
        // anchor instead of the real wall clock - LeaderboardController itself always
        // uses DateTimeOffset.UtcNow, so calling it directly here would compare seeded
        // data (dated relative to `anchor`) against a cutoff relative to whatever the
        // real test-run time happens to be, which only accidentally lines up for one
        // of the three anchors. This is what caught the mismatch on the first run.
        var cutoff = anchor.AddDays(-7);

        var users = await db.Users.Select(u => new { u.Id, u.FirstName, u.LastName }).ToListAsync();
        var totalsByUser = await db.Activities
            .GroupBy(a => a.UserId)
            .Select(g => new { UserId = g.Key, Total = g.Sum(a => a.Points) })
            .ToDictionaryAsync(x => x.UserId, x => x.Total);
        var priorTotalsByUser = await db.Activities
            .Where(a => a.OccurredAt <= cutoff)
            .GroupBy(a => a.UserId)
            .Select(g => new { UserId = g.Key, Total = g.Sum(a => a.Points) })
            .ToDictionaryAsync(x => x.UserId, x => x.Total);

        var rows = users.Select(u => new
        {
            u.Id,
            Name = $"{u.FirstName} {u.LastName}",
            TotalPoints = totalsByUser.GetValueOrDefault(u.Id, 0),
            HadPriorActivity = priorTotalsByUser.TryGetValue(u.Id, out var prior),
            PriorPoints = prior,
        }).ToList();

        var currentRanks = DenseRanker.Rank(rows, r => r.TotalPoints, r => r.Name, r => r.Id);
        var previousRanks = DenseRanker.Rank(rows.Where(r => r.HadPriorActivity), r => r.PriorPoints, r => r.Name, r => r.Id);

        var entries = rows
            .Select(r =>
            {
                var rank = currentRanks[r.Id];
                var previousRank = r.HadPriorActivity ? previousRanks[r.Id] : (int?)null;
                return new
                {
                    r.Id,
                    r.Name,
                    r.TotalPoints,
                    Rank = rank,
                    PreviousRank = previousRank,
                    RankChange = previousRank.HasValue ? previousRank.Value - rank : (int?)null,
                    PointsInWindow = r.TotalPoints - r.PriorPoints,
                    IsNew = !r.HadPriorActivity,
                };
            })
            .OrderBy(e => e.Rank)
            .ToList();

        _output.WriteLine($"=== Anchor: {anchor:yyyy-MM-dd HH:mm} UTC ({anchor.DayOfWeek}) ===");
        _output.WriteLine($"{"Rank",-5}{"Name",-16}{"TotalPts",-10}{"PrevRank",-10}{"Change",-8}{"InWindow",-10}{"New",-5}");
        foreach (var e in entries)
        {
            _output.WriteLine(
                $"{e.Rank,-5}{e.Name,-16}{e.TotalPoints,-10}{(e.PreviousRank?.ToString() ?? "-"),-10}{(e.RankChange?.ToString("+#;-#;0") ?? "-"),-8}{e.PointsInWindow,-10}{e.IsNew,-5}");
        }

        Assert.Contains(entries, e => e.RankChange > 0); // at least one climbed
        Assert.Contains(entries, e => e.RankChange < 0); // at least one dropped

        // Not everyone tied - a flat leaderboard is as broken as a flat trend column.
        Assert.True(entries.Select(e => e.TotalPoints).Distinct().Count() > 1);
    }
}
