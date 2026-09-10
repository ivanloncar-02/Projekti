import { Component, computed, inject, input } from '@angular/core';
import type { ChartData, ChartOptions, LegendItem } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { sportLabel } from '../../core/models/activity.helpers';
import type { DashboardSportBreakdownEntry } from '../../core/models/dashboard.model';
import { ThemeService } from '../../core/services/theme.service';
import { ChartCard } from '../../shared/components/chart-card/chart-card';
import { matSysColor, sportColor } from '../../shared/theme-colors';

/**
 * Chart 2 (spec section 8): doughnut of points per sport, coloured via
 * --sport-* tokens. sportBreakdown only lists sports with at least one
 * activity in the current range (see UsersController.BuildSportBreakdown -
 * it groups the activities it has, it doesn't pad in the other keys), so
 * this can render anywhere from 1 to all 6 SportKey slices depending on the
 * range/user - it never assumes a fixed count of 6, only that "steps" is a
 * SportKey like any other read-side value here (unlike the write-side
 * `Sport` used by B6's log-activity form, which only offers five).
 *
 * The legend text deliberately shows activity COUNT, not points - slice size
 * still encodes points, so a custom generateLabels is required (Chart.js'
 * default legend just echoes the dataset value, i.e. points, per label).
 */
@Component({
  selector: 'app-sport-breakdown-chart',
  imports: [ChartCard, BaseChartDirective],
  templateUrl: './sport-breakdown-chart.html',
  styleUrl: './sport-breakdown-chart.scss',
})
export class SportBreakdownChart {
  private readonly themeService = inject(ThemeService);

  readonly breakdown = input.required<DashboardSportBreakdownEntry[]>();

  // Reads themeService.mode() for the same reason as ActivityVolumeChart's
  // chartData/chartOptions: recompute with fresh --sport-*/--mat-sys-* colours
  // whenever the theme flips, letting ng2-charts' own ngOnChanges merge the
  // change into the live chart and call update() (verified in
  // node_modules/ng2-charts/fesm2022/ng2-charts.mjs).
  protected readonly chartData = computed<ChartData<'doughnut'>>(() => {
    this.themeService.mode();
    const breakdown = this.breakdown();

    return {
      labels: breakdown.map((b) => sportLabel(b.sport)),
      datasets: [
        {
          data: breakdown.map((b) => b.points),
          backgroundColor: breakdown.map((b) => sportColor(b.sport)),
          borderColor: matSysColor('surface-container'),
          borderWidth: 2,
        },
      ],
    };
  });

  protected readonly chartOptions = computed<ChartOptions<'doughnut'>>(() => {
    this.themeService.mode();
    const breakdown = this.breakdown();
    const textColor = matSysColor('on-surface-variant');

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: textColor,
            generateLabels: (chart): LegendItem[] => {
              const dataset = chart.data.datasets[0];
              const colors = dataset.backgroundColor as string[];
              return breakdown.map((entry, index) => ({
                text: `${sportLabel(entry.sport)} (${entry.activities})`,
                fillStyle: colors[index],
                strokeStyle: colors[index],
                fontColor: textColor,
                index,
              }));
            },
          },
        },
      },
    };
  });

  protected readonly summary = computed(() => {
    const breakdown = this.breakdown();
    if (breakdown.length === 0) {
      return 'No activities in this period.';
    }
    return breakdown
      .map((b) => `${sportLabel(b.sport)}: ${b.points} points across ${b.activities} activities`)
      .join('. ');
  });
}
