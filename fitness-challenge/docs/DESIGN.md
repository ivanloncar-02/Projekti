# Fitness Challenge — design notes

Reference material and reasoning that doesn't belong in the run-the-app README: the full API surface,
the seed data model, why each non-obvious decision was made, and the two limitations worth knowing
about. For setup and the assignment's scoring/validation rules, see [../README.md](../README.md).

## API

Base URL `http://localhost:5080`. Full request/response shapes are in Swagger. Every endpoint and
every validation branch below can also be exercised from **`../backend/requests.http`** — a
top-to-bottom script for VS Code's REST Client extension that captures ids from earlier responses
into variables, so no GUID needs hand-editing and no Postman collection is required.

### `POST /api/users`

Registers a user. The first + last name pair is unique, case-insensitively.

```bash
curl -X POST http://localhost:5080/api/users \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Petar","lastName":"Novosel"}'
# 201 -> { "id": "..." }
# 400 -> ValidationProblemDetails (blank / >100 chars)
# 409 -> ProblemDetails  (name pair already exists)
```

### `GET /api/users`

The user list the frontend's picker is built from.

```bash
curl http://localhost:5080/api/users
# 200 -> [ { "id": "...", "firstName": "Ana", "lastName": "Novak", "totalPoints": 25476 }, ... ]
```

### `GET /api/users/{id}`

```bash
curl http://localhost:5080/api/users/00000000-0000-0000-0000-000000000000
# 200 -> { id, firstName, lastName, totalPoints }   |   404 if unknown
```

### `POST /api/activities`

Ingests one activity. Points are computed and stored at ingestion. `sport` is one of
`running | walking | cycling | gym | swimming`, or **omitted entirely** for Daily Steps.

```bash
# Running: 100 pts/km
curl -X POST http://localhost:5080/api/activities \
  -H "Content-Type: application/json" \
  -d '{"userId":"<id>","datetime":"2026-09-08T09:00:00Z","sport":"running","distance":5.0}'
# 201 -> { "id": "...", "points": 500 }

# Daily Steps: 1 pt / 100 steps — note there is no "sport" field
curl -X POST http://localhost:5080/api/activities \
  -H "Content-Type: application/json" \
  -d '{"userId":"<id>","datetime":"2026-09-08T20:00:00Z","steps":8000}'
# 201 -> { "id": "...", "points": 80 }
```

### `GET /api/activities`

Paged, always ordered `OccurredAt` descending. `page` defaults to 1, `pageSize` to 20 (max 100).

```bash
curl "http://localhost:5080/api/activities?userId=<id>&sport=running&from=2026-09-01&to=2026-09-30&page=1&pageSize=10"
# 200 -> { "items": [ { id, userId, sport, datetime, distance, durationSeconds, steps, points } ],
#          "page": 1, "pageSize": 10, "totalCount": 7 }
```

`sport` here also accepts `steps` (for Daily Steps) — that is a read filter, not a write payload.

### `GET /api/activities/{id}`

```bash
curl http://localhost:5080/api/activities/<id>
# 200 -> single activity   |   404 if unknown
```

### `GET /api/leaderboard`

```bash
curl "http://localhost:5080/api/leaderboard?trendWindowDays=7"
# 200 -> [ { "rank": 1, "userId": "...", "name": "Luka Perić", "totalPoints": 27220,
#            "previousRank": 5, "rankChange": 4, "pointsInWindow": 15753, "isNew": false }, ... ]
```

`trendWindowDays` defaults to 7. The ranking is computed twice from the same activity table — once
over everything, once over activities older than the cutoff — and `rankChange = previousRank - rank`
(positive means climbed). `previousRank` is `null` with `isNew: true` for a user who had no activity
before the cutoff. Point totals in these examples are from one seeded run; because the seeder anchors
to the current date, the exact figures shift from run to run while the ranking structure does not
(Luka is always 27,220 and always climbs to #1).

### `GET /api/users/{id}/dashboard`

```bash
curl "http://localhost:5080/api/users/<id>/dashboard?from=2026-09-01&to=2026-09-09"
# 200 -> { userId, name,
#          totalPoints, rank, streak: { current, longest },        # all-time, NOT scoped by from/to
#          totals: { activities, distanceKm, minutes, steps },      # scoped to [from, to]
#          daily: [ { date, points, distanceKm, minutes, steps, activities, byType } ],  # scoped, gap-filled
#          sportBreakdown: [ { sport, activities, points, distanceKm } ] }               # scoped
```

`from`/`to` default to the last 30 days. `from > to` returns 400.

### The two validation error shapes

Business-rule failures return a `ValidationProblemDetails` keyed by the JSON field name (`userId`,
`datetime`, `sport`, `distance`, `duration`, `steps`) so a form can map each message onto its
control. Failures at the JSON deserialization boundary — a non-ISO `datetime` string, a non-numeric
`distance`, malformed JSON — happen before the request object exists and come back framework-shaped,
keyed by JSON path; an empty body is reported under the key `body`. The frontend maps whatever it
recognizes onto form controls and shows anything else as a form-level message.

## Seed data

On first run the seeder creates **6 users** and **~200 activities** spread over the **last 30 days**
(day offsets 0–29; the day exactly on the 7-day trend-window boundary is skipped so the
recent/older split never depends on the anchor's time of day).

| User | Sport profile |
|---|---|
| Ana Novak | Running |
| Marko Kovačević | Cycling |
| Petra Babić | Gym |
| Ivan Horvat | Swimming |
| Marija Jurić | Walking |
| Luka Perić | All six sports |

The seeder uses a fixed `Random(42)` seed, so the **relative** pattern — who logs what, how often,
how many days before the run date, how large each session is — is identical on every run. It is
**not** pinned to fixed calendar dates: everything anchors to the current UTC date so the leaderboard
and charts always look recent whenever the app is started. Points are always computed through the
real scoring service, never hard-coded, so the seed data doubles as an end-to-end scoring check.
Daily Steps entries are capped at one per user per UTC day, mirroring the API rule.

**What the trend shows.** Luka logs sparsely for most of the window, then surges in the final 7 days
— more than three times as often and about 1.8× the session size — and climbs from mid-table to
**#1 (+4)**. Everyone he passes drops exactly one rank as a result; Ana, who was #1, becomes #2.
Ana is near-idle in that final week too, so her points-in-window figure is small, but her single-rank
slip is Luka overtaking her rather than the rest of the field catching up. Marija, already last,
does not move.

## Design decisions

**`decimal`, not `double`, for distance.** The assignment states the arithmetic in exact decimal:
1.55 km walking is `1.55 × 50 = 77.5`, floored to 77. `1.55` has no exact binary representation, so
in `double` the product lands a hair to one side of `77.5` — and a floor at a value that is supposed
to be exactly `.5` is precisely where that hair decides 77 versus 78. Computing in `decimal` keeps
the implementation's arithmetic identical to the spec's, so the boundary cases in the tests
(`1.55 → 77`, `1.549999 → 77`, `42.195 → 4219`) are exact rather than "rounds correctly on this
runtime."

**Points are calculated and stored at ingestion.** The assignment requires storing them, and it
keeps the leaderboard a plain `SUM(points)` aggregate rather than a per-request recomputation of
every user's entire history.

**`NormalizedName` is owned by the `User` entity.** The case-insensitive uniqueness key is set only
inside `User.Create()`, behind a private setter — no controller or service can populate it, so it
can never drift out of sync with the display name. A unique index enforces the constraint at the
database level; the controller catches the resulting `DbUpdateException` and returns **409 Conflict**.
`409` is the semantically correct code for "this resource already exists"; `400` would be defensible
too, but 409 lets a client tell "you sent something malformed" apart from "that name is taken."

**UTC calendar days for Daily Steps and streaks.** `OccurredAt` is stored as a UTC
`DateTimeOffset`. "The same day" — both for rejecting a duplicate Daily Steps entry and for counting
a streak — means the UTC calendar day the timestamp falls in, compared as a `[startOfUtcDay, +1 day)`
range. This is simple and consistent, but it has a caveat worth stating: a user in, say, UTC+2 who
logs steps at 01:00 local time lands on the *previous* UTC day, and could record what they consider
"today's" entry without colliding with one they logged earlier. A per-user-timezone definition of
"day" was out of scope for a take-home; this is the accepted trade-off.

**All-time versus windowed dashboard fields.** The dashboard's `from`/`to` scope only `totals`,
`daily`, and `sportBreakdown`. `totalPoints`, `rank`, and `streak` are always all-time. A date filter
that changed your leaderboard rank or reset your streak display would surprise a consumer who assumes
the range filters everything — so the header stats stay fixed, and the frontend's 7/30/90-day range
toggle re-fetches only the three windowed fields. The dashboard screenshot in the README shows this
directly: Luka's all-time total is 27,220, but the KPI row for a 7-day window reads 15,753.

**Future datetimes are allowed, up to 24 hours out.** Logging a session slightly in the future is
plausible (clock skew, pre-logging a planned workout). More than 24 hours ahead is almost certainly a
client bug or a typo, so it is rejected.

**One Daily Steps entry per user per UTC day.** This is our rule, not the assignment's — the
assignment's schema places no uniqueness constraint on Daily Steps. "Daily" means one per day, and a
second submission for the same day is nearly always an accidental re-send. Distance and duration
sports have no such cap; you can legitimately run twice in a day. A `steps: 0` entry still counts as
the day's entry for this rule.

**Zero-value metrics are accepted; only negatives are rejected.** `distance: 0`, `steps: 0`, and
`duration: "0:00"` all pass validation and score 0 points — the assignment's flooring rules already
produce 0 for sub-threshold values (399 steps → 3, 50 steps → 0), and the scoring service is
unit-tested against zeros. Rejecting `distance: 0` while accepting `duration: "0:00"` had no principled
basis, so all three behave the same now. A negative `distance` or `steps` is still a 400 — that is a
malformed value, not a legitimately tiny one.

**Trailing commas and comments in request JSON are tolerated.** `AllowTrailingCommas` and
`ReadCommentHandling = Skip` are set on the JSON options because the assignment's own "Valid" example
JSON carries a trailing comma, and a reviewer who pastes an example verbatim should get a 201, not a
parse error.

**Ranking is computed in application code, not SQL.** `DenseRanker` ranks a materialized list of
users in memory; the endpoint issues three fixed queries regardless of how many users exist, never
one per user. It is easy to read and correct at this scale. A production system with a large user
base would push `DENSE_RANK() OVER (...)` into the query instead. The frontend follows the same
"fine at this scale" logic: the leaderboard's name filter is applied client-side over the full list,
and the dashboard's activity-history table does its own sorting, paging, and filtering client-side
(see **Known limitations**).

**SQLite over EF Core In-Memory.** The assignment allows either. A file-backed database survives a
restart, so a reviewer opens a populated app instead of an empty one, and the seed data is real
persisted rows rather than an in-process fixture.

**`DateTimeOffset` needs a value converter.** SQLite has no native `DateTimeOffset`, and without
`UtcDateTimeOffsetConverter` (registered globally in `ConfigureConventions`) it throws
`NotSupportedException` on `ORDER BY` over a `DateTimeOffset` column — which the leaderboard trend
query depends on.

## Known limitations

**The activity-history table fetches one page of up to 100 rows and sorts / pages / filters
client-side.** `GET /api/activities` has no sort parameter — it always returns `OccurredAt`
descending — so `matSort` could never have been forwarded to the server anyway. For a user with more
than 100 activities the rest would be silently excluded from this view, and the paginator would
report the fetched count as though it were the whole dataset. The seeded users stay well under 100
each. A correct fix needs a sort parameter on the backend (server-side sort + page) or batched
fetching.

**The streak calculation loads every one of a user's activity timestamps.** The streak is all-time
and independent of `from`/`to`, so it runs its own query over the user's full history (timestamps
only, not full rows). Every other query on the dashboard is bounded by the user count or the selected
date range; this one grows with a user's lifetime activity count. It is fine at take-home scale; a
heavy user would eventually want this pushed into SQL — for example a materialized "active days per
user" table updated at ingestion.

## What I'd do with more time

Authentication and per-user sessions would replace the user picker — the picker exists only so the
API can be demonstrated without a login flow. On the backend I'd add `WebApplicationFactory`
integration tests alongside the unit tests, a sort parameter on `GET /api/activities` so the history
table can page server-side, and a materialized active-days table so the streak query stops scanning
full history. On the frontend I'd add rank-history snapshots to drive a real rank-over-time chart
(right now "trend" is a single before/after delta), and the activity heatmap card could scale its
cells to fill the available width on desktop rather than sitting left-aligned. A Docker Compose file
would make the whole thing a one-command run.

## Project structure

```
fitness-challenge/
├── README.md
├── docs/
│   ├── DESIGN.md                 # this file
│   └── screenshots/
├── backend/
│   ├── FitnessChallenge.sln
│   ├── requests.http             # REST Client script — every endpoint + every validation branch
│   ├── FitnessChallenge.Api/     # controllers, DTOs, FluentValidation validators, scoring, EF Core, seeder
│   └── FitnessChallenge.Tests/   # xUnit: scoring, validation matrix, dashboard, seeder determinism
└── frontend/
    └── fitness-challenge-web/    # Angular app — leaderboard, dashboard, forms; lazy-loaded routes
```
