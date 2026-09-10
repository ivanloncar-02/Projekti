# 03 — Prompt Library

Prompts in build order. Each one is self-contained enough to paste into a fresh chat.
Attach or paste `01-spec-backend.md` / `02-spec-frontend.md` when the prompt refers to them.

**Standing instruction to prepend to any prompt:**

> Context: I'm building the NEOGOV Fitness Challenge take-home — ASP.NET Core Web API +
> Angular + EF Core/SQLite. I work in VS Code on Windows (PowerShell). Give me code as inline text with
> the target file path above each block, not as a zip. Explain non-obvious decisions in one or
> two sentences, no long essays.

---

## Phase A — Backend foundation

### A1 · Solution scaffold
```
Create the solution scaffold for the Fitness Challenge backend.
I need: the exact dotnet CLI commands to create a solution "FitnessChallenge.sln" with
"FitnessChallenge.Api" (ASP.NET Core Web API, controllers) and "FitnessChallenge.Tests" (xUnit),
wire up the project reference, and add EF Core + SQLite + FluentValidation + Swagger packages.
Then give me appsettings.json with the SQLite connection string and Program.cs with:
DI registration, DbContext on SQLite, Database.Migrate() on startup, CORS policy for
http://localhost:4200, Swagger enabled in Development, and Kestrel on plain HTTP port 5080
(no HTTPS redirect — the Angular proxy targets http://localhost:5080).
Also give me a .gitignore covering .NET and Angular.
```

### A2 · Domain + DbContext
```
[attach 01-spec-backend.md]
Implement the domain model and EF Core layer from section 1 and 2 of the attached spec:
User and Activity entities, ActivityType enum, AppDbContext with configurations,
the case-insensitive unique constraint on the user's first+last name, and a value converter
for DateTimeOffset if SQLite needs one. Use decimal for distance.
Show me the initial migration commands too.
```

### A3 · Scoring service + tests
```
[attach 01-spec-backend.md]
Implement IScoringService / ScoringService per section 5 of the attached spec.
Then write xUnit tests covering every row of the "Required unit test cases" table plus the
flooring boundary cases (1.549999 km, exactly 2.0 km, 59:59, 60:00, 99 steps, 100 steps).
Use [Theory]/[InlineData]. Explain why decimal is used instead of double.
```

### A4 · Request DTOs + validation
```
[attach 01-spec-backend.md]
Implement the POST /api/activities request DTO and its validation per section 4 of the spec.
Requirements:
- FluentValidation validator enforcing the full sport/metric matrix
- duration parsed with regex ^\d{1,4}:[0-5]\d$ into total seconds
- absence of "sport" + presence of "steps" maps to ActivityType.DailySteps
- ValidationProblemDetails with field-level errors on failure
- an unknown sport string must produce 400, not an exception from enum binding
Then write unit tests for the validator: one passing case per activity type and one failing case
per bullet in the "Every one of these returns 400" list.
```

### A5 · Users endpoints
```
[attach 01-spec-backend.md]
Implement UsersController: POST /api/users (201 + { id }, 409 on duplicate name, 400 on invalid)
and GET /api/users returning users with their total points.
Include the name-normalization logic and a race-condition-safe duplicate check
(catch the unique index violation, don't rely on a read-then-write check alone).
```

### A6 · Activities endpoints
```
[attach 01-spec-backend.md]
Implement ActivitiesController: POST /api/activities (validate, map, calculate + store points,
return 201 with { id, points }) and GET /api/activities with userId/from/to/sport filters
and paging. Include the mapping layer from DTO to entity.
```

### A7 · Leaderboard endpoint
```
[attach 01-spec-backend.md]
Implement GET /api/leaderboard?trendWindowDays=7 per section 3.5.
Rank by total points, dense ranking, ties broken by name. Compute previousRank by ranking the
same data restricted to OccurredAt <= now - trendWindowDays, set isNew when the user had no
prior activities, and return rankChange = previousRank - rank.
Write it as a single efficient EF Core query set (or two grouped queries), not N+1 per user,
and show me the generated SQL shape so I can sanity-check it.
```

### A8 · Dashboard aggregates endpoint
```
[attach 01-spec-backend.md]
Implement GET /api/users/{id}/dashboard?from=&to= per section 3.6:
totals, daily points series with gap days filled with zeros, sport breakdown,
current rank, and current/longest daily streak. Return 404 for an unknown user.
```

### A9 · Seed data
```
Write a deterministic database seeder that runs on startup when the DB is empty:
6 users with realistic names, ~200 activities spread across the last 30 days,
each user with a distinct sport profile (a runner, a cyclist, a gym person, a swimmer,
a walker, an all-rounder) so the leaderboard and the sport-breakdown chart both look meaningful.
Fixed Random seed. Points must go through the real scoring service, not be hardcoded.
```

### A10 · API smoke tests
```
Create a requests.http file (REST Client extension format) with requests covering:
register user, duplicate user, valid activity per sport, daily steps, and one invalid request per
validation rule — each with a comment stating the expected status code.
```

---

## Phase B — Frontend

### B1 · Angular + Material scaffold, theme, API client
```
[attach 02-spec-frontend.md]
Give me the CLI commands to scaffold the app with Angular Material per section 1 of the
attached spec, then implement:
- the styles.scss theme per section 2: mat.theme() mixin, color-scheme light dark,
  the app-level and --sport-* custom properties, and the runtime helper that resolves
  CSS variables into real colour values for Chart.js
- TS models mirroring the API contracts
- the three API services (users, activities, leaderboard) with typed HttpClient
- proxy.conf.json + angular.json wiring
- an HTTP error interceptor that surfaces errors through MatSnackBar
- routes for /leaderboard, /dashboard/:userId, /activities/new, /users/new
Import Material components individually as standalone imports, never a catch-all module.
```

### B1b · App shell
```
[attach 02-spec-frontend.md]
Build the app shell per section 6: mat-toolbar with the app name, nav links, and a light/dark
toggle that sets color-scheme on <html> and persists to localStorage. Below 768px the nav
collapses into a mat-menu behind a hamburger icon button. Centred <main> with max-width.
```

### B2 · Leaderboard view
```
[attach 02-spec-frontend.md]
Build the Global Leaderboard view per section 7 of the attached spec:
- custom podium for the top 3 (#1 taller, gradient from --mat-sys-primary-container)
- the rest of the ranking as a custom CSS-grid list, NOT mat-table, so it can collapse to
  stacked cards below 640px
- a reusable rank-trend badge component (up / down / unchanged / NEW) with aria-labels,
  colour must not be the only signal
- mat-button-toggle-group for the 7/30 day window, mat-form-field name filter
- loading, empty and error states
- row click navigates to /dashboard/:userId, keyboard accessible
Style everything with --mat-sys-* tokens. Do not override .mat-mdc-* or .mdc-* classes.
```

### B3 · Dashboard — layout + KPIs
```
[attach 02-spec-frontend.md]
Build the Personal Dashboard shell per section 8 of the attached spec: route param handling,
mat-select user picker, header with rank/points/streak, custom KPI stat cards on a
CSS auto-fit grid, and the activity history table using mat-table with matSort, mat-paginator
and a sport filter (formatted metrics: 5.20 km, 45:30, 8 400 steps).
Below 640px the table becomes a stacked card list. Charts come next — leave placeholders.
```

### B4 · Dashboard — charts
```
[attach 02-spec-frontend.md]
Add the charts to the dashboard using ng2-charts:
1. activity volume over time — line/bar, with mat-button-toggle-groups for metric
   (points / km / minutes) and range (7 / 30 / 90 days)
2. sport breakdown doughnut, legend showing activity count per sport
Colours must come from the --sport-* CSS variables resolved at runtime, grid lines from
--mat-sys-outline-variant, and the charts must re-resolve and update when the colour scheme
flips. maintainAspectRatio: false inside a fixed-height wrapper. Add a visually-hidden text
summary of each chart for screen readers.
```

### B5 · Bonus visualization
```
[attach 02-spec-frontend.md]
Add a GitHub-style activity heatmap for the last 12 weeks to the dashboard:
one cell per day, opacity scaled by points over --mat-sys-primary, matTooltip with
date + points + activity count. Plain CSS grid or inline SVG, no extra dependency.
Must read correctly in both light and dark mode.
```

### B6 · Forms
```
[attach 02-spec-frontend.md]
Build the two forms per section 9 of the attached spec using Angular Material reactive forms:
- register user: two mat-form-fields, success via MatSnackBar, 409 duplicate-name error
  rendered under the field
- log activity: user mat-select, mat-datepicker + time input, sport mat-select including a
  "Daily steps" option, and a metric field that SWAPS reactively based on the selected sport
  (distance number / duration mm:ss / steps integer)
Client-side validation mirroring the backend rules, and server ValidationProblemDetails errors
mapped back onto the matching form controls.
```

### B7 · Polish pass
```
Review my Angular app for: responsiveness at 360/768/1440px, consistent spacing scale,
loading/empty/error coverage on every view, accessibility (labels, focus order, colour not
carrying meaning alone), any remaining `any` types, any place I'm overriding Material's private
.mat-mdc-* / .mdc-* classes instead of using theme tokens or overrides mixins, and any Material
imports that should be narrower. Give me a prioritized list of fixes with diffs, most impactful
first.
```

---

## Phase C — Wrap-up

### C1 · README
```
[attach 05-readme-template.md and 00-project-overview.md]
Write the final README.md for the repo based on the attached template and what we actually built.
Include prerequisites with versions, exact run commands for backend and frontend
(PowerShell syntax, with a note for bash users),
seed data description, the API reference with curl examples, the scoring table,
the validation rules, my design decisions with rationale, what I'd do with more time,
and a place for screenshots.
```

### C2 · Review pass
```
You are a senior .NET reviewer evaluating this take-home. Here is my backend code: [paste].
Point out: correctness gaps against the assignment, anything that would make you reject it,
over-engineering, missing tests, and naming/structure issues. Be blunt and specific.
Rank findings by severity.
```

### C3 · Self-check against the assignment
```
[attach the original assignment PDF and 00-project-overview.md]
Go through the assignment requirement by requirement and tell me, for each one, whether my
implementation satisfies it, partially satisfies it, or misses it. Here is my repo structure
and key files: [paste]. Don't be generous — assume the reviewer is looking for reasons to cut.
```

---

## Handy one-off prompts

- `Explain why my EF Core query for the leaderboard produces N+1 and rewrite it as one query.`
- `My SQLite unique index isn't catching "ivan horvat" vs "Ivan Horvat". Here's my config: [paste].`
- `Convert this validator to a table-driven test with [Theory]/[MemberData].`
- `Why does 1.55m * 50m floor to 77 but my double version gives 78? Show the exact IEEE-754 reason.`
- `Write a GitHub Actions workflow that builds the API, runs the tests, and builds the Angular app.`
- `This Material component doesn't match my theme. Here's the markup: [paste]. Fix it using the overrides mixin, not by targeting .mat-mdc-* classes.`
- `My Chart.js colours don't update when I toggle dark mode. Here's my chart config: [paste].`
