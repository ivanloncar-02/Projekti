import { Component, computed, inject, input, output, signal } from '@angular/core';
import { MatButtonToggle, MatButtonToggleGroup, type MatButtonToggleChange } from '@angular/material/button-toggle';
import type { ChartData, ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartMetric, DashboardDailyEntry, RangeWindowDays } from '../../core/models/dashboard.model';
import { ThemeService } from '../../core/services/theme.service';
import { ChartCard } from '../../shared/components/chart-card/chart-card';
import { matSysColor, gridColor } from '../../shared/theme-colors';

const METRIC_LABELS: Record<ChartMetric, string> = {
  points: 'Points',
  distanceKm: 'Distance (km)',
  minutes: 'Active minutes',
};

const METRIC_UNITS: Record<ChartMetric, string> = {
  points: 'points',
  distanceKm: 'km',
  minutes: 'min',
};

/**
 * Chart 1 (spec section 8): daily volume as a bar per day, with a metric
 * toggle (points/km/minutes - real per-day fields since B4's backend change,
 * see docs/01-spec-backend.md section 3.6) and a range toggle (7/30/90 days).
 *
 * Bar, not line: most days in a real window are legitimate zeros (rest days),
 * and a bar chart reads those as "nothing happened" - a line chart would draw
 * a trend through them that implies a gradual drop-off that isn't there.
 *
 * The range toggle's value is owned by DashboardPage (it also drives the KPI
 * cards and re-fetches the dashboard resource), not this component - this
 * only renders the control and emits the change upward.
 */
@Component({
  selector: 'app-activity-volume-chart',
  imports: [ChartCard, BaseChartDirective, MatButtonToggle, MatButtonToggleGroup],
  templateUrl: './activity-volume-chart.html',
  styleUrl: './activity-volume-chart.scss',
})
export class ActivityVolumeChart {
  private readonly themeService = inject(ThemeService);

  readonly daily = input.required<DashboardDailyEntry[]>();
  readonly rangeWindowDays = input.required<RangeWindowDays>();
  readonly rangeWindowDaysChange = output<RangeWindowDays>();

  protected readonly metric = signal<ChartMetric>('points');

  // Reads themeService.mode() so this recomputes - with freshly-resolved
  // --mat-sys-* colours - whenever the theme flips, not just when daily/metric
  // change. ng2-charts' BaseChartDirective merges a changed [data] input into
  // the live chart.config.data and calls chart.update() itself on any change
  // that isn't the first (verified in node_modules/ng2-charts/fesm2022/
  // ng2-charts.mjs ngOnChanges) - no manual chart.update() call needed here.
  protected readonly chartData = computed<ChartData<'bar'>>(() => {
    this.themeService.mode();
    const daily = this.daily();
    const metric = this.metric();
    const color = matSysColor('primary');

    return {
      labels: daily.map((d) => d.date),
      datasets: [
        {
          label: METRIC_LABELS[metric],
          data: daily.map((d) => d[metric]),
          backgroundColor: color,
          borderColor: color,
          borderRadius: 4,
          maxBarThickness: 24,
        },
      ],
    };
  });

  protected readonly chartOptions = computed<ChartOptions<'bar'>>(() => {
    this.themeService.mode();
    const grid = gridColor();
    const tickColor = matSysColor('on-surface-variant');

    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { grid: { color: grid }, ticks: { color: tickColor, maxRotation: 0, autoSkipPadding: 12 } },
        y: { beginAtZero: true, grid: { color: grid }, ticks: { color: tickColor } },
      },
      plugins: {
        legend: { display: false },
      },
    };
  });

  protected readonly summary = computed(() => {
    const daily = this.daily();
    const metric = this.metric();
    const total = daily.reduce((sum, d) => sum + d[metric], 0);
    const from = daily[0]?.date ?? '—';
    const to = daily.at(-1)?.date ?? '—';
    return `${METRIC_LABELS[metric]} per day from ${from} to ${to}. Total: ${formatTotal(total, metric)} ${METRIC_UNITS[metric]}.`;
  });

  protected onMetricChange(event: MatButtonToggleChange): void {
    this.metric.set(event.value as ChartMetric);
  }

  protected onRangeChange(event: MatButtonToggleChange): void {
    this.rangeWindowDaysChange.emit(event.value as RangeWindowDays);
  }
}

function formatTotal(total: number, metric: ChartMetric): string {
  return metric === 'distanceKm' ? total.toFixed(2) : total.toString();
}
