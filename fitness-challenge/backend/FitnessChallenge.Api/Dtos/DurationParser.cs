using System.Globalization;
using System.Text.RegularExpressions;

namespace FitnessChallenge.Api.Dtos;

public static partial class DurationParser
{
    [GeneratedRegex(@"^\d{1,4}:[0-5]\d$")]
    private static partial Regex Pattern();

    public static bool TryParse(string? duration, out int totalSeconds)
    {
        totalSeconds = 0;

        if (string.IsNullOrWhiteSpace(duration) || !Pattern().IsMatch(duration))
        {
            return false;
        }

        var parts = duration.Split(':');
        var minutes = int.Parse(parts[0], CultureInfo.InvariantCulture);
        var seconds = int.Parse(parts[1], CultureInfo.InvariantCulture);
        totalSeconds = (minutes * 60) + seconds;
        return true;
    }
}
