import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';
import { MatButtonToggle, MatButtonToggleGroup, type MatButtonToggleChange } from '@angular/material/button-toggle';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { EmptyState } from '../../shared/components/empty-state/empty-state';
import { LeaderboardPodium } from './leaderboard-podium';
import { LeaderboardRow } from './leaderboard-row';
import type { LeaderboardEntry } from '../../core/models/leaderboard.model';

type TrendWindow = 7 | 30;

@Component({
  selector: 'app-leaderboard-page',
  imports: [
    FormsModule,
    RouterLink,
    LeaderboardPodium,
    LeaderboardRow,
    EmptyState,
    MatButton,
    MatButtonToggle,
    MatButtonToggleGroup,
    MatFormField,
    MatLabel,
    MatIcon,
    MatInput,
    MatProgressSpinner,
  ],
  templateUrl: './leaderboard-page.html',
  styleUrl: './leaderboard-page.scss',
})
export class LeaderboardPage {
  private readonly router = inject(Router);

  protected readonly trendWindow = signal<TrendWindow>(7);
  protected readonly nameFilter = signal('');

  // No defaultValue: an empty array as the default would make hasValue()
  // true from the very first tick (loading, no response yet), making it
  // indistinguishable from "loaded, genuinely zero users" - both the spinner
  // gate and the empty-state check below depend on that distinction.
  protected readonly leaderboard = httpResource<LeaderboardEntry[]>(
    () => `/api/leaderboard?trendWindowDays=${this.trendWindow()}`,
  );

  // Unfiltered total, so "no users at all" and "no filter matches" (below)
  // stay two distinct, correctly-worded empty states.
  protected readonly totalCount = computed(() => (this.leaderboard.value() ?? []).length);

  private readonly filteredEntries = computed<LeaderboardEntry[]>(() => {
    const all = this.leaderboard.value() ?? [];
    const filter = this.nameFilter().trim().toLowerCase();
    return filter ? all.filter((e) => e.name.toLowerCase().includes(filter)) : all;
  });

  // Top 3 of whatever matches the current filter - when nothing/nobody in the
  // top 3 matches, this naturally shrinks to fewer cards or zero rather than
  // needing a separate "hide podium while filtering" branch. The wrapper's
  // CSS grid-row collapse animates that shrink instead of snapping to it -
  // see leaderboard-page.scss for why that matters.
  protected readonly podiumEntries = computed(() => this.filteredEntries().filter((e) => e.rank <= 3));
  protected readonly listEntries = computed(() => this.filteredEntries().filter((e) => e.rank > 3));

  protected readonly errorTitle = computed<string | null>(() => {
    const error = this.leaderboard.error();
    if (!error) {
      return null;
    }

    if (error instanceof HttpErrorResponse) {
      const title = (error.error as { title?: string } | null)?.title;
      return title ?? `Could not load the leaderboard (${error.status}).`;
    }

    return 'Could not load the leaderboard.';
  });

  protected onTrendWindowChange(event: MatButtonToggleChange): void {
    this.trendWindow.set(event.value as TrendWindow);
  }

  protected onSelect(userId: string): void {
    void this.router.navigate(['/dashboard', userId]);
  }

  protected retry(): void {
    this.leaderboard.reload();
  }
}
