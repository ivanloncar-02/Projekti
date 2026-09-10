import { DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RankTrendBadge } from '../../shared/components/rank-trend/rank-trend-badge';
import { initials } from '../../shared/initials';
import type { LeaderboardEntry } from '../../core/models/leaderboard.model';

/** Top 3 only. DOM order is always rank order (1, 2, 3) so the mobile stack
 * ("below 640px in rank order", spec section 7) needs no extra logic - only
 * the desktop layout visually reorders to 2nd-1st-3rd via CSS `order`. */
@Component({
  selector: 'app-leaderboard-podium',
  imports: [RankTrendBadge, DecimalPipe],
  templateUrl: './leaderboard-podium.html',
  styleUrl: './leaderboard-podium.scss',
})
export class LeaderboardPodium {
  readonly entries = input.required<LeaderboardEntry[]>();
  readonly pick = output<string>();

  protected readonly initials = initials;
}
