import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'lastDashboardUserId';

/**
 * Remembers the last-viewed dashboard userId so the shell's Dashboard nav
 * link has somewhere real to point. Written by the shell itself on every
 * NavigationEnd matching /dashboard/:userId, so it stays correct regardless
 * of which future feature (leaderboard row click, dashboard user picker,
 * a direct link) is what actually navigated there.
 */
@Injectable({ providedIn: 'root' })
export class RecentDashboardUserService {
  readonly userId = signal<string | null>(localStorage.getItem(STORAGE_KEY));

  remember(userId: string): void {
    this.userId.set(userId);
    localStorage.setItem(STORAGE_KEY, userId);
  }
}
