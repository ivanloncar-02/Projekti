using FitnessChallenge.Api.Data;
using FitnessChallenge.Api.Dtos;
using FitnessChallenge.Api.Models;
using FitnessChallenge.Api.Services;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace FitnessChallenge.Api.Controllers;

[ApiController]
[Route("api/users")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IValidator<CreateUserRequest> _validator;

    public UsersController(AppDbContext db, IValidator<CreateUserRequest> validator)
    {
        _db = db;
        _validator = validator;
    }

    [HttpPost]
    [ProducesResponseType(typeof(CreateUserResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create(CreateUserRequest? request, CancellationToken ct)
    {
        if (request is null)
        {
            return ValidationProblem(MissingBodyModelState());
        }

        var validation = await _validator.ValidateAsync(request, ct);
        if (!validation.IsValid)
        {
            return ValidationProblem(ToModelState(validation));
        }

        // Models.User, not ControllerBase.User (the ClaimsPrincipal) - unqualified
        // "User" here would silently resolve to the inherited property instead.
        var user = Models.User.Create(request.FirstName!, request.LastName!);
        _db.Users.Add(user);

        try
        {
            await _db.SaveChangesAsync(ct);
        }
        catch (DbUpdateException ex) when (IsDuplicateNameViolation(ex))
        {
            return Conflict(new ProblemDetails
            {
                Title = "A user with this name already exists.",
                Status = StatusCodes.Status409Conflict,
            });
        }

        var response = new CreateUserResponse { Id = user.Id };
        return CreatedAtAction(nameof(GetById), new { id = user.Id }, response);
    }

    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<UserSummaryResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var users = await _db.Users
            .Select(u => new UserSummaryResponse
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                TotalPoints = u.Activities.Sum(a => a.Points),
            })
            .ToListAsync(ct);

        return Ok(users);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(UserSummaryResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var user = await _db.Users
            .Where(u => u.Id == id)
            .Select(u => new UserSummaryResponse
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                TotalPoints = u.Activities.Sum(a => a.Points),
            })
            .FirstOrDefaultAsync(ct);

        return user is null ? NotFound() : Ok(user);
    }

    private const int DefaultDashboardWindowDays = 30;

    // from/to only scope Totals/Daily/SportBreakdown - TotalPoints, Rank, and Streak
    // are all-time by design (see docs/01-spec-backend.md section 3.6: a date-range
    // filter changing your leaderboard rank or resetting your streak display would
    // surprise a consumer who assumes from/to filters everything). Phase B's date
    // picker should only re-fetch/re-render those three range-scoped fields.
    [HttpGet("{id:guid}/dashboard")]
    [ProducesResponseType(typeof(DashboardResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDashboard(
        Guid id,
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        CancellationToken ct)
    {
        var rangeTo = to ?? DateOnly.FromDateTime(DateTimeOffset.UtcNow.UtcDateTime);
        var rangeFrom = from ?? rangeTo.AddDays(-(DefaultDashboardWindowDays - 1));

        if (rangeFrom > rangeTo)
        {
            var modelState = new ModelStateDictionary();
            modelState.AddModelError("from", "'from' must not be after 'to'.");
            return ValidationProblem(modelState);
        }

        var user = await _db.Users
            .Where(u => u.Id == id)
            .Select(u => new { u.FirstName, u.LastName })
            .FirstOrDefaultAsync(ct);

        if (user is null)
        {
            return NotFound();
        }

        // Rank needs every user's all-time total to know where this one user stands -
        // same two-query shape as LeaderboardController (A7).
        var users = await _db.Users
            .Select(u => new { u.Id, u.FirstName, u.LastName })
            .ToListAsync(ct);

        var totalsByUser = await _db.Activities
            .GroupBy(a => a.UserId)
            .Select(g => new { UserId = g.Key, Total = g.Sum(a => a.Points) })
            .ToDictionaryAsync(x => x.UserId, x => x.Total, ct);

        var rankRows = users.Select(u => new
        {
            u.Id,
            Name = $"{u.FirstName} {u.LastName}",
            TotalPoints = totalsByUser.GetValueOrDefault(u.Id, 0),
        }).ToList();
        var ranks = DenseRanker.Rank(rankRows, r => r.TotalPoints, r => r.Name, r => r.Id);

        // One query for the whole [from, to] range, sliced three ways in memory
        // (totals / daily / sportBreakdown) rather than three separate GroupBy
        // queries against the same rows - see A8 plan.
        var rangeStart = new DateTimeOffset(rangeFrom.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero);
        var rangeEndExclusive = new DateTimeOffset(rangeTo.AddDays(1).ToDateTime(TimeOnly.MinValue), TimeSpan.Zero);

        var activitiesInRange = await _db.Activities
            .Where(a => a.UserId == id && a.OccurredAt >= rangeStart && a.OccurredAt < rangeEndExclusive)
            .ToListAsync(ct);

        // Streak is all-time, independent of [from, to], so it needs its own query
        // over the user's full history - just the timestamps, not full rows. This is
        // the one query here that grows unbounded with a user's total activity count
        // (every other query is bounded by user count or the selected date range).
        // Fine at seed/take-home scale; a heavy user would eventually want this
        // pushed into SQL (e.g. a materialized "active days" table) instead.
        var allOccurredAt = await _db.Activities
            .Where(a => a.UserId == id)
            .Select(a => a.OccurredAt)
            .ToListAsync(ct);

        return Ok(new DashboardResponse
        {
            UserId = id,
            Name = $"{user.FirstName} {user.LastName}",
            TotalPoints = totalsByUser.GetValueOrDefault(id, 0),
            Rank = ranks[id],
            Totals = BuildTotals(activitiesInRange),
            Daily = BuildDaily(activitiesInRange, rangeFrom, rangeTo),
            SportBreakdown = BuildSportBreakdown(activitiesInRange),
            Streak = ComputeStreak(allOccurredAt),
        });
    }

    private static DashboardTotals BuildTotals(List<Activity> activities) => new()
    {
        Activities = activities.Count,
        DistanceKm = activities.Sum(a => a.DistanceKm ?? 0m),
        Minutes = activities.Sum(a => (a.DurationSeconds ?? 0) / 60),
        Steps = activities.Sum(a => a.Steps ?? 0),
    };

    private static List<DashboardDailyEntry> BuildDaily(List<Activity> activities, DateOnly from, DateOnly to)
    {
        // Group by UTC calendar day (rule 9 / A6 precedent), not local time.
        var byDay = activities
            .GroupBy(a => DateOnly.FromDateTime(a.OccurredAt.UtcDateTime.Date))
            .ToDictionary(g => g.Key, g => g.ToList());

        var days = new List<DashboardDailyEntry>();
        for (var day = from; day <= to; day = day.AddDays(1))
        {
            byDay.TryGetValue(day, out var dayActivities);
            dayActivities ??= new List<Activity>();

            days.Add(new DashboardDailyEntry
            {
                Date = day.ToString("yyyy-MM-dd"),
                Points = dayActivities.Sum(a => a.Points),
                // Same per-day aggregation BuildTotals already does over the
                // whole range - just scoped to this one day, so B4's chart
                // metric toggle (points/km/minutes) has real daily data
                // instead of reconstructing it client-side from points.
                DistanceKm = dayActivities.Sum(a => a.DistanceKm ?? 0m),
                Minutes = dayActivities.Sum(a => (a.DurationSeconds ?? 0) / 60),
                Steps = dayActivities.Sum(a => a.Steps ?? 0),
                Activities = dayActivities.Count,
                ByType = dayActivities
                    .GroupBy(a => ActivityTypeResolver.ToSportName(a.Type))
                    .ToDictionary(g => g.Key, g => g.Sum(a => a.Points)),
            });
        }

        return days;
    }

    private static List<DashboardSportBreakdownEntry> BuildSportBreakdown(List<Activity> activities) =>
        activities
            .GroupBy(a => a.Type)
            .Select(g => new DashboardSportBreakdownEntry
            {
                Sport = ActivityTypeResolver.ToSportName(g.Key),
                Activities = g.Count(),
                Points = g.Sum(a => a.Points),
                DistanceKm = g.Sum(a => a.DistanceKm ?? 0m),
            })
            .OrderByDescending(s => s.Points)
            .ToList();

    // A full missed UTC day breaks the streak; not yet having logged *today* doesn't -
    // if the most recent active day is today or yesterday, current counts the
    // consecutive run ending there, otherwise current is 0. Zero activities ever
    // returns (0, 0), not a crash on an empty sequence.
    private static DashboardStreak ComputeStreak(List<DateTimeOffset> occurredAtValues)
    {
        var activeDays = occurredAtValues
            .Select(o => DateOnly.FromDateTime(o.UtcDateTime.Date))
            .ToHashSet();

        if (activeDays.Count == 0)
        {
            return new DashboardStreak { Current = 0, Longest = 0 };
        }

        var longest = 0;
        foreach (var day in activeDays)
        {
            if (activeDays.Contains(day.AddDays(-1)))
            {
                continue; // not the start of a run - it'll be counted from its run's actual start
            }

            var runLength = 0;
            var cursor = day;
            while (activeDays.Contains(cursor))
            {
                runLength++;
                cursor = cursor.AddDays(1);
            }

            longest = Math.Max(longest, runLength);
        }

        var today = DateOnly.FromDateTime(DateTimeOffset.UtcNow.UtcDateTime);
        var mostRecentActiveDay = activeDays.Max();

        var current = 0;
        if (mostRecentActiveDay == today || mostRecentActiveDay == today.AddDays(-1))
        {
            var cursor = mostRecentActiveDay;
            while (activeDays.Contains(cursor))
            {
                current++;
                cursor = cursor.AddDays(-1);
            }
        }

        return new DashboardStreak { Current = current, Longest = longest };
    }

    // The only unique index today is Users.NormalizedName (see AppDbContext), but
    // SqliteExtendedErrorCode 2067 (SQLITE_CONSTRAINT_UNIQUE) fires for ANY unique
    // violation on ANY table. Checking the message for the specific column makes the
    // "duplicate name -> 409" mapping intentional instead of accidental - if a second
    // unique index is ever added elsewhere, this stops matching it by default rather
    // than silently reporting the wrong conflict as a duplicate name.
    private static bool IsDuplicateNameViolation(DbUpdateException ex) =>
        ex.InnerException is SqliteException { SqliteExtendedErrorCode: 2067 } sqliteEx
        && sqliteEx.Message.Contains("Users.NormalizedName", StringComparison.Ordinal);

    // A completely empty body binds the action parameter to null instead of tripping
    // [ApiController]'s automatic "field is required" ModelState error (which would key
    // it by the C# parameter name, e.g. "request" - meaningless to a consumer and leaks
    // an implementation detail). Malformed-but-non-empty JSON still hits the framework
    // default: that's a parse error with no field to map onto, not a field error.
    private static ModelStateDictionary MissingBodyModelState()
    {
        var modelState = new ModelStateDictionary();
        modelState.AddModelError("body", "A request body is required.");
        return modelState;
    }

    private static ModelStateDictionary ToModelState(FluentValidation.Results.ValidationResult validation)
    {
        var modelState = new ModelStateDictionary();
        foreach (var error in validation.Errors)
        {
            modelState.AddModelError(error.PropertyName, error.ErrorMessage);
        }

        return modelState;
    }
}
