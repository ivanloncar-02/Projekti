using FitnessChallenge.Api.Models;

namespace FitnessChallenge.Api.Dtos;

public static class ActivityTypeResolver
{
    // Only these five strings are valid "sport" values. "dailysteps" is deliberately
    // excluded even though it's a real enum name - DailySteps is only ever reached by
    // omitting sport entirely (CLAUDE.md rule 4).
    private static readonly IReadOnlyDictionary<string, ActivityType> SportNames =
        new Dictionary<string, ActivityType>(StringComparer.OrdinalIgnoreCase)
        {
            ["running"] = ActivityType.Running,
            ["walking"] = ActivityType.Walking,
            ["cycling"] = ActivityType.Cycling,
            ["gym"] = ActivityType.Gym,
            ["swimming"] = ActivityType.Swimming,
        };

    public static bool TryParseSport(string sport, out ActivityType type) =>
        SportNames.TryGetValue(sport, out type);

    // Safe only after CreateActivityRequestValidator has already passed - it guarantees
    // one of these two branches applies. Never call this on an unvalidated request.
    public static ActivityType Resolve(string? sport, int? steps)
    {
        if (!string.IsNullOrWhiteSpace(sport) && TryParseSport(sport, out var type))
        {
            return type;
        }

        if (string.IsNullOrWhiteSpace(sport) && steps.HasValue)
        {
            return ActivityType.DailySteps;
        }

        throw new InvalidOperationException("Cannot resolve ActivityType from an unvalidated request.");
    }

    // Canonical sport string for API responses (sportBreakdown, daily.byType) - must
    // match docs/02-spec-frontend.md's --sport-* CSS variables exactly, since the
    // frontend looks up colours via `--sport-${sport}`. That doc defines --sport-steps
    // (not --sport-dailysteps), so DailySteps maps to "steps" here, not a lowercased
    // enum name - ToString().ToLowerInvariant() would silently produce "dailysteps"
    // and break the CSS variable lookup.
    public static string ToSportName(ActivityType type) =>
        type == ActivityType.DailySteps ? "steps" : type.ToString().ToLowerInvariant();

    // GET /api/activities?sport= filter: the same five names as TryParseSport, plus
    // "steps" for Daily Steps - matching ToSportName exactly, one spelling per
    // concept. Deliberately not Enum.TryParse: that would also accept "dailysteps"
    // (the raw enum name) and even numeric strings like "5", both undocumented,
    // unrequested second spellings for what "steps" already covers.
    public static bool TryParseFilterSport(string sport, out ActivityType type)
    {
        if (string.Equals(sport, "steps", StringComparison.OrdinalIgnoreCase))
        {
            type = ActivityType.DailySteps;
            return true;
        }

        return TryParseSport(sport, out type);
    }
}
