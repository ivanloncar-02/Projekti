# 00 — Project Overview: NEOGOV Fitness Challenge

> Master context file. Paste this (or link it) at the start of any new AI chat about this project.

## What is being built

A full-stack **Fitness Challenge** app that gamifies physical activity. Users log activities
from different sports, the backend normalizes every activity into a single **Points** metric,
and users compete on a **global leaderboard**. Each user also gets a **personal dashboard**
with charts of their activity over time and a breakdown of preferred sports.

## Mandated tech stack (from the assignment)

| Layer | Technology |
|---|---|
| Backend | C# / ASP.NET Core Web API |
| Frontend | Angular |
| Database | Relational — SQLite or In-Memory |

## Chosen stack details (my decisions — adjust if needed)

- **.NET**: SDK 8.0.303, target framework `net8.0`.
- **Angular**: CLI 22.1.7 on Node 24.19.0. Standalone components, new control flow syntax.
- **Persistence**: EF Core + **SQLite** file (`fitness.db`), schema created by **migrations**
  applied on startup. SQLite over In-Memory so data survives a restart and the reviewer can
  explore a populated app. Connection string and startup wiring in `01-spec-backend.md` §2.
- **Validation**: FluentValidation (or manual validation in the endpoint — both are acceptable,
  FluentValidation reads better and is easier to unit test).
- **API style**: Minimal APIs or Controllers. Controllers are the safer, more conventional choice
  for a take-home reviewed by an enterprise team.
- **Tests**: xUnit + FluentAssertions. Scoring logic and request validation must be unit tested —
  that is the part reviewers actually read.
- **Frontend**: Angular CLI project, standalone components, typed `HttpClient` services,
  `ng2-charts` (Chart.js wrapper) for charts.
- **Styling**: **Angular Material** for components (table, forms, toolbar, datepicker, snackbar)
  plus a thin custom SCSS layer for the podium, KPI cards, rank-trend badges and heatmap.
  The custom pieces consume Material's `--mat-sys-*` design tokens, so both halves share one
  colour source and light/dark mode works everywhere for free. Never override `.mat-mdc-*`
  or `.mdc-*` classes — use the theme mixin and component `overrides` mixins instead.
- **Repo layout**: single Git repo, two top-level folders.

```
fitness-challenge/
├── README.md
├── .editorconfig
├── .gitignore
├── docs/                    # these md files
├── backend/
│   ├── FitnessChallenge.sln
│   ├── FitnessChallenge.Api/
│   └── FitnessChallenge.Tests/
└── frontend/
    └── fitness-challenge-web/
```

## Deliverables (assignment)

1. Public Git repository with the full solution.
2. `README.md` explaining how to run the application locally.

## Definition of done — checklist

### Backend
- [ ] `POST /api/users` accepts `{ firstName, lastName }`, returns the new user id.
- [ ] Duplicate first+last name combination is rejected.
- [ ] `POST /api/activities` accepts the assignment's JSON schema.
- [ ] Every invalid payload combination returns **400 Bad Request** (see `01-spec-backend.md`).
- [ ] Points are **calculated and stored** at ingestion time.
- [ ] Flooring rules implemented exactly (distance, duration, steps).
- [ ] `GET` endpoints to serve activities, leaderboard and dashboard data.
- [ ] Unit tests for scoring + validation.
- [ ] CORS configured for the Angular dev server.
- [ ] Seed data so the app is not empty on first run.

### Frontend
- [ ] Global Leaderboard view with total points **and rank trend**.
- [ ] Personal Dashboard view with activity history.
- [ ] Chart: activity volume over time.
- [ ] Chart: preferred sports breakdown.
- [ ] At least one bonus visualization.
- [ ] Responsive (works at 360px width and on desktop).
- [ ] Loading + error + empty states.
- [ ] Forms to register a user and log an activity (needed to demo the API).

### Repo
- [ ] `README.md`: prerequisites, run backend, run frontend, seed data, API examples, decisions.
- [ ] Clean commit history, no `bin/`, `obj/`, `node_modules/`, `*.db` committed.
- [ ] Screenshots or a short GIF in the README (cheap, high-impact).

## Where things are documented

| File | Contents |
|---|---|
| `00-project-overview.md` | This file — context, decisions, checklist |
| `01-spec-backend.md` | Data model, endpoints, validation matrix, scoring rules |
| `02-spec-frontend.md` | Views, components, charts, API client |
| `03-prompt-library.md` | Ready-to-paste prompts, in build order |
| `04-vscode-setup.md` | VS Code extensions, SDK install, run configs |
| `05-readme-template.md` | Starting point for the repo's README.md |
