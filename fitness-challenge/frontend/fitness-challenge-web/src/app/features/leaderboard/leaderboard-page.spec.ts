import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { LeaderboardPage } from './leaderboard-page';
import type { LeaderboardEntry } from '../../core/models/leaderboard.model';

// Captured verbatim from a real GET /api/leaderboard?trendWindowDays=7
// response against the seeded backend (A9/B2) - rank/previousRank/rankChange
// are not invented. This is the actual current-seed data: one climb (Luka),
// four drops (Ana, Ivan, Marko, Petra), one unchanged (Marija). No isNew user
// exists in the seed - that case is added deliberately per-test below.
const REAL_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userId: '1da2aeeb-2ba8-4a6c-b5a8-3a0136b5bd29', name: 'Luka Perić', totalPoints: 27220, previousRank: 5, rankChange: 4, pointsInWindow: 15753, isNew: false },
  { rank: 2, userId: 'ec47257d-685a-4720-98d0-5e1e823c80aa', name: 'Ana Novak', totalPoints: 25476, previousRank: 1, rankChange: -1, pointsInWindow: 1368, isNew: false },
  { rank: 3, userId: 'aebbc698-7fbe-44d2-b1e2-ab804b101900', name: 'Ivan Horvat', totalPoints: 25440, previousRank: 2, rankChange: -1, pointsInWindow: 1440, isNew: false },
  { rank: 4, userId: '39d0d8fc-24c1-4b9a-b4dd-0886a514fcad', name: 'Marko Kovačević', totalPoints: 25118, previousRank: 3, rankChange: -1, pointsInWindow: 10505, isNew: false },
  { rank: 5, userId: '8788da52-80d0-40e5-b6be-bd15ca601352', name: 'Petra Babić', totalPoints: 16175, previousRank: 4, rankChange: -1, pointsInWindow: 4560, isNew: false },
  { rank: 6, userId: '8dd0ca66-f08d-41c6-9e57-6fbdccd8f9d4', name: 'Marija Jurić', totalPoints: 2116, previousRank: 6, rankChange: 0, pointsInWindow: 360, isNew: false },
];

describe('LeaderboardPage', () => {
  let httpMock: HttpTestingController;
  let fixture: ComponentFixture<LeaderboardPage>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LeaderboardPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // httpResource updates its signals asynchronously (a microtask beyond the
  // flush itself) - whenStable() lets that settle before the follow-up
  // detectChanges(), which a single synchronous detectChanges() right after
  // flush() does not.
  async function createAndFlush(data: LeaderboardEntry[]): Promise<void> {
    fixture = TestBed.createComponent(LeaderboardPage);
    fixture.detectChanges();
    httpMock.expectOne('/api/leaderboard?trendWindowDays=7').flush(data);
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('shows a spinner before the response arrives', () => {
    fixture = TestBed.createComponent(LeaderboardPage);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelector('mat-progress-spinner')).toBeTruthy();

    httpMock.expectOne('/api/leaderboard?trendWindowDays=7').flush(REAL_LEADERBOARD);
  });

  it('renders the podium with the real top 3 and the list with the rest', async () => {
    await createAndFlush(REAL_LEADERBOARD);
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelectorAll('app-leaderboard-podium .podium-card').length).toBe(3);
    expect(el.textContent).toContain('Luka Perić');
    expect(el.textContent).toContain('Ana Novak');
    expect(el.textContent).toContain('Ivan Horvat');

    expect(el.querySelectorAll('app-leaderboard-row').length).toBe(3);
    expect(el.textContent).toContain('Marko Kovačević');
    expect(el.textContent).toContain('Petra Babić');
    expect(el.textContent).toContain('Marija Jurić');
  });

  it('renders the climb/drop/unchanged trend badges matching the real data', async () => {
    await createAndFlush(REAL_LEADERBOARD);
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelectorAll('.rank-trend--up').length).toBe(1); // Luka only
    expect(el.querySelectorAll('.rank-trend--down').length).toBe(4); // Ana, Ivan, Marko, Petra
    expect(el.querySelectorAll('.rank-trend--unchanged').length).toBe(1); // Marija
  });

  it('renders the NEW chip (constructed - no isNew user exists in the current seed)', async () => {
    const withNewUser: LeaderboardEntry[] = [
      ...REAL_LEADERBOARD,
      {
        rank: 7,
        userId: 'new-user-id',
        name: 'Nova Osoba',
        totalPoints: 50,
        previousRank: null,
        rankChange: null,
        pointsInWindow: 50,
        isNew: true,
      },
    ];
    await createAndFlush(withNewUser);

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.new-chip')).toBeTruthy();
    expect(el.textContent).toContain('NEW');
  });

  it('navigates to /dashboard/:userId on row click', async () => {
    await createAndFlush(REAL_LEADERBOARD);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    const rows = Array.from(fixture.nativeElement.querySelectorAll('app-leaderboard-row')) as HTMLElement[];
    const marijaRow = rows.find((r) => r.textContent!.includes('Marija Jurić'));
    expect(marijaRow).toBeTruthy();
    marijaRow!.querySelector('button')!.click();

    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard', '8dd0ca66-f08d-41c6-9e57-6fbdccd8f9d4']);
  });

  it('an empty filter match shows an empty state, not an empty podium', async () => {
    await createAndFlush(REAL_LEADERBOARD);
    const el = fixture.nativeElement as HTMLElement;

    const input = el.querySelector('input[matInput]') as HTMLInputElement;
    input.value = 'zzz-no-such-name';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(el.querySelector('app-leaderboard-podium .podium-card')).toBeFalsy();
    expect(el.textContent).toContain("No results for 'zzz-no-such-name'");
  });

  it('shows an error banner with a working retry on failure', async () => {
    fixture = TestBed.createComponent(LeaderboardPage);
    fixture.detectChanges();
    httpMock
      .expectOne('/api/leaderboard?trendWindowDays=7')
      .flush({ title: 'Database unavailable' }, { status: 500, statusText: 'Internal Server Error' });
    await fixture.whenStable();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Database unavailable');

    (el.querySelector('.error-banner button') as HTMLButtonElement).click();
    fixture.detectChanges();

    httpMock.expectOne('/api/leaderboard?trendWindowDays=7').flush(REAL_LEADERBOARD);
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Luka Perić');
  });
});
