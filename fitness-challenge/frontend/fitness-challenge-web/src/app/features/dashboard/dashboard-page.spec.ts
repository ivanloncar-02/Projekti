import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { DashboardPage } from './dashboard-page';
import type { DashboardData } from '../../core/models/dashboard.model';
import type { ActivityResponse } from '../../core/models/activity.model';
import type { UserSummary } from '../../core/models/user.model';

// Captured verbatim from a real GET /api/users/{id}/dashboard?from=&to=
// response against the seeded backend (A9/B2/B3/B4/B5), for a 20-day window -
// not invented. totalPoints (27220, all-time) and the sum of daily[].points
// here (24026) are genuinely different real numbers, which is exactly the
// "two totals on one screen" case this phase has to render honestly. The
// seeder is deterministic (fixed Random seed, A9), so this exact point
// structure reproduces on every run even though the userId itself is a
// fresh Guid each time - re-captured after B5 added `activities` (the daily
// activity count the heatmap's tooltip needs) to daily[] (see
// docs/01-spec-backend.md section 3.6). Note activities can exceed the
// number of byType keys on a day (e.g. 2026-08-31: 4 activities, 3 sports) -
// byType sums points per sport, it doesn't count occurrences, which is
// exactly why activities had to be a real field, not derived from it.
const LUKA_ID = '8e66326e-0599-4ebf-b58a-a6f68d20c5a5';
const REAL_DASHBOARD: DashboardData = {
  userId: LUKA_ID,
  name: 'Luka Perić',
  totalPoints: 27220,
  rank: 1,
  totals: { activities: 43, distanceKm: 327.41, minutes: 790, steps: 101923 },
  daily: [
    { date: '2026-08-22', points: 714, distanceKm: 3.78, minutes: 35, steps: 0, activities: 2, byType: { swimming: 525, walking: 189 } },
    { date: '2026-08-23', points: 0, distanceKm: 0, minutes: 0, steps: 0, activities: 0, byType: {} },
    { date: '2026-08-24', points: 0, distanceKm: 0, minutes: 0, steps: 0, activities: 0, byType: {} },
    { date: '2026-08-25', points: 0, distanceKm: 0, minutes: 0, steps: 0, activities: 0, byType: {} },
    { date: '2026-08-26', points: 1915, distanceKm: 28.2, minutes: 0, steps: 9192, activities: 4, byType: { running: 1492, cycling: 332, steps: 91 } },
    { date: '2026-08-27', points: 0, distanceKm: 0, minutes: 0, steps: 0, activities: 0, byType: {} },
    { date: '2026-08-28', points: 0, distanceKm: 0, minutes: 0, steps: 0, activities: 0, byType: {} },
    { date: '2026-08-29', points: 335, distanceKm: 2, minutes: 47, steps: 0, activities: 2, byType: { walking: 100, gym: 235 } },
    { date: '2026-08-30', points: 854, distanceKm: 14.25, minutes: 64, steps: 11067, activities: 4, byType: { cycling: 287, walking: 137, steps: 110, gym: 320 } },
    { date: '2026-08-31', points: 1416, distanceKm: 7.73, minutes: 39, steps: 5893, activities: 4, byType: { running: 773, steps: 58, swimming: 585 } },
    { date: '2026-09-01', points: 1370, distanceKm: 45.23, minutes: 48, steps: 0, activities: 3, byType: { gym: 240, cycling: 1130 } },
    { date: '2026-09-02', points: 1669, distanceKm: 7.43, minutes: 54, steps: 11611, activities: 3, byType: { running: 743, steps: 116, swimming: 810 } },
    { date: '2026-09-03', points: 0, distanceKm: 0, minutes: 0, steps: 0, activities: 0, byType: {} },
    { date: '2026-09-04', points: 4363, distanceKm: 76.51, minutes: 106, steps: 0, activities: 4, byType: { cycling: 1493, running: 882, walking: 398, swimming: 1590 } },
    { date: '2026-09-05', points: 2928, distanceKm: 13.84, minutes: 90, steps: 19453, activities: 3, byType: { steps: 194, swimming: 1350, running: 1384 } },
    { date: '2026-09-06', points: 1798, distanceKm: 14.75, minutes: 58, steps: 19111, activities: 4, byType: { swimming: 870, walking: 737, steps: 191 } },
    { date: '2026-09-07', points: 3187, distanceKm: 56.38, minutes: 103, steps: 0, activities: 4, byType: { cycling: 1176, walking: 466, swimming: 1545 } },
    { date: '2026-09-08', points: 0, distanceKm: 0, minutes: 0, steps: 0, activities: 0, byType: {} },
    { date: '2026-09-09', points: 1881, distanceKm: 9.19, minutes: 83, steps: 17782, activities: 3, byType: { steps: 177, swimming: 1245, walking: 459 } },
    { date: '2026-09-10', points: 1596, distanceKm: 48.12, minutes: 63, steps: 7814, activities: 3, byType: { steps: 78, cycling: 1203, gym: 315 } },
  ],
  sportBreakdown: [
    { sport: 'swimming', activities: 8, points: 8520, distanceKm: 0 },
    { sport: 'cycling', activities: 7, points: 5621, distanceKm: 224.9 },
    { sport: 'running', activities: 7, points: 5274, distanceKm: 52.74 },
    { sport: 'walking', activities: 9, points: 2486, distanceKm: 49.77 },
    { sport: 'gym', activities: 4, points: 1110, distanceKm: 0 },
    { sport: 'steps', activities: 8, points: 1015, distanceKm: 0 },
  ],
  streak: { current: 2, longest: 5 },
};

const REAL_USERS: UserSummary[] = [{ id: LUKA_ID, firstName: 'Luka', lastName: 'Perić', totalPoints: 27220 }];

// One Daily Steps row (sport: null) - real shape from GET /api/activities,
// used to prove activitySportKey() (from B1) renders it as "Daily Steps"
// without this component special-casing null itself.
const REAL_ACTIVITIES: ActivityResponse[] = [
  {
    id: 'a1',
    userId: LUKA_ID,
    sport: null,
    datetime: '2026-09-09T09:00:00Z',
    distance: null,
    durationSeconds: null,
    steps: 7814,
    points: 78,
  },
  {
    id: 'a2',
    userId: LUKA_ID,
    sport: 'cycling',
    datetime: '2026-09-09T08:00:00Z',
    distance: 48.12,
    durationSeconds: null,
    steps: null,
    points: 1203,
  },
];

describe('DashboardPage', () => {
  let httpMock: HttpTestingController;
  let fixture: ComponentFixture<DashboardPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  async function createAndFlush(): Promise<void> {
    fixture = TestBed.createComponent(DashboardPage);
    fixture.componentRef.setInput('userId', LUKA_ID);
    fixture.detectChanges();

    httpMock.expectOne('/api/users').flush(REAL_USERS);
    httpMock.expectOne((req) => req.url.startsWith(`/api/users/${LUKA_ID}/dashboard`)).flush(REAL_DASHBOARD);
    httpMock
      .expectOne((req) => req.url.startsWith('/api/activities'))
      .flush({ items: REAL_ACTIVITIES, page: 1, pageSize: 100, totalCount: REAL_ACTIVITIES.length });

    // app-activity-heatmap (B5) is a child that only exists once the flush
    // above resolves - it owns its own, independent 12-week dashboard fetch
    // (see activity-heatmap.ts). Its httpResource's initial fetch is
    // scheduled via an effect, which needs a microtask tick before the
    // request actually reaches the backend - a single detectChanges() isn't
    // enough to observe it here.
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();
    httpMock.expectOne((req) => req.url.startsWith(`/api/users/${LUKA_ID}/dashboard`)).flush(REAL_DASHBOARD);

    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('shows all-time totalPoints and the window-scoped points sum as two distinctly labeled numbers', async () => {
    await createAndFlush();
    const el = fixture.nativeElement as HTMLElement;

    // The label reads "ALL-TIME" visually via CSS text-transform: uppercase -
    // textContent itself stays as authored ("All-time").
    expect(el.querySelector('.header-section')!.textContent).toContain('All-time');
    expect(el.querySelector('.header-section')!.textContent).toContain('27220');

    const kpiSection = el.querySelector('.kpi-section')!;
    expect(kpiSection.textContent).toContain('Showing:');
    expect(kpiSection.textContent).toContain('24026'); // sum of daily[].points above, not 27220
    expect(kpiSection.textContent).toContain('Points in this period');

    // The two numbers are genuinely different real values - the point of
    // this test - not the same figure shown twice under different labels.
    const daySum = REAL_DASHBOARD.daily.reduce((sum, d) => sum + d.points, 0);
    expect(daySum).toBe(24026);
    expect(daySum).not.toBe(REAL_DASHBOARD.totalPoints);
  });

  it('renders a Daily Steps row (sport: null) as a "Daily Steps" chip via activitySportKey()', async () => {
    await createAndFlush();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.textContent).toContain('Daily Steps');
    expect(el.textContent).toContain('7 814 steps');
  });

  it('formats a distance-based row using formatDistance', async () => {
    await createAndFlush();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.textContent).toContain('48.12 km');
  });
});
