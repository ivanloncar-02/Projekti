import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { Component, computed, inject, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import type { DashboardData } from '../../core/models/dashboard.model';
import { ThemeService } from '../../core/services/theme.service';
import { ChartCard } from '../../shared/components/chart-card/chart-card';
import { matSysColor, matSysColorWithAlpha } from '../../shared/theme-colors';

const GRID_WEEKS = 12;
const DAY_MS = 86_400_000;

// Floor alpha for the LOWEST-points active day, so "one quiet point" over
// --mat-sys-primary never converges visually on the fixed empty-cell colour
// (--mat-sys-surface-container-highest). Verified, not assumed: composited
// the real resolved rgb()/rgba() values (empty cell, primary-at-floor-alpha,
// and the card's own background) with the standard alpha-over formula in
// both themes. At this floor the Euclidean RGB distance between the two
// composited colours is ~83 (light) / ~73 (dark) on a 0-255 scale - both
// far clearer than the ~335-point real day this seed's window actually
// contains (~97 / ~88) - so 0.35 was already comfortable and didn't need
// raising. See docs/02-spec-frontend.md section 8 / the B5 verification.
const ALPHA_FLOOR = 0.35;

type HeatmapCell =
  | { kind: 'placeholder' }
  | { kind: 'day'; date: string; points: number; activities: number; background: string };

/**
 * Bonus visualization (spec section 8): GitHub-style heatmap, last 12 weeks,
 * one cell per day, opacity scaled by points over --mat-sys-primary.
 *
 * Deliberately fetches its OWN 12-week window from the dashboard endpoint,
 * independent of DashboardPage's rangeFrom/rangeTo (the 7/30/90 chart
 * toggle) - 84 days is longer than any of those windows, and coupling this
 * to the range toggle would make the heatmap redraw every time someone
 * moves it, which isn't what a "last 12 weeks" fixed view should do. Also
 * deliberately does NOT reuse the activities history fetch (B3's
 * pageSize=100, not date-scoped) to derive per-day counts client-side -
 * that would inherit its known truncation limitation, the same mistake B4's
 * backend fix (see docs/01-spec-backend.md section 3.6) was about avoiding.
 */
@Component({
  selector: 'app-activity-heatmap',
  imports: [ChartCard, MatTooltip, MatButton],
  templateUrl: './activity-heatmap.html',
  styleUrl: './activity-heatmap.scss',
})
export class ActivityHeatmap {
  private readonly themeService = inject(ThemeService);

  readonly userId = input.required<string>();

  // Computed once at construction, not reactive - "today" doesn't need to
  // move mid-session for a bonus viz, and keeping it stable avoids the grid
  // silently reshaping under someone's cursor.
  private readonly today = startOfUtcDay(new Date());
  private readonly gridStart = addUtcDays(this.today, -(this.today.getUTCDay() + 7 * (GRID_WEEKS - 1)));

  // No defaultValue (see CLAUDE.md rule 12) - hasValue()/isLoading() below
  // depend on the loading/genuinely-empty distinction it would erase.
  protected readonly dashboard = httpResource<DashboardData>(
    () => `/api/users/${this.userId()}/dashboard?from=${toDateOnly(this.gridStart)}&to=${toDateOnly(this.today)}`,
  );

  protected readonly errorTitle = computed(() => errorTitle(this.dashboard.error()));

  // Reads themeService.mode() first so the whole grid - including every
  // cell's resolved background - recomputes with fresh colours on a theme
  // flip, the same pattern as ActivityVolumeChart/SportBreakdownChart (B4).
  protected readonly weeks = computed<HeatmapCell[][]>(() => {
    this.themeService.mode();
    const daily = this.dashboard.value()?.daily ?? [];
    const byDate = new Map(daily.map((d) => [d.date, d]));
    const maxPoints = Math.max(0, ...daily.map((d) => d.points));
    const emptyColor = matSysColor('surface-container-highest');

    const weeks: HeatmapCell[][] = [];
    for (let week = 0; week < GRID_WEEKS; week++) {
      const column: HeatmapCell[] = [];
      for (let dow = 0; dow < 7; dow++) {
        const date = addUtcDays(this.gridStart, week * 7 + dow);
        if (date > this.today) {
          // A future day within the current (partial) week - no data to
          // show, and not styled as "empty" either since that would read as
          // "nothing happened" for a day that hasn't occurred yet.
          column.push({ kind: 'placeholder' });
          continue;
        }

        const dateStr = toDateOnly(date);
        const entry = byDate.get(dateStr);
        const points = entry?.points ?? 0;
        const activities = entry?.activities ?? 0;
        const background =
          activities === 0
            ? emptyColor
            : matSysColorWithAlpha('primary', ALPHA_FLOOR + (1 - ALPHA_FLOOR) * (points / (maxPoints || 1)));

        column.push({ kind: 'day', date: dateStr, points, activities, background });
      }
      weeks.push(column);
    }
    return weeks;
  });

  protected readonly summary = computed(() => {
    const days = this.weeks()
      .flat()
      .filter((cell): cell is Extract<HeatmapCell, { kind: 'day' }> => cell.kind === 'day');
    const activeDays = days.filter((d) => d.activities > 0);
    const from = days[0]?.date ?? toDateOnly(this.gridStart);
    const to = days.at(-1)?.date ?? toDateOnly(this.today);
    return `Activity heatmap from ${from} to ${to}. ${activeDays.length} active day(s) out of ${days.length} shown.`;
  });

  protected cellTooltip(cell: Extract<HeatmapCell, { kind: 'day' }>): string {
    const activityWord = cell.activities === 1 ? 'activity' : 'activities';
    return `${cell.date}: ${cell.points} points, ${cell.activities} ${activityWord}`;
  }

  protected retry(): void {
    this.dashboard.reload();
  }
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addUtcDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function errorTitle(error: unknown): string | null {
  if (!error) {
    return null;
  }
  if (error instanceof HttpErrorResponse) {
    const title = (error.error as { title?: string } | null)?.title;
    return title ?? `Request failed (${error.status}).`;
  }
  return 'Something went wrong.';
}
