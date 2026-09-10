# 01 — Backend Specification

## 1. Domain model

```csharp
public enum ActivityType { Running, Walking, Cycling, Gym, Swimming, DailySteps }

public class User
{
    public Guid Id { get; private set; }
    public string FirstName { get; private set; } = default!;
    public string LastName  { get; private set; } = default!;

    // Backs the case-insensitive uniqueness constraint. Owned entirely by the
    // factory below so it can never drift out of sync with the name fields;
    // callers only ever see FirstName/LastName (CLAUDE.md rule 10).
    public string NormalizedName { get; private set; } = default!;

    public DateTimeOffset CreatedAt { get; private set; }
    public ICollection<Activity> Activities { get; private set; } = new List<Activity>();

    private User() { }

    public static User Create(string firstName, string lastName)
    {
        firstName = firstName.Trim();
        lastName = lastName.Trim();

        return new User
        {
            Id = Guid.NewGuid(),
            FirstName = firstName,
            LastName = lastName,
            NormalizedName = Normalize(firstName, lastName),
            CreatedAt = DateTimeOffset.UtcNow,
        };
    }

    // "Ivan  Horvat" and " ivan horvat " both normalize to "IVAN HORVAT".
    private static string Normalize(string firstName, string lastName)
    {
        var words = $"{firstName} {lastName}"
            .Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries);
        return string.Join(' ', words).ToUpperInvariant();
    }
}

public class Activity
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public User User { get; set; } = default!;

    public ActivityType Type { get; set; }
    public DateTimeOffset OccurredAt { get; set; }   // stored as UTC

    public decimal? DistanceKm    { get; set; }      // running / walking / cycling
    public int?     DurationSeconds { get; set; }    // gym / swimming
    public int?     Steps         { get; set; }      // daily steps

    public int Points { get; set; }                  // computed & stored at ingestion
    public DateTimeOffset CreatedAt { get; set; }
}
```

**Notes**

- `DailySteps` has no `sport` value in the request payload — the absence of `sport` combined with
  a present `steps` field maps to `ActivityType.DailySteps` in the DTO → domain mapping layer.
- Use `decimal` for distance, **not** `double`. Binary floating point makes the flooring rules
  (`1.55 km × 50 = 77.5 → 77`) fragile and hard to defend in a code review.
- Store times as UTC (`DateTimeOffset`). SQLite has no native date type; EF Core handles the
  conversion, but be explicit with a value converter if the provider complains.

## 2. Database

**Decision: SQLite file + EF Core migrations.** Not `EnsureCreated()` — migrations put the
schema in reviewable source files, and `dotnet-ef` is already installed. Apply them on startup
so the reviewer never has to run a migration command.

Packages:
```
Microsoft.EntityFrameworkCore.Sqlite
Microsoft.EntityFrameworkCore.Design
```

`appsettings.json`:
```json
{
  "ConnectionStrings": {
    "Default": "Data Source=fitness.db"
  }
}
```

`Program.cs`:
```csharp
builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlite(builder.Configuration.GetConnectionString("Default")));

// after building the app:
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();          // creates fitness.db on first run

    var scoring = scope.ServiceProvider.GetRequiredService<IScoringService>();
    await DbSeeder.SeedAsync(db, scoring);   // no-op if the DB already has users
}
```

`DbSeeder.SeedAsync(AppDbContext db, IScoringService scoring, DateTimeOffset? anchor = null,
CancellationToken ct = default)` — it takes the scoring service (so seed points go through the
real calculator), not the whole `IServiceProvider`. The optional `anchor` lets tests pin
"today" for the deterministic trend.

Create the initial migration once:
```powershell
dotnet ef migrations add InitialCreate --project backend/FitnessChallenge.Api
```

Commit the `Migrations/` folder. Add `*.db`, `*.db-shm`, `*.db-wal` to `.gitignore` — the
database file itself must never be committed.

**Case-insensitive uniqueness on the name pair** is enforced through the `NormalizedName`
column (owned by `User.Create()` — see §1), not a raw index on `FirstName`/`LastName`. A
plain index on the raw columns would be case-sensitive on SQLite; `COLLATE NOCASE` was the
alternative, but the normalized column is more portable and keeps the trim/whitespace
handling in one place.

```csharp
modelBuilder.Entity<User>()
    .HasIndex(u => u.NormalizedName)
    .IsUnique();
```

## 3. Endpoints

### 3.1 `POST /api/users`

Request:
```json
{ "firstName": "Ivan", "lastName": "Horvat" }
```

Rules:
- `firstName`, `lastName`: required, non-empty after trim, max 100 chars.
- Case-insensitive uniqueness on the pair.

Responses:
| Status | When | Body |
|---|---|---|
| `201 Created` | success | `{ "id": "…guid…" }` |
| `400 Bad Request` | missing/blank/too long name | ProblemDetails |
| `409 Conflict` | name pair already exists | ProblemDetails |

> The assignment only says the system "should not allow" duplicates. `409` is the semantically
> correct code; if you prefer to keep it simple, `400` is defensible — just document the choice
> in the README.

### 3.2 `GET /api/users`

Returns the user list for the frontend's user picker.
```json
[{ "id": "…", "firstName": "Ivan", "lastName": "Horvat", "totalPoints": 1240 }]
```

### 3.3 `POST /api/activities`

Request schema (exactly as specified in the assignment):
```json
{
  "userId":   "string",
  "datetime": "2026-06-30T10:30:00Z",
  "sport":    "running | walking | cycling | gym | swimming",   // optional
  "steps":    0,        // optional
  "distance": 0.0,      // optional
  "duration": "mm:ss"   // optional
}
```

Responses:
| Status | When |
|---|---|
| `201 Created` | valid — returns `{ id, points }` |
| `400 Bad Request` | any validation failure |

### 3.4 `GET /api/activities?userId=&from=&to=&sport=`

Serves stored fitness data. Paged (`page`, `pageSize`) — the dashboard's history table uses it.

### 3.5 `GET /api/leaderboard?trendWindowDays=7`

```json
[
  {
    "rank": 1,
    "userId": "…",
    "name": "Ivan Horvat",
    "totalPoints": 12450,
    "previousRank": 3,
    "rankChange": 2,          // previousRank - rank; positive = climbed
    "pointsInWindow": 900,
    "isNew": false
  }
]
```

**Trend calculation**: compute the ranking twice from the same activity table —
once over all activities, once over activities with `OccurredAt <= now - trendWindowDays`.
`previousRank` is the user's position in the second ranking; `null` (and `isNew: true`)
if they had no activities before the cutoff. Ties: same rank, then order by name
(use dense ranking so ranks stay 1,2,3…).

### 3.6 `GET /api/users/{id}/dashboard?from=&to=`

```json
{
  "userId": "…",
  "name": "Ivan Horvat",
  "totalPoints": 12450,
  "rank": 1,
  "totals": { "activities": 42, "distanceKm": 128.4, "minutes": 610, "steps": 84000 },
  "daily":  [ { "date": "2026-06-30", "points": 420, "distanceKm": 3.0, "minutes": 24, "steps": 0,
                "activities": 2, "byType": { "running": 300, "gym": 120 } } ],
  "sportBreakdown": [
    { "sport": "running", "activities": 12, "points": 4200, "distanceKm": 42.0 }
  ],
  "streak": { "current": 5, "longest": 11 }
}
```

Fill gap days with zero-point entries server-side so the frontend chart has a continuous x-axis.

**Added in B4:** `daily[]` entries also carry `distanceKm`/`minutes`/`steps` (the same
per-day aggregation `totals` already does over the whole range, just scoped to one day).
The dashboard chart's metric toggle (points/km/minutes) needs real daily values - the
original shape only had `points`, which couldn't feed anything other than a points
chart without reconstructing km/minutes client-side from the scoring rates, which would
have duplicated backend logic and only ever been an approximation.

**Added in B5:** `daily[]` entries also carry `activities` (the count of activities
logged that day). The activity heatmap's tooltip needs "date + points + activity
count" (spec section 8) - `points` alone can't distinguish one big activity from
several small ones on the same day, and nothing else on this DTO counts occurrences
per day (`byType` sums points per sport, not activity counts). The heatmap fetches
this same endpoint with its own fixed 12-week `from`/`to` window, independent of
whatever range the dashboard's chart toggle has selected - see
`docs/02-spec-frontend.md` section 8.

**Decided:** `from`/`to` do not filter every field. `totalPoints`, `rank`, and `streak`
are all-time - they reflect the user's actual leaderboard standing and activity
consistency, not a view scoped to whatever date range happens to be selected. Only
`totals`, `daily`, and `sportBreakdown` are scoped to `[from, to]`. Phase B's date
picker only needs to re-fetch/re-render those three; the header stats and streak badge
don't change when the range changes.

`from`/`to` are plain calendar dates (`DateOnly`), inclusive at both ends, compared as
UTC calendar days per rule 9. Defaults: `to` = today (UTC), `from` = `to - 29 days`
(a 30-day window). `from > to` is a 400.

Streak "current" definition: a full missed UTC day breaks the streak, but not yet
having logged *today* doesn't - if the most recent active day is today or yesterday,
`current` counts the consecutive run ending there; otherwise `current` is 0. A user
with no activities at all gets `{ "current": 0, "longest": 0 }`.

## 4. Validation matrix — this is the part the reviewer will probe

Let `D` = distance, `T` = duration, `S` = steps.

| `sport` | Required | Must be absent | Maps to |
|---|---|---|---|
| `running`, `walking`, `cycling` | `D` | `T`, `S` | Running / Walking / Cycling |
| `gym`, `swimming` | `T` | `D`, `S` | Gym / Swimming |
| *(omitted / null)* | `S` | `D`, `T` | DailySteps |

Every one of these returns **400**:

- `userId` missing, blank, not a GUID, or not an existing user.
- `datetime` missing or not parseable as ISO 8601.
- `sport` present but not one of the five allowed values. **Decided:** the match is
  case-insensitive (`"Running"` resolves), though the assignment only shows lowercase.
- `sport` omitted **and** `steps` omitted (nothing to record).
- The assignment's own example: `sport: "swimming"` with `distance` — wrong metric for the sport.
- Any extra metric alongside the correct one (e.g. `running` + `distance` + `steps`).
- `distance` **negative**, or non-numeric. `distance: 0` is **accepted** and scores 0 points.
- `duration` not matching `^\d{1,4}:[0-5]\d$` (e.g. `"10:75"`, `"90"`, `"1:2:3"` are invalid).
  `"0:00"` is valid and scores 0 points.
- `duration` present with `sport` that expects distance.
- `steps` **negative** or non-integer. `steps: 0` is **accepted** and scores 0 points.
- Empty body / genuinely malformed JSON. Trailing commas and `//` / `/* */` comments are
  **tolerated** (`AllowTrailingCommas` + `ReadCommentHandling = Skip`) — the assignment's own
  "Valid" example carries a trailing comma, and pasting it verbatim must return 201.

**Two 400 shapes reach the client, not one.** Business-rule failures return
`ValidationProblemDetails` keyed by the JSON field name (`userId`, `datetime`, `sport`,
`distance`, `duration`, `steps`) — the shape below. Failures at the System.Text.Json
boundary — a `datetime` string that isn't ISO 8601, a non-numeric `distance`, a non-integer
`steps`, malformed JSON — happen before `CreateActivityRequest` exists and come back
**framework-shaped**, keyed by JSON path (e.g. `$.datetime`); an empty body is keyed `body`.
Both are 400; only the first is field-mappable by a form.

```json
{ "title": "One or more validation errors occurred.", "status": 400,
  "errors": { "distance": ["Distance is not valid for swimming."] } }
```

Decisions recorded in `../README.md` and `DESIGN.md`:
- **Decided:** future `datetime` values are allowed, but rejected (400) if more than 24h
  ahead of the server's current UTC time.
- **Decided:** zero metrics (`distance: 0`, `steps: 0`, `duration: "0:00"`) are accepted and
  score 0. Only a negative `distance`/`steps` is a 400. Earlier drafts recommended rejecting
  `distance <= 0` / `steps <= 0`; that asymmetry with `"0:00"` had no basis and was reversed.
- **Decided (our rule, not the assignment's — its schema states no such constraint):** a
  second DailySteps entry for the same user on the same **UTC calendar day** is rejected
  (400). Deliberately UTC, not the user's local day — `OccurredAt` is stored as UTC and the
  check compares against a `[startOfUtcDay, +1 day)` range on it. Caveat: a user whose local
  day doesn't align with UTC (e.g. UTC+2 logging steps at 01:00 local time) can hit the
  *previous* UTC day and not collide with an entry they'd consider "today." Accepted tradeoff;
  a per-user-timezone definition of "day" was out of scope. A `steps: 0` entry still counts
  as the day's entry for this rule.

## 5. Scoring rules — exact implementation

| Activity | Rate | Formula |
|---|---|---|
| Running | 100 pts / km | `floor(distanceKm * 100)` |
| Walking | 50 pts / km | `floor(distanceKm * 50)` |
| Cycling | 25 pts / km | `floor(distanceKm * 25)` |
| Swimming | 15 pts / min | `floor(totalSeconds / 60) * 15` |
| Gym | 5 pts / min | `floor(totalSeconds / 60) * 5` |
| Daily Steps | 1 pt / 100 steps | `(steps / 100) * 1` (integer division) |

```csharp
public int Calculate(Activity a) => a.Type switch
{
    ActivityType.Running  => (int)Math.Floor(a.DistanceKm!.Value * 100m),
    ActivityType.Walking  => (int)Math.Floor(a.DistanceKm!.Value * 50m),
    ActivityType.Cycling  => (int)Math.Floor(a.DistanceKm!.Value * 25m),
    ActivityType.Swimming => (a.DurationSeconds!.Value / 60) * 15,
    ActivityType.Gym      => (a.DurationSeconds!.Value / 60) * 5,
    ActivityType.DailySteps => a.Steps!.Value / 100,
    _ => throw new ArgumentOutOfRangeException()
};
```

Integer division in C# already truncates toward zero, which equals `floor` for non-negative
values — that is why `/ 60` and `/ 100` need no explicit `Math.Floor`.

### Required unit test cases

| Input | Expected |
|---|---|
| Walking 1.55 km | 77 (77.5 floored) |
| Running 42.195 km | 4219 (4219.5 floored) |
| Cycling 0.039 km | 0 |
| Gym `"1:55"` | 5 (1 completed minute × 5) |
| Swimming `"0:59"` | 0 |
| Swimming `"90:30"` | 1350 (90 min × 15) |
| Steps 399 | 3 |
| Steps 99 | 0 |
| Steps 100000 | 1000 |

Add the flooring boundary cases: `1.549999`, `2.0`, `"59:59"`, `"60:00"`.

## 6. Cross-cutting

- **CORS**: named policy allowing `http://localhost:4200`.
- **HTTP in development**: run Kestrel on plain `http://localhost:5080`. No dev certificate to
  trust, identical behaviour on Windows, macOS and Linux, and the reviewer never sees a browser
  certificate warning. Say so in the README. The Angular dev proxy targets this port.
- **Swagger/OpenAPI**: enable it. It is free credibility and lets the reviewer test without Postman.
- **Request JSON leniency**: `AddControllers().AddJsonOptions(...)` sets
  `AllowTrailingCommas = true` and `ReadCommentHandling = JsonCommentHandling.Skip`. The
  assignment's own "Valid" example JSON carries a trailing comma; a reviewer who pastes an
  example verbatim must get 201, not a parse error. See §4 for how this interacts with the
  "malformed JSON → 400" rule.
- **Seeding**: on startup, if the DB is empty, create ~6 users and ~200 activities spread over the
  last 30 days so the leaderboard and charts look alive. Keep the seeder deterministic
  (fixed `Random` seed).
- **Logging**: default `ILogger` is enough. Don't over-engineer.
