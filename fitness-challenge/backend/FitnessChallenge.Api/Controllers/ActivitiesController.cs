using FitnessChallenge.Api.Data;
using FitnessChallenge.Api.Dtos;
using FitnessChallenge.Api.Models;
using FitnessChallenge.Api.Services;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;

namespace FitnessChallenge.Api.Controllers;

[ApiController]
[Route("api/activities")]
public class ActivitiesController : ControllerBase
{
    private const int DefaultPageSize = 20;
    private const int MaxPageSize = 100;

    private readonly AppDbContext _db;
    private readonly IValidator<CreateActivityRequest> _validator;
    private readonly IScoringService _scoring;

    public ActivitiesController(AppDbContext db, IValidator<CreateActivityRequest> validator, IScoringService scoring)
    {
        _db = db;
        _validator = validator;
        _scoring = scoring;
    }

    [HttpPost]
    [ProducesResponseType(typeof(CreateActivityResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create(CreateActivityRequest? request, CancellationToken ct)
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

        var type = ActivityTypeResolver.Resolve(request.Sport, request.Steps);
        var durationSeconds = request.Duration is not null && DurationParser.TryParse(request.Duration, out var seconds)
            ? seconds
            : (int?)null;

        var activity = new Activity
        {
            Id = Guid.NewGuid(),
            UserId = Guid.Parse(request.UserId!),
            Type = type,
            OccurredAt = request.Datetime!.Value,
            DistanceKm = request.Distance,
            DurationSeconds = durationSeconds,
            Steps = request.Steps,
            CreatedAt = DateTimeOffset.UtcNow,
        };
        activity.Points = _scoring.Calculate(activity);

        _db.Activities.Add(activity);
        await _db.SaveChangesAsync(ct);

        var response = new CreateActivityResponse { Id = activity.Id, Points = activity.Points };
        return CreatedAtAction(nameof(GetById), new { id = activity.Id }, response);
    }

    // "sport" accepts all six type names here, including "steps" for Daily Steps -
    // unlike POST, where a literal sport value for Daily Steps is rejected (it's only
    // ever reached there by omitting sport). That asymmetry is deliberate: this is a
    // read filter, not a write payload, and a consumer filtering "give me all Daily
    // Steps entries" has no other value to pass. "steps" is the ONLY accepted spelling
    // for it - it's exactly what sportBreakdown/daily.byType return (see
    // ActivityTypeResolver.ToSportName), and this is a fresh API with no consumers to
    // stay compatible with, so there's no reason to also accept "dailysteps".
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<ActivityResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ValidationProblemDetails), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetAll(
        [FromQuery] Guid? userId,
        [FromQuery] DateTimeOffset? from,
        [FromQuery] DateTimeOffset? to,
        [FromQuery] string? sport,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = DefaultPageSize,
        CancellationToken ct = default)
    {
        ActivityType? type = null;
        if (!string.IsNullOrWhiteSpace(sport))
        {
            if (!ActivityTypeResolver.TryParseFilterSport(sport, out var parsed))
            {
                var modelState = new ModelStateDictionary();
                modelState.AddModelError("sport", $"'{sport}' is not a recognized sport.");
                return ValidationProblem(modelState);
            }

            type = parsed;
        }

        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > MaxPageSize ? DefaultPageSize : pageSize;

        var query = _db.Activities.AsQueryable();
        if (userId.HasValue)
        {
            query = query.Where(a => a.UserId == userId.Value);
        }

        if (from.HasValue)
        {
            query = query.Where(a => a.OccurredAt >= from.Value);
        }

        if (to.HasValue)
        {
            query = query.Where(a => a.OccurredAt <= to.Value);
        }

        if (type.HasValue)
        {
            query = query.Where(a => a.Type == type.Value);
        }

        var totalCount = await query.CountAsync(ct);

        // Materialize first, then map Type -> lowercase sport name in memory. Enum
        // .ToString() inside the LINQ-to-SQL projection isn't reliably translatable
        // across providers - safer not to gamble on it.
        var rows = await query
            .OrderByDescending(a => a.OccurredAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var items = rows.Select(a => new ActivityResponse
        {
            Id = a.Id,
            UserId = a.UserId,
            Sport = a.Type == ActivityType.DailySteps ? null : ActivityTypeResolver.ToSportName(a.Type),
            Datetime = a.OccurredAt,
            Distance = a.DistanceKm,
            DurationSeconds = a.DurationSeconds,
            Steps = a.Steps,
            Points = a.Points,
        }).ToList();

        return Ok(new PagedResult<ActivityResponse>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
        });
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ActivityResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var activity = await _db.Activities.FirstOrDefaultAsync(a => a.Id == id, ct);
        if (activity is null)
        {
            return NotFound();
        }

        return Ok(new ActivityResponse
        {
            Id = activity.Id,
            UserId = activity.UserId,
            Sport = activity.Type == ActivityType.DailySteps ? null : ActivityTypeResolver.ToSportName(activity.Type),
            Datetime = activity.OccurredAt,
            Distance = activity.DistanceKm,
            DurationSeconds = activity.DurationSeconds,
            Steps = activity.Steps,
            Points = activity.Points,
        });
    }

    // See UsersController.MissingBodyModelState for why this is nullable+manual rather
    // than relying on [ApiController]'s automatic "field is required" ModelState error.
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
