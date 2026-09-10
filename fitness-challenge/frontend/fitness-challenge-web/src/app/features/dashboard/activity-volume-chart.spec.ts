import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivityVolumeChart } from './activity-volume-chart';
import type { DashboardDailyEntry } from '../../core/models/dashboard.model';

// Three consecutive days lifted verbatim from dashboard-page.spec.ts's
// REAL_DASHBOARD.daily fixture (itself captured from a real GET
// /api/users/{id}/dashboard response) - not invented numbers.
const DAILY: DashboardDailyEntry[] = [
  { date: '2026-08-29', points: 335, distanceKm: 2, minutes: 47, steps: 0, activities: 2, byType: { walking: 100, gym: 235 } },
  {
    date: '2026-08-30',
    points: 854,
    distanceKm: 14.25,
    minutes: 64,
    steps: 11067,
    activities: 4,
    byType: { cycling: 287, walking: 137, steps: 110, gym: 320 },
  },
  {
    date: '2026-08-31',
    points: 1416,
    distanceKm: 7.73,
    minutes: 39,
    steps: 5893,
    activities: 4,
    byType: { running: 773, steps: 58, swimming: 585 },
  },
];

function render(): ComponentFixture<ActivityVolumeChart> {
  const fixture = TestBed.createComponent(ActivityVolumeChart);
  fixture.componentRef.setInput('daily', DAILY);
  fixture.componentRef.setInput('rangeWindowDays', 30);
  fixture.detectChanges();
  return fixture;
}

function summaryText(fixture: ComponentFixture<ActivityVolumeChart>): string {
  return (fixture.nativeElement as HTMLElement).querySelector('[chartSummary]')!.textContent!.trim();
}

// mat-button-toggle wraps a real <button> - clicking that (found by the
// toggle's own rendered label text, not an internal Material class per
// CLAUDE.md rule 5) is what a user interaction actually looks like.
function clickToggle(fixture: ComponentFixture<ActivityVolumeChart>, groupAriaLabel: string, label: string): void {
  const group = (fixture.nativeElement as HTMLElement).querySelector(`[aria-label="${groupAriaLabel}"]`)!;
  const toggle = Array.from(group.querySelectorAll('mat-button-toggle')).find(
    (el) => el.textContent?.trim() === label,
  )!;
  (toggle.querySelector('button') as HTMLButtonElement).click();
  fixture.detectChanges();
}

describe('ActivityVolumeChart', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ActivityVolumeChart] });
  });

  it('defaults to the points metric and summarises the real total (335 + 854 + 1416 = 2605)', () => {
    const fixture = render();
    expect(summaryText(fixture)).toContain('Points per day');
    expect(summaryText(fixture)).toContain('Total: 2605 points');
  });

  it('switches to the km metric on toggle click and summarises that total instead (2 + 14.25 + 7.73 = 23.98)', () => {
    const fixture = render();
    clickToggle(fixture, 'Chart metric', 'Km');
    expect(summaryText(fixture)).toContain('Distance (km) per day');
    expect(summaryText(fixture)).toContain('Total: 23.98 km');
  });

  it('emits rangeWindowDaysChange when the range toggle is clicked, without touching the metric', () => {
    const fixture = render();
    const emitted: number[] = [];
    fixture.componentInstance.rangeWindowDaysChange.subscribe((days) => emitted.push(days));

    clickToggle(fixture, 'Date range', '7 days');

    expect(emitted).toEqual([7]);
    // Range is owned by the parent (DashboardPage) - this component doesn't
    // reflect the change back into its own rendering until re-fed via the
    // input, so the metric-derived summary is untouched by this click.
    expect(summaryText(fixture)).toContain('Points per day');
  });
});
