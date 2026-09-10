# 05 — README Template

Copy this into the repo root as `README.md` and fill in the brackets. The README is a graded
deliverable: it is often the only thing a reviewer reads in full.

---

```markdown
# Fitness Challenge

A full-stack application that gamifies physical activity. Activities across six sport types are
normalized into a single points metric so users can compete on one global leaderboard, with a
personal dashboard for individual trends.

![Leaderboard](docs/screenshots/leaderboard.png)
![Dashboard](docs/screenshots/dashboard.png)

## Stack

- **Backend**: ASP.NET Core Web API (.NET 8), EF Core, SQLite
- **Frontend**: Angular 22, Angular Material, Chart.js via ng2-charts
- **Tests**: xUnit

## Prerequisites

- .NET SDK 8.0 or later — `dotnet --list-sdks`
- Node.js 24.15+ (or 22.22.3+) — `node --version`
- Angular CLI 22 — `npm install -g @angular/cli`

Developed against .NET SDK 8.0.303, Node 24.19.0, Angular CLI 22.1.7.

## Running locally

### Backend
```bash
cd backend
dotnet restore
dotnet run --project FitnessChallenge.Api
```
API: <http://localhost:5080> · Swagger: <http://localhost:5080/swagger>

The SQLite database is created automatically on first run and seeded with [n] users and
[n] activities across the last 30 days.

### Frontend
```bash
cd frontend/fitness-challenge-web
npm install
npm start
```
App: <http://localhost:4200>

### Tests
```bash
cd backend && dotnet test
```

## API

### `POST /api/users`
Registers a user. First + last name must be unique.
```bash
curl -X POST http://localhost:5080/api/users \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Ivan","lastName":"Horvat"}'
# 201 -> { "id": "..." }
```

### `POST /api/activities`
Ingests one activity. Points are computed and stored at ingestion.
```bash
curl -X POST http://localhost:5080/api/activities \
  -H "Content-Type: application/json" \
  -d '{"userId":"...","datetime":"2026-06-30T10:30:00Z","sport":"running","distance":42.195}'
# 201 -> { "id": "...", "points": 4219 }
```

### `GET /api/activities` · `GET /api/leaderboard` · `GET /api/users/{id}/dashboard`
See Swagger for parameters and response shapes.

## Scoring

| Activity | Rate | Rounding |
|---|---|---|
| Running | 100 pts / km | floor to whole point |
| Walking | 50 pts / km | floor to whole point |
| Cycling | 25 pts / km | floor to whole point |
| Swimming | 15 pts / min | floor to whole minute first |
| Gym | 5 pts / min | floor to whole minute first |
| Daily Steps | 1 pt / 100 steps | floor to whole block of 100 |

Examples: 1.55 km walking → 77 pts · 1:55 in the gym → 5 pts · 399 steps → 3 pts.

## Validation

Each sport accepts exactly one metric; anything else returns `400 Bad Request`.

| `sport` | Required field | Rejected fields |
|---|---|---|
| running, walking, cycling | `distance` (km, decimal > 0) | `duration`, `steps` |
| gym, swimming | `duration` (`mm:ss`) | `distance`, `steps` |
| *(omitted)* | `steps` (integer > 0) | `distance`, `duration` |

Also rejected: unknown sport values, malformed ISO 8601 datetimes, unknown `userId`,
`duration` outside `^\d{1,4}:[0-5]\d$`, and payloads carrying no metric at all.

## Design decisions

- **`decimal` for distance** — binary floating point breaks the flooring rule at the boundaries
  (`1.55 × 50` must floor to 77, not round to 78).
- **Points persisted at ingestion** — the assignment requires storing them, and it keeps the
  leaderboard query a simple aggregate rather than a recomputation.
- **Rank trend** — the leaderboard is ranked twice from the same data, once over everything and
  once over activities older than the trend window; the difference is the trend.
- **SQLite over In-Memory** — data survives restarts, so the reviewer can explore a populated app.
- **HTTP only in development** — no dev certificate to trust, so the app runs identically on
  any OS and you get no browser certificate warning. The Angular dev proxy forwards `/api` to
  `http://localhost:5080`.
- **[Your other decisions here]**

## What I'd do with more time

- Authentication and per-user sessions instead of a user picker
- Integration tests with `WebApplicationFactory` alongside the unit tests
- Rank-history snapshots for a true rank-over-time chart
- Pagination and virtual scrolling on the leaderboard for large datasets
- Docker Compose for a one-command run

## Project structure

\`\`\`
backend/
  FitnessChallenge.Api/     # controllers, DTOs, validators, scoring, EF Core
  FitnessChallenge.Tests/   # scoring + validation unit tests
frontend/
  fitness-challenge-web/    # Angular app
docs/                       # screenshots, notes
\`\`\`
```

---

## Notes on the README

- Screenshots do disproportionate work. Take three: leaderboard, dashboard, activity form.
- The "Design decisions" and "What I'd do with more time" sections are what separate a passing
  submission from a memorable one — they show judgement rather than just execution.
- Keep the run instructions copy-pasteable. If the reviewer hits a snag in the first two minutes,
  the rest of the code barely matters.
