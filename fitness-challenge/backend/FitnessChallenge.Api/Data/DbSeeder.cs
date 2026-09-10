using FitnessChallenge.Api.Models;
using FitnessChallenge.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace FitnessChallenge.Api.Data;

// Deterministic demo data: 6 users with distinct sport profiles, ~200 activities
// spread over the last 30 days. "Deterministic" means a fixed Random seed producing
// the same RELATIVE pattern (who logs what, how often, how many days before the run
// date) every time - not identical calendar dates, since the data anchors to UtcNow
// so the leaderboard/charts look alive whenever the app actually starts. Because of
// that anchor, the trend design (Ana drops, Luka climbs - see BuildProfiles) is keyed
// entirely to day-offset-from-anchor, never to weekday/month/anything calendar-shaped,
// and is verified at multiple simulated anchor dates in DbSeederTests.
public static class DbSeeder
{
    private const int RandomSeed = 42;
    private const int OldestDayOffset = 29;

    public static async Task SeedAsync(AppDbContext db, IScoringService scoring, DateTimeOffset? anchor = null, CancellationToken ct = default)
    {
        if (await db.Users.AnyAsync(ct))
        {
            return;
        }

        var now = anchor ?? DateTimeOffset.UtcNow;
        var today = DateOnly.FromDateTime(now.UtcDateTime.Date);
        var rng = new Random(RandomSeed);

        var profiles = BuildProfiles();
        var users = profiles.Select(p => User.Create(p.FirstName, p.LastName)).ToList();
        db.Users.AddRange(users);

        for (var i = 0; i < profiles.Count; i++)
        {
            GenerateActivitiesForUser(db, scoring, profiles[i], users[i].Id, today, rng);
        }

        await db.SaveChangesAsync(ct);
    }

    private static void GenerateActivitiesForUser(
        AppDbContext db,
        IScoringService scoring,
        SportProfile profile,
        Guid userId,
        DateOnly today,
        Random rng)
    {
        var dailyStepsLoggedDays = new HashSet<DateOnly>();

        for (var dayOffset = 0; dayOffset <= OldestDayOffset; dayOffset++)
        {
            // Day offset 7 sits exactly on the leaderboard's default trendWindowDays=7
            // cutoff. Skipping it entirely means the recent/older split never depends
            // on the anchor's time-of-day (an activity "on" the boundary day could
            // land on either side of `OccurredAt <= cutoff` depending on what hour it
            // was generated at) - the trend design only needs day-offsets 0-6 to be
            // unambiguously "in window" and 8-29 to be unambiguously "before cutoff."
            if (dayOffset == 7)
            {
                continue;
            }

            var isRecent = dayOffset < 7;
            var probability = isRecent ? profile.RecentProbability : profile.OlderProbability;
            if (rng.NextDouble() >= probability)
            {
                continue;
            }

            var day = today.AddDays(-dayOffset);
            var dayStart = new DateTimeOffset(day.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero);
            var magnitudeBoost = isRecent ? profile.RecentMagnitudeBoost : 1.0;

            // An "active" day isn't necessarily a single activity - a real user logs
            // a main session plus, often, a passive steps entry or a second short
            // session. Varying this (instead of always exactly 1) is what gets ~200
            // activities out of a day-level pattern that still has real gaps (the
            // gap/no-gap decision above is untouched by this).
            var activityCount = SampleActivityCount(rng);
            for (var n = 0; n < activityCount; n++)
            {
                var occurredAt = dayStart.AddHours(rng.Next(6, 21)).AddMinutes(rng.Next(0, 60));
                var type = profile.Types[rng.Next(profile.Types.Length)];

                // Daily Steps: at most one per UTC day (rule from A6/A9).
                if (type == ActivityType.DailySteps && !dailyStepsLoggedDays.Add(day))
                {
                    var alternatives = profile.Types.Where(t => t != ActivityType.DailySteps).ToArray();
                    if (alternatives.Length == 0)
                    {
                        continue;
                    }

                    type = alternatives[rng.Next(alternatives.Length)];
                }

                var activity = BuildActivity(userId, type, occurredAt, rng, magnitudeBoost);

                // Points always computed through the real scoring service - never
                // hardcoded, so the seed data doubles as an end-to-end scoring sanity check.
                activity.Points = scoring.Calculate(activity);
                db.Activities.Add(activity);
            }
        }
    }

    // Mean ~2.75 activities on an active day (0.10*1 + 0.30*2 + 0.35*3 + 0.25*4).
    private static int SampleActivityCount(Random rng) => rng.NextDouble() switch
    {
        < 0.10 => 1,
        < 0.40 => 2,
        < 0.75 => 3,
        _ => 4,
    };

    private static Activity BuildActivity(Guid userId, ActivityType type, DateTimeOffset occurredAt, Random rng, double magnitudeBoost)
    {
        var activity = new Activity
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Type = type,
            OccurredAt = occurredAt,
            CreatedAt = occurredAt,
        };

        switch (type)
        {
            case ActivityType.Running:
                activity.DistanceKm = RandomDecimal(rng, 3, 11, magnitudeBoost);
                break;
            case ActivityType.Walking:
                activity.DistanceKm = RandomDecimal(rng, 2, 6, magnitudeBoost);
                break;
            case ActivityType.Cycling:
                activity.DistanceKm = RandomDecimal(rng, 10, 35, magnitudeBoost);
                break;
            case ActivityType.Gym:
                activity.DurationSeconds = (int)Math.Round(rng.Next(30, 75) * magnitudeBoost) * 60;
                break;
            case ActivityType.Swimming:
                activity.DurationSeconds = (int)Math.Round(rng.Next(20, 60) * magnitudeBoost) * 60;
                break;
            case ActivityType.DailySteps:
                activity.Steps = (int)Math.Round(rng.Next(4000, 14000) * magnitudeBoost);
                break;
        }

        return activity;
    }

    private static decimal RandomDecimal(Random rng, double min, double max, double magnitudeBoost) =>
        Math.Round((decimal)((rng.NextDouble() * (max - min)) + min) * (decimal)magnitudeBoost, 2);

    private static List<SportProfile> BuildProfiles() =>
    [
        // Ana: dominant early, goes quiet in the last 7 days - designed to DROP.
        new SportProfile("Ana", "Novak", [ActivityType.Running], RecentProbability: 0.15, OlderProbability: 0.75, RecentMagnitudeBoost: 1.0),

        new SportProfile("Marko", "Kovačević", [ActivityType.Cycling], RecentProbability: 0.5, OlderProbability: 0.5, RecentMagnitudeBoost: 1.0),

        new SportProfile("Petra", "Babić", [ActivityType.Gym], RecentProbability: 0.6, OlderProbability: 0.6, RecentMagnitudeBoost: 1.0),

        new SportProfile("Ivan", "Horvat", [ActivityType.Swimming], RecentProbability: 0.4, OlderProbability: 0.4, RecentMagnitudeBoost: 1.0),

        new SportProfile("Marija", "Jurić", [ActivityType.Walking], RecentProbability: 0.35, OlderProbability: 0.35, RecentMagnitudeBoost: 1.0),

        // Luka: modest early, bursts in the last 7 days - designed to CLIMB.
        new SportProfile(
            "Luka",
            "Perić",
            [ActivityType.Running, ActivityType.Cycling, ActivityType.Gym, ActivityType.Swimming, ActivityType.Walking, ActivityType.DailySteps],
            RecentProbability: 0.9,
            OlderProbability: 0.25,
            RecentMagnitudeBoost: 1.8),
    ];

    private sealed record SportProfile(
        string FirstName,
        string LastName,
        ActivityType[] Types,
        double RecentProbability,
        double OlderProbability,
        double RecentMagnitudeBoost);
}
