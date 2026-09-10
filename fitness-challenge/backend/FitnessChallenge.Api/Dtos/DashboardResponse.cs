namespace FitnessChallenge.Api.Dtos;

public class DashboardResponse
{
    public Guid UserId { get; set; }
    public string Name { get; set; } = default!;

    // All-time - not affected by from/to. See docs/01-spec-backend.md section 3.6.
    public int TotalPoints { get; set; }
    public int Rank { get; set; }

    // Scoped to [from, to].
    public DashboardTotals Totals { get; set; } = default!;
    public List<DashboardDailyEntry> Daily { get; set; } = new();
    public List<DashboardSportBreakdownEntry> SportBreakdown { get; set; } = new();

    // All-time - not affected by from/to.
    public DashboardStreak Streak { get; set; } = default!;
}

public class DashboardTotals
{
    public int Activities { get; set; }
    public decimal DistanceKm { get; set; }
    public int Minutes { get; set; }
    public int Steps { get; set; }
}

public class DashboardDailyEntry
{
    public string Date { get; set; } = default!; // yyyy-MM-dd, UTC calendar day
    public int Points { get; set; }
    public decimal DistanceKm { get; set; }
    public int Minutes { get; set; }
    public int Steps { get; set; }
    // Added in B5 - the activity heatmap's matTooltip needs "date + points +
    // activity count" per spec section 8, and nothing else on this DTO counts
    // activities per day (ByType sums points, not occurrences).
    public int Activities { get; set; }
    public Dictionary<string, int> ByType { get; set; } = new();
}

public class DashboardSportBreakdownEntry
{
    public string Sport { get; set; } = default!;
    public int Activities { get; set; }
    public int Points { get; set; }
    public decimal DistanceKm { get; set; }
}

public class DashboardStreak
{
    public int Current { get; set; }
    public int Longest { get; set; }
}
