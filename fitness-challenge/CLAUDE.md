# Fitness Challenge — project context

Take-home assignment: a full-stack application that gamifies physical activity. Activities across
six sports are normalized into a single "Points" metric for a global leaderboard, plus a personal
dashboard with charts.

**The full specification lives in `docs/`. Read it before implementing anything:**

- `docs/00-project-overview.md` — stack decisions, definition-of-done checklist
- `docs/01-spec-backend.md` — domain model, endpoints, validation matrix, scoring formulas
- `docs/02-spec-frontend.md` — Angular Material approach, views, charts, theme tokens
- `docs/03-prompt-library.md` — build order (phases A → B → C)
- `docs/05-readme-template.md` — template for the final README

## Stack

- Backend: ASP.NET Core Web API (controllers), EF Core, SQLite
- Frontend: Angular + Angular Material + ng2-charts
- Tests: xUnit
- OS: Windows, working in VS Code with PowerShell

### Pinned versions — verified on this machine, do not assume others

| | Version |
|---|---|
| .NET SDK | 8.0.303 (target framework `net8.0`) |
| Angular CLI | 22.1.7 |
| Node.js | 24.19.0 |
| npm | 11.17.0 |

Angular 22 is recent. Use standalone components and the current control flow (`@if`, `@for`),
not NgModules or `*ngIf` / `*ngFor`. Angular Material theming uses the `mat.theme()` mixin
(v19+ API) — `mat.define-theme()` is the old pre-v19 API and must not be used. If you are
unsure whether an API still exists in v22, check rather than guess.

## Structure

```
backend/FitnessChallenge.Api/     controllers, DTOs, validators, scoring, EF Core
backend/FitnessChallenge.Tests/   unit tests
frontend/fitness-challenge-web/   Angular application
docs/                             specifications
```

## Commands

```powershell
dotnet watch --project backend/FitnessChallenge.Api    # API at http://localhost:5080
cd frontend/fitness-challenge-web; npm start            # http://localhost:4200
dotnet test backend/FitnessChallenge.sln
dotnet format
```

## Non-negotiable rules

1. **`decimal`, never `double`, for distance.** Points are floored, and the assignment's own
   example (1.55 km walking → 77.5 → 77) sits exactly on the boundary where binary floating
   point gets it wrong.
2. **Points are calculated and stored at ingestion**, not computed on read. The assignment
   explicitly requires storing them.
3. **Every invalid sport/metric combination returns 400.** The matrix is in
   `docs/01-spec-backend.md`, section 4. An unknown sport name must produce 400, not a 500 from
   enum binding.
4. **An absent `sport` field with `steps` present means Daily Steps.** That is not a schema bug.
5. **Never touch Material's internal CSS classes** (`.mat-mdc-*`, `.mdc-*`). Use the
   `mat.theme()` mixin and the component `overrides` mixins.
6. **Chart colours come from CSS variables** (`--sport-*`, `--mat-sys-*`) resolved at runtime,
   never hardcoded hex.
7. `strict: true` in `tsconfig.json`, no `any`.
8. **The API runs on plain HTTP at `http://localhost:5080`.** The Angular dev proxy points
   there. Don't switch it to HTTPS — it works identically on any OS and spares the reviewer a
   certificate warning.
9. **DateTimeOffset needs UtcDateTimeOffsetConverter** (applied globally in
   ConfigureConventions). Without it SQLite throws NotSupportedException on
   ORDER BY over DateTimeOffset — the leaderboard trend query depends on this.
10. **NormalizedName is owned by the User entity** via User.Create(). Setters are
    private. Never populate it from a controller or service.
11. **Never read `--mat-sys-*` tokens with `getPropertyValue()`.** Material 22 declares
    them as `light-dark(#a, #b)`, and a custom property is returned unresolved — the
    literal string reaches Canvas as `fillStyle`, gets silently ignored, and everything
    draws black in both themes with no error. Use the probe-element approach in
    `theme-colors.ts`, which applies `var(--mat-sys-*)` to a hidden element and reads a
    real `color` property. Verify colour work by sampling canvas pixels, not by
    comparing strings.
12. **`httpResource` is the app's fetching pattern** (verified in B2: `error()` gives a
    real `HttpErrorResponse`, and the B1 error interceptor does fire). Never pass
    `defaultValue` — an empty array makes `hasValue()` true from the first tick, so
    loading and genuinely-empty become indistinguishable and the spinner never shows.

## How I want you to work

- Before any larger change, give me the plan in a few sentences and wait for confirmation.
  Don't write 15 files at once.
- Follow the phases in `docs/03-prompt-library.md`. One phase per session is plenty.
- Run `dotnet test` after every backend change. If tests fail, fix them before moving on.
- Write the scoring and validation tests alongside the code, not afterwards.
- Don't add new NPM/NuGet packages without asking.
- Don't commit on my behalf unless I explicitly ask.
- Keep explanations short: two or three sentences for non-obvious decisions, no essays.
- Reply to me in Croatian; code and code comments in English.

## Open decisions to record in the README

- Is a `datetime` in the future allowed?
- Does a duplicate name return 409 or 400?
- Can the same user have two Daily Steps entries for the same day?
