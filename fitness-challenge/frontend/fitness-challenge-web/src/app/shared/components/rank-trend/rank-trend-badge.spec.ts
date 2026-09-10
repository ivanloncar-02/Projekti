import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RankTrendBadge } from './rank-trend-badge';

// rankChange/isNew values below for the climb/drop/unchanged cases are taken
// verbatim from a real GET /api/leaderboard?trendWindowDays=7 response
// against the seeded backend (A9/B2), not invented numbers:
//   Luka Perić:   rank 1, previousRank 5, rankChange  4, isNew false
//   Ana Novak:    rank 2, previousRank 1, rankChange -1, isNew false
//   Marija Jurić: rank 6, previousRank 6, rankChange  0, isNew false
// isNew has no occurrence in the current seed data (every seeded user has
// pre-cutoff activity - see A9), so that case is constructed deliberately.

function render(rankChange: number | null, isNew: boolean): ComponentFixture<RankTrendBadge> {
  const fixture = TestBed.createComponent(RankTrendBadge);
  fixture.componentRef.setInput('rankChange', rankChange);
  fixture.componentRef.setInput('isNew', isNew);
  fixture.detectChanges();
  return fixture;
}

function badgeText(fixture: ComponentFixture<RankTrendBadge>): string {
  // Only the direct <span> child, not the <mat-icon> sibling - MatIcon
  // renders its ligature name ("arrow_upward") as literal text content,
  // which would otherwise leak into this and mask what's actually asserted.
  return (fixture.nativeElement as HTMLElement).querySelector('.rank-trend > span')!.textContent!.trim();
}

function ariaLabel(fixture: ComponentFixture<RankTrendBadge>): string | null {
  return (fixture.nativeElement as HTMLElement).querySelector('.rank-trend')!.getAttribute('aria-label');
}

describe('RankTrendBadge', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [RankTrendBadge] });
  });

  it('renders a climb (real data: Luka Perić, rankChange 4)', () => {
    const fixture = render(4, false);
    expect(badgeText(fixture)).toBe('+4');
    expect(ariaLabel(fixture)).toBe('Up 4 places');
    expect(fixture.nativeElement.querySelector('.rank-trend--up')).toBeTruthy();
  });

  it('renders a drop (real data: Ana Novak, rankChange -1)', () => {
    const fixture = render(-1, false);
    expect(badgeText(fixture)).toBe('-1');
    expect(ariaLabel(fixture)).toBe('Down 1 place');
    expect(fixture.nativeElement.querySelector('.rank-trend--down')).toBeTruthy();
  });

  it('renders unchanged (real data: Marija Jurić, rankChange 0)', () => {
    const fixture = render(0, false);
    expect(badgeText(fixture)).toBe('–');
    expect(ariaLabel(fixture)).toBe('Unchanged');
    expect(fixture.nativeElement.querySelector('.rank-trend--unchanged')).toBeTruthy();
  });

  it('renders the NEW chip (constructed - no isNew:true user exists in the current seed)', () => {
    const fixture = render(null, true);
    expect(badgeText(fixture)).toBe('NEW');
    expect(ariaLabel(fixture)).toBe('New to the leaderboard');
  });
});
