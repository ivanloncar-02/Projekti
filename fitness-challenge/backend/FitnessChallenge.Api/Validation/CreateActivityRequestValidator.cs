using FitnessChallenge.Api.Data;
using FitnessChallenge.Api.Dtos;
using FitnessChallenge.Api.Models;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace FitnessChallenge.Api.Validation;

public class CreateActivityRequestValidator : AbstractValidator<CreateActivityRequest>
{
    private readonly AppDbContext _db;

    public CreateActivityRequestValidator(AppDbContext db)
    {
        _db = db;

        // Rules are declared cheapest-first, and ClassLevelCascadeMode = Stop means a
        // failure in an earlier rule skips every rule after it - so a request that's
        // already invalid for a free, in-memory reason (bad datetime, bad metric
        // matrix) never reaches the two rules that hit the database (UserId's
        // existence check, then the Daily Steps duplicate check, which additionally
        // needs a *confirmed-existing* user to mean anything).
        ClassLevelCascadeMode = CascadeMode.Stop;

        RuleFor(x => x.Datetime)
            .Cascade(CascadeMode.Stop)
            .NotNull().WithMessage("Date and time is required.").OverridePropertyName("datetime")
            .Must(BeWithinAllowedFutureWindow).WithMessage("Date and time must not be more than 24 hours in the future.");

        RuleFor(x => x).Custom(ValidateMetric);

        // OverridePropertyName keeps the error dictionary keyed by the same camelCase
        // names as the JSON request body (userId, datetime, ...), matching the
        // lowercase literals used in the custom metric-matrix rule above.
        RuleFor(x => x.UserId)
            .Cascade(CascadeMode.Stop)
            .NotEmpty().WithMessage("User is required.").OverridePropertyName("userId")
            .Must(id => Guid.TryParse(id, out _)).WithMessage("User must be a valid identifier.")
            .MustAsync(UserExistsAsync).WithMessage("User does not exist.");

        RuleFor(x => x).CustomAsync(ValidateNoDuplicateDailySteps);
    }

    private async Task<bool> UserExistsAsync(string? userId, CancellationToken ct)
    {
        var id = Guid.Parse(userId!);
        return await _db.Users.AnyAsync(u => u.Id == id, ct);
    }

    private static bool BeWithinAllowedFutureWindow(DateTimeOffset? datetime) =>
        datetime is null || datetime.Value <= DateTimeOffset.UtcNow.AddHours(24);

    // Resolves the intended ActivityType first, then dispatches to a small per-type
    // check - keeps each branch focused on just its own required/forbidden metrics.
    private static void ValidateMetric(CreateActivityRequest request, ValidationContext<CreateActivityRequest> context)
    {
        if (string.IsNullOrWhiteSpace(request.Sport))
        {
            ValidateDailySteps(request, context);
            return;
        }

        if (!ActivityTypeResolver.TryParseSport(request.Sport, out var type))
        {
            context.AddFailure("sport", $"'{request.Sport}' is not a recognized sport.");
            return;
        }

        if (request.Steps.HasValue)
        {
            context.AddFailure("steps", $"Steps is not valid for {request.Sport}.");
        }

        switch (type)
        {
            case ActivityType.Running:
            case ActivityType.Walking:
            case ActivityType.Cycling:
                ValidateDistanceSport(request, context);
                break;
            case ActivityType.Gym:
            case ActivityType.Swimming:
                ValidateDurationSport(request, context);
                break;
        }
    }

    private static void ValidateDailySteps(CreateActivityRequest request, ValidationContext<CreateActivityRequest> context)
    {
        if (!request.Steps.HasValue)
        {
            // Kept under "sport" (rather than a body-level key) because the frontend's
            // sport select is where a Daily Steps entry gets chosen from - see A6 plan.
            context.AddFailure("sport", "Either sport or steps is required.");
            return;
        }

        if (request.Distance.HasValue)
        {
            context.AddFailure("distance", "Distance is not valid for Daily Steps.");
        }

        if (!string.IsNullOrWhiteSpace(request.Duration))
        {
            context.AddFailure("duration", "Duration is not valid for Daily Steps.");
        }

        // 0 is accepted and scores 0 points (399 steps -> 3, 50 steps -> 0, 0 -> 0),
        // matching how duration "0:00" already behaves. Only a negative count is a
        // malformed value.
        if (request.Steps < 0)
        {
            context.AddFailure("steps", "Steps must not be negative.");
        }
    }

    private static void ValidateDistanceSport(CreateActivityRequest request, ValidationContext<CreateActivityRequest> context)
    {
        if (!string.IsNullOrWhiteSpace(request.Duration))
        {
            context.AddFailure("duration", $"Duration is not valid for {request.Sport}.");
        }

        if (!request.Distance.HasValue)
        {
            context.AddFailure("distance", $"Distance is required for {request.Sport}.");
        }
        else if (request.Distance < 0)
        {
            // 0 is accepted and scores 0 points, matching duration "0:00" / steps 0.
            // Only a negative distance is a malformed value.
            context.AddFailure("distance", "Distance must not be negative.");
        }
    }

    private static void ValidateDurationSport(CreateActivityRequest request, ValidationContext<CreateActivityRequest> context)
    {
        if (request.Distance.HasValue)
        {
            context.AddFailure("distance", $"Distance is not valid for {request.Sport}.");
        }

        if (string.IsNullOrWhiteSpace(request.Duration))
        {
            context.AddFailure("duration", $"Duration is required for {request.Sport}.");
        }
        else if (!DurationParser.TryParse(request.Duration, out _))
        {
            context.AddFailure("duration", "Duration must match mm:ss (e.g. 45:30), with seconds 00-59.");
        }
    }

    // Only reached once Datetime, the metric matrix, and UserId have all already
    // passed - so Sport is blank, Steps is present and non-negative, and UserId is a
    // real user. A steps:0 entry still counts as "a Daily Steps entry for that day"
    // for the one-per-day rule below. "Same day" is deliberately the UTC calendar day
    // OccurredAt falls in, not the user's local day (see docs/DESIGN.md): a user whose
    // local day doesn't align with UTC can log steps that land in the previous UTC day
    // and not collide with what they'd consider "today's" entry. Accepted tradeoff.
    private async Task ValidateNoDuplicateDailySteps(
        CreateActivityRequest request,
        ValidationContext<CreateActivityRequest> context,
        CancellationToken ct)
    {
        if (!string.IsNullOrWhiteSpace(request.Sport) || !request.Steps.HasValue || request.Steps < 0)
        {
            return;
        }

        if (!Guid.TryParse(request.UserId, out var userId) || request.Datetime is null)
        {
            return;
        }

        var startOfUtcDay = new DateTimeOffset(request.Datetime.Value.UtcDateTime.Date, TimeSpan.Zero);
        var endOfUtcDay = startOfUtcDay.AddDays(1);

        var alreadyLogged = await _db.Activities.AnyAsync(
            a => a.UserId == userId
                && a.Type == ActivityType.DailySteps
                && a.OccurredAt >= startOfUtcDay
                && a.OccurredAt < endOfUtcDay,
            ct);

        if (alreadyLogged)
        {
            context.AddFailure("steps", "A Daily Steps entry already exists for this user on this date.");
        }
    }
}
