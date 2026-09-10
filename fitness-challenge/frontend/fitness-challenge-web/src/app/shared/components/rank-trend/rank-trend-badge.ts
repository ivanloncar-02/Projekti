import { Component, computed, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

type TrendState =
  | { kind: 'new' }
  | { kind: 'unchanged' }
  | { kind: 'up'; places: number }
  | { kind: 'down'; places: number };

/**
 * Reusable rank-trend indicator: up (green, arrow) / down (red, arrow) /
 * unchanged (muted dash) / NEW chip. Shape and text carry the meaning, not
 * just colour (spec section 7). rankChange is number | null - null happens
 * exactly when isNew is true (no previous rank to compare against).
 */
@Component({
  selector: 'app-rank-trend-badge',
  imports: [MatIcon],
  templateUrl: './rank-trend-badge.html',
  styleUrl: './rank-trend-badge.scss',
})
export class RankTrendBadge {
  readonly rankChange = input.required<number | null>();
  readonly isNew = input.required<boolean>();

  protected readonly trend = computed<TrendState>(() => {
    if (this.isNew()) {
      return { kind: 'new' };
    }

    const change = this.rankChange();
    if (!change) {
      return { kind: 'unchanged' };
    }

    return change > 0 ? { kind: 'up', places: change } : { kind: 'down', places: -change };
  });

  protected readonly label = computed<string>(() => {
    const t = this.trend();
    switch (t.kind) {
      case 'new':
        return 'New to the leaderboard';
      case 'unchanged':
        return 'Unchanged';
      case 'up':
        return `Up ${t.places} place${t.places === 1 ? '' : 's'}`;
      case 'down':
        return `Down ${t.places} place${t.places === 1 ? '' : 's'}`;
    }
  });
}
