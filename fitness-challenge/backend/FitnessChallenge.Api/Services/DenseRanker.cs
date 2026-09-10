namespace FitnessChallenge.Api.Services;

// Shared by LeaderboardController (current + previous rank) and UsersController's
// dashboard action ("your rank") so both use exactly one ranking algorithm.
public static class DenseRanker
{
    // Dense rank: ties share a rank, and the next distinct score continues at
    // rank+1 (not rank+tieCount) - e.g. scores [300, 300, 200] rank as [1, 1, 2].
    public static Dictionary<TKey, int> Rank<T, TKey>(
        IEnumerable<T> items,
        Func<T, int> scoreSelector,
        Func<T, string> nameSelector,
        Func<T, TKey> idSelector)
        where TKey : notnull
    {
        var ordered = items
            .OrderByDescending(scoreSelector)
            .ThenBy(nameSelector, StringComparer.OrdinalIgnoreCase)
            .ToList();

        var ranks = new Dictionary<TKey, int>();
        var rank = 0;
        int? lastScore = null;

        foreach (var item in ordered)
        {
            var score = scoreSelector(item);
            if (lastScore is null || score != lastScore)
            {
                rank++;
                lastScore = score;
            }

            ranks[idSelector(item)] = rank;
        }

        return ranks;
    }
}
