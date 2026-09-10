import { BreakpointObserver } from '@angular/cdk/layout';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { Component, computed, effect, inject, input, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelect, type MatSelectChange } from '@angular/material/select';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatNoDataRow,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource,
} from '@angular/material/table';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ActivitiesService } from '../../core/api/activities.service';
import { activitySportKey } from '../../core/models/activity.helpers';
import type { ActivityResponse, SportKey } from '../../core/models/activity.model';
import type { UserSummary } from '../../core/models/user.model';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { KpiCard } from '../../shared/components/kpi-card/kpi-card';
import { SportChip } from '../../shared/components/sport-chip/sport-chip';
import { formatDistance, formatDuration, formatSteps } from '../../shared/format';
import type { DashboardData, RangeWindowDays } from '../../core/models/dashboard.model';
import { ActivityHeatmap } from './activity-heatmap';
import { ActivityVolumeChart } from './activity-volume-chart';
import { SportBreakdownChart } from './sport-breakdown-chart';

const DEFAULT_WINDOW_DAYS = 30;
// The backend's own MaxPageSize (see ActivitiesController) - the largest single
// page it will ever return, so this is also the ceiling on what this page can show.
const HISTORY_PAGE_SIZE = 100;
const DAY_MS = 86_400_000;

@Component({
  selector: 'app-dashboard-page',
  imports: [
    FormsModule,
    DatePipe,
    TitleCasePipe,
    EmptyState,
    KpiCard,
    SportChip,
    ActivityVolumeChart,
    SportBreakdownChart,
    ActivityHeatmap,
    MatButton,
    MatFormField,
    MatLabel,
    MatOption,
    MatPaginator,
    MatProgressSpinner,
    MatSelect,
    MatSort,
    MatSortHeader,
    MatTable,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatNoDataRow,
  ],
  // Route-scoped (B7): registering Chart.js here rather than in the global
  // app.config keeps ng2-charts + chart.js in this lazy route's chunk instead
  // of the initial bundle - nothing outside the dashboard renders a chart.
  providers: [provideCharts(withDefaultRegisterables())],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage {
  private readonly router = inject(Router);
  private readonly breakpointObserver = inject(BreakpointObserver);
  // Only used to build the sport filter's option list from what actually
  // shows up in this user's history, not for fetching (that's httpResource below).
  private readonly activitiesApi = inject(ActivitiesService);

  // Routed input (withComponentInputBinding in app.config.ts) - bound to the
  // :userId route param, no manual ActivatedRoute subscription needed.
  readonly userId = input.required<string>();

  protected readonly isMobile = toSignal(this.breakpointObserver.observe('(max-width: 639.98px)'), {
    requireSync: true,
  });

  // No defaultValue on any httpResource here - see B2 notes: a default value
  // makes hasValue() true from the first tick, which breaks the loading-vs-
  // genuinely-empty distinction every spinner/empty-state check below relies on.
  protected readonly users = httpResource<UserSummary[]>(() => '/api/users');
  protected readonly usersErrorTitle = computed(() => errorTitle(this.users.error()));

  // Explicit default range, computed client-side, rather than omitting from/to
  // and letting the backend default silently - this way the page always knows
  // exactly what range it requested and can label it (see rangeLabel below).
  protected readonly rangeWindowDays = signal<RangeWindowDays>(DEFAULT_WINDOW_DAYS);
  protected readonly rangeTo = signal(toDateOnly(new Date()));
  protected readonly rangeFrom = signal(toDateOnly(new Date(Date.now() - (DEFAULT_WINDOW_DAYS - 1) * DAY_MS)));
  // rangeLabel reads the same two signals the range toggle below writes to -
  // there is no separate "displayed range" state to fall out of sync with
  // what the KPI cards/charts actually fetched.
  protected readonly rangeLabel = computed(() => `${this.rangeFrom()} – ${this.rangeTo()}`);

  protected readonly dashboard = httpResource<DashboardData>(
    () => `/api/users/${this.userId()}/dashboard?from=${this.rangeFrom()}&to=${this.rangeTo()}`,
  );

  // DashboardTotals (totals.*) has no "points" field - only activities/
  // distanceKm/minutes/steps. The window-scoped points figure has to be
  // summed from daily[] client-side. This is DELIBERATELY a different number
  // from dashboard.value().totalPoints (all-time) - the template labels them
  // as separate sections so two different totals on one screen doesn't read
  // as a bug (e.g. a user can show 27220 all-time but 24026 in a 20-day window).
  protected readonly windowPoints = computed(() =>
    (this.dashboard.value()?.daily ?? []).reduce((sum, d) => sum + d.points, 0),
  );

  protected readonly dashboardErrorTitle = computed(() => errorTitle(this.dashboard.error()));

  // Activities history: fetched once at HISTORY_PAGE_SIZE and sorted/paginated/
  // filtered entirely client-side via MatTableDataSource. This isn't a stopgap
  // for a missing feature - GET /api/activities has no sort parameter at all
  // (always OccurredAt desc server-side), so matSort could never have been
  // forwarded to the server regardless.
  //
  // The real limitation: the seeder gives each user ~50-90 activities, safely
  // under HISTORY_PAGE_SIZE, but a user with more than 100 would have the rest
  // silently excluded from this fetch. There is NO indication of that in the
  // UI - MatPaginator reports counts from the fetched array's own length, so
  // it would happily show e.g. "1-10 of 100" as if that were the whole
  // dataset, not display nothing. That reads as authoritative while being
  // wrong, which is worse than a visible gap. A correct fix needs either a
  // sort query param on the backend (server-side sort+page) or batched
  // fetching - both out of scope for B3. Noted, not silently accepted.
  protected readonly activities = httpResource<{ items: ActivityResponse[]; totalCount: number }>(
    () => `/api/activities?userId=${this.userId()}&pageSize=${HISTORY_PAGE_SIZE}`,
  );

  protected readonly activitiesErrorTitle = computed(() => errorTitle(this.activities.error()));

  protected readonly sportFilter = signal<SportKey | 'all'>('all');
  protected readonly sportFilterOptions = computed<SportKey[]>(() => {
    const keys = new Set<SportKey>();
    for (const a of this.activities.value()?.items ?? []) {
      keys.add(activitySportKey(a));
    }
    return [...keys].sort();
  });

  protected readonly dataSource = new MatTableDataSource<ActivityResponse>([]);
  protected readonly displayedColumns = ['datetime', 'sport', 'metric', 'points'];

  // toSignal(dataSource.connect()) mirrors the same filtered/sorted/paginated
  // rows the desktop <table> renders, so the <640px stacked-card layout shows
  // an identical result set instead of a second, divergent data path.
  protected readonly visibleRows = toSignal(this.dataSource.connect(), { initialValue: [] as ActivityResponse[] });

  private readonly sort = viewChild(MatSort);
  private readonly paginator = viewChild(MatPaginator);

  protected readonly activitySportKey = activitySportKey;

  constructor() {
    this.dataSource.filterPredicate = (row, filter) => filter === 'all' || activitySportKey(row) === filter;

    effect(() => {
      this.dataSource.data = this.activities.value()?.items ?? [];
    });

    effect(() => {
      // MatTableDataSource's filter is a string, but the predicate above
      // ignores its content and reads sportFilter() directly - this write is
      // only here to invalidate/re-run the data source's internal pipeline.
      this.dataSource.filter = this.sportFilter();
    });

    effect(() => {
      // Sort only exists while the desktop <table> (and its matSort host) is
      // in the DOM - on mobile the card list just falls back to the backend's
      // natural OccurredAt-desc order, which is an acceptable simplification
      // for this phase (spec doesn't ask for sort controls on the card view).
      this.dataSource.sort = this.sort() ?? null;
      this.dataSource.paginator = this.paginator() ?? null;
    });
  }

  protected onUserChange(event: MatSelectChange): void {
    void this.router.navigate(['/dashboard', event.value as string]);
  }

  protected onSportFilterChange(value: SportKey | 'all'): void {
    this.sportFilter.set(value);
  }

  // Writing rangeFrom/rangeTo here (rather than a derived computed) re-runs
  // the dashboard httpResource (its URL reads both) and, through it, updates
  // totals/daily/sportBreakdown/windowPoints/rangeLabel together - the KPI
  // section, both charts and the "Showing: ..." heading all move as one.
  protected onRangeWindowChange(days: RangeWindowDays): void {
    this.rangeWindowDays.set(days);
    this.rangeTo.set(toDateOnly(new Date()));
    this.rangeFrom.set(toDateOnly(new Date(Date.now() - (days - 1) * DAY_MS)));
  }

  protected metricFor(row: ActivityResponse): string {
    if (row.distance !== null) {
      return formatDistance(row.distance);
    }
    if (row.durationSeconds !== null) {
      return formatDuration(row.durationSeconds);
    }
    if (row.steps !== null) {
      return formatSteps(row.steps);
    }
    return '—';
  }

  protected retryUsers(): void {
    this.users.reload();
  }

  protected retryDashboard(): void {
    this.dashboard.reload();
  }

  protected retryActivities(): void {
    this.activities.reload();
  }
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
