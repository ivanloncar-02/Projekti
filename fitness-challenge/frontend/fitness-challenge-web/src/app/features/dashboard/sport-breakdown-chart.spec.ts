import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Chart, ChartOptions } from 'chart.js';
import { SportBreakdownChart } from './sport-breakdown-chart';
import type { DashboardSportBreakdownEntry } from '../../core/models/dashboard.model';

// Verbatim from dashboard-page.spec.ts's REAL_DASHBOARD.sportBreakdown -
// all six SportKey values, 'steps' included, exactly as a real dashboard
// response over a wide-enough range returns them.
const BREAKDOWN: DashboardSportBreakdownEntry[] = [
  { sport: 'swimming', activities: 8, points: 8520, distanceKm: 0 },
  { sport: 'cycling', activities: 7, points: 5621, distanceKm: 224.9 },
  { sport: 'running', activities: 7, points: 5274, distanceKm: 52.74 },
  { sport: 'walking', activities: 9, points: 2486, distanceKm: 49.77 },
  { sport: 'gym', activities: 4, points: 1110, distanceKm: 0 },
  { sport: 'steps', activities: 8, points: 1015, distanceKm: 0 },
];

function render(breakdown: DashboardSportBreakdownEntry[]): ComponentFixture<SportBreakdownChart> {
  const fixture = TestBed.createComponent(SportBreakdownChart);
  fixture.componentRef.setInput('breakdown', breakdown);
  fixture.detectChanges();
  return fixture;
}

function summaryText(fixture: ComponentFixture<SportBreakdownChart>): string {
  return (fixture.nativeElement as HTMLElement).querySelector('[chartSummary]')!.textContent!.trim();
}

describe('SportBreakdownChart', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SportBreakdownChart] });
  });

  it('summarises all six SportKey slices, including "steps" as Daily Steps (not a write-side Sport)', () => {
    const fixture = render(BREAKDOWN);
    const text = summaryText(fixture);

    expect(text).toContain('Swimming: 8520 points across 8 activities');
    expect(text).toContain('Daily Steps: 1015 points across 8 activities');
    // Exactly six clauses - one per slice, none dropped or duplicated.
    expect(text.split('. ').length).toBe(6);
  });

  it('generateLabels reports activity count, not the points the slice size encodes', () => {
    const fixture = render(BREAKDOWN);
    // Protected on the component (an implementation detail for its own
    // template), but this is exactly what B4 needs to prove: the legend
    // callback's own output, not a DOM/canvas readout jsdom can't provide.
    const chartOptions = fixture.componentInstance['chartOptions'] as unknown as () => ChartOptions<'doughnut'>;
    const generateLabels = chartOptions().plugins?.legend?.labels?.generateLabels;
    expect(generateLabels).toBeDefined();

    const fakeChart = {
      data: { datasets: [{ backgroundColor: BREAKDOWN.map(() => '#000000') }] },
    } as unknown as Chart<'doughnut'>;

    const labels = generateLabels!(fakeChart);
    expect(labels[0].text).toBe('Swimming (8)');
    expect(labels[5].text).toBe('Daily Steps (8)');
  });

  it('handles an empty breakdown (no activities in a very narrow range) without throwing', () => {
    const fixture = render([]);
    expect(summaryText(fixture)).toBe('No activities in this period.');
  });
});
