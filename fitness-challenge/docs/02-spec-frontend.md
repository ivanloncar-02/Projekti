# 02 — Frontend Specification (Angular + Angular Material)

## 0. Approach

**Angular Material for components, thin custom SCSS layer on top.**

Material handles the table (sorting, paging, a11y), form controls, datepicker, toolbar,
snackbar and spinners. Everything visually distinctive — the podium, rank trend badges,
KPI cards, the activity heatmap — is hand-written and consumes Material's own
`--mat-sys-*` design tokens, so the custom pieces and the library pieces share one colour
source and both respond to light/dark mode automatically.

Do **not** override Material's internal CSS classes (`.mdc-*`, `.mat-mdc-*`). Those are private
implementation details. Use the theme mixin and the component `overrides` mixins instead.

## 1. Project setup

```bash
cd frontend
ng new fitness-challenge-web --routing --style=scss --ssr=false
cd fitness-challenge-web

ng add @angular/material      # pick palettes when prompted; there is no "prebuilt theme" option anymore
npm install chart.js ng2-charts

ng add @angular-eslint/schematics
npm install -D prettier
```

Built against **Angular CLI 22.1.7 / Node 24.19.0**. Standalone components and the new control
flow (`@if`, `@for`, `@switch`) — no NgModules, no `*ngIf`. Accept whatever the CLI scaffolds
rather than porting older patterns onto it.

The `mat.theme()` mixin below is the v19+ theming API. The older `mat.define-theme()` /
`mat.define-light-theme()` API does not apply here.

## 2. Theme

`ng add` writes a `mat.theme(...)` block into `styles.scss`. Extend it rather than replacing it:

```scss
@use '@angular/material' as mat;

html {
  @include mat.theme((
    color: (
      primary: mat.$azure-palette,
      tertiary: mat.$orange-palette,
    ),
    typography: Roboto,
    density: 0,
  ));

  color-scheme: light dark;   // respects the OS preference; toggle this to force a mode
}

body {
  background: var(--mat-sys-surface);
  color: var(--mat-sys-on-surface);
  margin: 0;
}

:root {
  // app-level tokens layered on top of Material's
  --app-gap: 16px;
  --app-radius: 12px;
  --app-max-width: 1200px;

  // one colour per sport — used by charts, chips and the heatmap alike
  --sport-running:  #e8590c;
  --sport-walking:  #2f9e44;
  --sport-cycling:  #1971c2;
  --sport-swimming: #0c8599;
  --sport-gym:      #6741d9;
  --sport-steps:    #f08c00;
}
```

Tokens worth knowing: `--mat-sys-primary` / `--mat-sys-on-primary`,
`--mat-sys-surface` / `--mat-sys-on-surface`, `--mat-sys-surface-container`,
`--mat-sys-outline-variant`, `--mat-sys-error`. Rule of thumb: apply a colour token to a
background, and its matching `on-` token to the text sitting on it. That keeps contrast correct
in both modes without you checking anything by hand.

**Charts must read these variables, not hardcode hex.** Chart.js needs real values, so resolve
them once at runtime:

```ts
const css = getComputedStyle(document.documentElement);
const sportColor = (s: string) => css.getPropertyValue(`--sport-${s}`).trim();
const gridColor  = css.getPropertyValue('--mat-sys-outline-variant').trim();
```

Re-resolve and call `chart.update()` when the colour scheme changes.

## 3. Folder structure

```
src/app/
├── core/
│   ├── api/            users.service.ts, activities.service.ts, leaderboard.service.ts
│   ├── models/         TS interfaces mirroring the API contracts
│   └── interceptors/   http error interceptor -> MatSnackBar
├── features/
│   ├── leaderboard/
│   ├── dashboard/
│   └── activities/     register-user, log-activity
└── shared/
    ├── components/     kpi-card, rank-trend, sport-chip, empty-state, chart-card
    ├── material.ts     barrel of the Material imports used across the app
    └── pipes/          duration (sec <-> mm:ss), sportLabel
```

## 4. API proxy

`src/proxy.conf.json`:
```json
{ "/api": { "target": "http://localhost:5080", "secure": false, "changeOrigin": true } }
```
Wire into `angular.json` under `serve.options.proxyConfig`, then call relative `/api/...` URLs.
Also configure CORS on the backend so the two can run independently.

## 5. Models

**Corrected in B1 against the real backend** (this section was written before the API
existed; verified against `backend/requests.http` and the actual DTOs in
`backend/FitnessChallenge.Api/Dtos/`, not assumed). Four things were wrong:

1. `rankChange` is `number | null`, not `number` — it's null exactly when
   `previousRank` is null (`isNew: true`; nothing to compare against yet).
2. `sportBreakdown` entries also have `distanceKm: number` — missing below.
3. Sport values on the *read* side (`sportBreakdown[].sport`, `daily[].byType` keys)
   include a sixth value, `"steps"`, for Daily Steps — the API never emits
   `"dailysteps"` (see `docs/01-spec-backend.md` §4 and `ActivityTypeResolver` in the
   backend). The *write* side (`POST /api/activities` `sport` field) still only ever
   takes the original five — Daily Steps is reached by omitting `sport` entirely.
4. `ActivityResponse` (used by `GET /api/activities` and `GET /api/activities/{id}`)
   wasn't modeled here at all.

```ts
// Write-side sport value (POST /api/activities). Daily Steps has no literal value
// here - it's reached by omitting `sport` and sending `steps` instead.
export type Sport = 'running' | 'walking' | 'cycling' | 'gym' | 'swimming';

// Read-side sport key: sportBreakdown[].sport, daily[].byType keys, and the only
// valid suffixes for --sport-* CSS variables. "steps" is real here even though
// it's never a valid `Sport` to submit.
export type SportKey = Sport | 'steps';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  totalPoints: number;
  previousRank: number | null;
  rankChange: number | null;   // previousRank - rank; positive = climbed; null iff isNew
  pointsInWindow: number;
  isNew: boolean;
}

export interface ActivityResponse {
  id: string;
  userId: string;
  sport: Sport | null;   // null for Daily Steps - mirrors the write-side contract
  datetime: string;
  distance: number | null;
  durationSeconds: number | null;
  steps: number | null;
  points: number;
}

export interface DashboardData {
  userId: string;
  name: string;
  totalPoints: number;   // all-time - not scoped to from/to (see section 3.6 below)
  rank: number;           // all-time
  totals: { activities: number; distanceKm: number; minutes: number; steps: number };       // scoped to [from, to]
  daily: { date: string; points: number; distanceKm: number; minutes: number; steps: number;
           activities: number; byType: Partial<Record<SportKey, number>> }[];                // scoped to [from, to]
  sportBreakdown: { sport: SportKey; activities: number; points: number; distanceKm: number }[]; // scoped to [from, to]
  streak: { current: number; longest: number };  // all-time
}
```

**`daily[]` gained `distanceKm`/`minutes`/`steps` in B4.** The dashboard chart's metric
toggle (points/km/minutes) needs real per-day values for each - the original shape only
carried `points`, which is why B4 added the matching fields to the backend
(`docs/01-spec-backend.md` §3.6) instead of reconstructing km/minutes client-side from
points via the scoring rates.

**`daily[]` gained `activities` in B5.** The heatmap's tooltip needs "date + points +
activity count" - `points` alone can't tell one big activity apart from several small
ones on the same day. The heatmap also does NOT reuse the dashboard's `rangeFrom`/
`rangeTo` signals: it issues its own fetch of this same endpoint with a fixed 12-week
window, so it never redraws when the chart's 7/30/90 range toggle changes, and never
inherits the `GET /api/activities` history table's pageSize=100 limitation (B3) the
way computing per-day counts client-side from that list would have.

**`from`/`to` do not scope every field.** `totalPoints`, `rank` and `streak` reflect
the user's real, all-time standing; only `totals`, `daily` and `sportBreakdown` change
when the date range changes (`docs/01-spec-backend.md` §3.6, decided in A8). The
dashboard's date picker only needs to re-fetch/re-render those three.

`ActivityResponse.sport` being `null` for Daily Steps means every consumer has to
special-case it before using it for a colour or label lookup — don't do that inline.
`activitySportKey()` in `core/models/activity.helpers.ts` (`activity.sport ?? 'steps'`)
does it once.

## 6. Shell

`mat-toolbar` (app name, nav links to Leaderboard / Dashboard / Log activity, light-dark toggle
on the right) + a `<main>` with `max-width: var(--app-max-width); margin-inline: auto;`.
Below 768px the nav collapses into a `mat-menu` behind a hamburger `mat-icon-button`.

## 7. View 1 — Global Leaderboard  (`/leaderboard`)

Requirement: ranking by total accumulated points **and** rank trend.

**Podium — custom.** Three cards for the top 3, #1 taller and centred, gradient from
`--mat-sys-primary-container`. Initials avatar, name, points, trend badge. Stacks vertically
below 640px in rank order.

**Table — custom rows, not `mat-table`.** The rest of the ranking as a CSS-grid list:
`#` · avatar · name · total points · trend · points this window.
A grid gives you the rank-column styling and the mobile card collapse that `mat-table` fights you
on. Rows are `<button>` or have `role="row"` + `tabindex` so keyboard nav still works.

**Trend badge — custom, reusable.** ▲ green `+n` · ▼ red `-n` · `–` muted for unchanged ·
`NEW` chip when `isNew`. Needs an `aria-label` such as "up 2 places" — colour alone is not enough.

**Controls.** `mat-button-toggle-group` for the 7 / 30 day trend window,
`mat-form-field` + input for the name filter.

**States.** `mat-progress-spinner` or skeleton rows while loading, `empty-state` component when
there are no activities, error banner with a retry button.

Row click → `/dashboard/:userId`.

Bonus: a small inline SVG sparkline per row for the last 7 days.

## 8. View 2 — Personal Dashboard  (`/dashboard/:userId`)

**Header.** `mat-form-field` + `mat-select` user picker, name, rank, total points, current streak.

**KPI cards — custom.** Five stat tiles: total points · distance (km) · active minutes · steps ·
activities logged. `background: var(--mat-sys-surface-container)`, big number, small label,
CSS grid `repeat(auto-fit, minmax(160px, 1fr))`.

**Chart 1 — activity volume over time.** ng2-charts line/bar.
`mat-button-toggle-group` for metric (points / km / minutes) and for range (7 / 30 / 90 days).
Wrap in a fixed-height container with `maintainAspectRatio: false`.

**Chart 2 — sport breakdown.** Doughnut of points per sport, colours from the `--sport-*`
variables, legend showing activity count per sport.

**Bonus visualization — activity heatmap.** GitHub-style, last 12 weeks, one cell per day,
opacity scaled by points, `matTooltip` with date + points + activity count. Plain CSS grid or
inline SVG, no extra dependency.

**History table — `mat-table`.** This is where Material earns its place:
`matSort` on date/sport/points, `mat-paginator`, `mat-select` sport filter.
Columns: date · sport chip · raw metric (`5.20 km`, `45:30`, `8 400 steps`) · points.
Below 640px switch to a stacked card list via a breakpoint observer.

Every chart needs a visually-hidden text summary or a table fallback for screen readers.

## 9. View 3 — Data entry  (`/users/new`, `/activities/new`)

Not named in the assignment, but without it nobody can exercise the ingestion API from the UI.

- **Register user**: two `mat-form-field`s, submit, show the returned id in a `MatSnackBar`,
  render the 409 duplicate-name error under the field.
- **Log activity**: user `mat-select` · `mat-datepicker` + time input · sport `mat-select`
  including a "Daily steps" option · and a metric field that **swaps reactively** based on the
  selected sport (distance number / duration `mm:ss` / steps integer). That swap is the visible
  proof you understood the sport-metric pairing rules — make it obvious.
- Reactive forms, client-side rules mirroring the backend, and server
  `ValidationProblemDetails` mapped back onto the right form controls.

## 10. Cross-cutting

- **Responsive**: CSS Grid with `minmax()`. Test at 360 / 768 / 1440px.
- **Bundle size**: import Material components individually (standalone imports), never a
  catch-all module. Reviewers do look at the production build output.
- **Strict mode**: keep `strict: true` in `tsconfig.json`, no `any`.
- **Dark mode**: a toolbar toggle that sets `color-scheme` on `<html>`; persist in `localStorage`.
  Costs almost nothing and looks deliberate in screenshots.
- **Formatting pipes**: seconds ↔ `mm:ss`, `DecimalPipe` with a fixed locale for points and km.
