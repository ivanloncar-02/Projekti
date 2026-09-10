import { DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RankTrendBadge } from '../../shared/components/rank-trend/rank-trend-badge';
import { initials } from '../../shared/initials';
import type { LeaderboardEntry } from '../../core/models/leaderboard.model';

/** One ranking row: # / avatar / name / total points / trend / points this
 * window, as a CSS grid - not mat-table, so it can collapse to a stacked
 * card below 640px (spec section 7). A <button>, not role="row"+tabindex:
 * plain native keyboard operability for free. */
@Component({
  selector: 'app-leaderboard-row',
  imports: [RankTrendBadge, DecimalPipe],
  templateUrl: './leaderboard-row.html',
  styleUrl: './leaderboard-row.scss',
})
export class LeaderboardRow {
  readonly entry = input.required<LeaderboardEntry>();
  readonly pick = output<string>();

  protected readonly initials = initials;
}
