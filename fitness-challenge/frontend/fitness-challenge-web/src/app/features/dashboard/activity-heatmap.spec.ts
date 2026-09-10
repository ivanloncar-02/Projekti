import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivityHeatmap } from './activity-heatmap';
import type { DashboardData, DashboardDailyEntry } from '../../core/models/dashboard.model';

const USER_ID = 'u1';
const DAY_MS = 86_400_000;

// Builds a real-shaped, zero-filled daily[] across [from, to] (inclusive),
// exactly like BuildDaily on the backend - with specific dates overridden to
// have activity, so the component's own from/to (computed from "today" at
// construction time, not mockable here) still gets an internally-consistent
// response regardless of what day this test happens to run on.
function buildDaily(from: string, to: string, overrides: Record<string, { points: number; activities: number }>) {
  const days: DashboardDailyEntry[] = [];
  for (let d = new Date(`${from}T00:00:00Z`); d <= new Date(`${to}T00:00:00Z`); d = new Date(d.getTime() + DAY_MS)) {
    const date = d.toISOString().slice(0, 10);
    const override = overrides[date];
    days.push({
      date,
      points: override?.points ?? 0,
      distanceKm: 0,
      minutes: 0,
      steps: 0,
      activities: override?.activities ?? 0,
      byType: {},
    });
  }
  return days;
}

describe('ActivityHeatmap', () => {
  let httpMock: HttpTestingController;
  let fixture: ComponentFixture<ActivityHeatmap>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ActivityHeatmap],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  async function createAndFlush(overrides: Record<string, { points: number; activities: number }> = {}): Promise<void> {
    fixture = TestBed.createComponent(ActivityHeatmap);
    fixture.componentRef.setInput('userId', USER_ID);
    fixture.detectChanges();

    const req = httpMock.expectOne((r) => r.url.startsWith(`/api/users/${USER_ID}/dashboard`));
    // httpResource passes one pre-built URL string (query embedded, not a
    // separate HttpParams object), so req.request.params is empty - parse
    // the real query string off req.request.url instead.
    const url = new URL(req.request.url, 'http://localhost');
    const from = url.searchParams.get('from')!;
    const to = url.searchParams.get('to')!;

    const response: DashboardData = {
      userId: USER_ID,
      name: 'Test User',
      totalPoints: 0,
      rank: 1,
      totals: { activities: 0, distanceKm: 0, minutes: 0, steps: 0 },
      daily: buildDaily(from, to, overrides),
      sportBreakdown: [],
      streak: { current: 0, longest: 0 },
    };
    req.flush(response);

    await fixture.whenStable();
    fixture.detectChanges();
  }

  function cells(): HTMLButtonElement[] {
    return Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.heatmap-cell:not(.heatmap-cell--placeholder)'));
  }

  it('renders a 12x7 grid (84 slots) - real days plus hidden placeholders for any future days in the current week', async () => {
    await createAndFlush();
    const allSlots = (fixture.nativeElement as HTMLElement).querySelectorAll('.heatmap-cell');
    expect(allSlots.length).toBe(84);
    // Real (non-placeholder) days: everything up to and including today, so
    // at most 84 and at least 78 (today can be at most 6 days into its week).
    expect(cells().length).toBeLessThanOrEqual(84);
    expect(cells().length).toBeGreaterThanOrEqual(78);
  });

  it('gives an empty (zero-activity) day a sensible tooltip, not a blank or missing one', async () => {
    await createAndFlush();
    const emptyCell = cells()[0];
    const tooltip = emptyCell.getAttribute('aria-label');
    expect(tooltip).toMatch(/: 0 points, 0 activities$/);
  });

  it('gives an active day a tooltip with its real points and activity count', async () => {
    const today = new Date().toISOString().slice(0, 10);
    await createAndFlush({ [today]: { points: 250, activities: 3 } });

    const active = cells().find((c) => c.getAttribute('aria-label')?.startsWith(today));
    expect(active?.getAttribute('aria-label')).toBe(`${today}: 250 points, 3 activities`);
  });

  it('uses singular "activity" for a count of exactly one', async () => {
    const today = new Date().toISOString().slice(0, 10);
    await createAndFlush({ [today]: { points: 10, activities: 1 } });

    const active = cells().find((c) => c.getAttribute('aria-label')?.startsWith(today));
    expect(active?.getAttribute('aria-label')).toBe(`${today}: 10 points, 1 activity`);
  });

  it('gives an empty day and the lowest-activity day distinguishable background colours', async () => {
    const today = new Date().toISOString().slice(0, 10);
    await createAndFlush({ [today]: { points: 1, activities: 1 } });

    const empty = cells().find((c) => c.getAttribute('aria-label')?.endsWith('0 points, 0 activities'))!;
    const active = cells().find((c) => c.getAttribute('aria-label') === `${today}: 1 points, 1 activity`)!;

    expect(empty.style.background).not.toBe(active.style.background);
  });
});
