import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatToolbar } from '@angular/material/toolbar';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { RecentDashboardUserService } from './core/services/recent-dashboard-user.service';
import { ThemeService } from './core/services/theme.service';

const MOBILE_BREAKPOINT = '(max-width: 767.98px)';
const DASHBOARD_URL_PATTERN = /^\/dashboard\/([^/]+)$/;

@Component({
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbar,
    MatIcon,
    MatButton,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
  ],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private readonly theme = inject(ThemeService);
  private readonly recentDashboardUser = inject(RecentDashboardUserService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  protected readonly themeMode = this.theme.mode;
  protected readonly isMobileNav = toSignal(this.breakpointObserver.observe(MOBILE_BREAKPOINT), {
    requireSync: true,
  });

  // Always a real destination, never disabled - /leaderboard is where a user
  // gets chosen in the first place, so a first-time visitor lands somewhere
  // useful instead of a dead, greyed-out nav item.
  protected readonly dashboardLink = computed<string>(() => {
    const userId = this.recentDashboardUser.userId();
    return userId ? `/dashboard/${userId}` : '/leaderboard';
  });

  private readonly currentUrl = signal('');

  // routerLinkActive can't be used for this link: when no user is remembered
  // yet, dashboardLink() legitimately equals '/leaderboard', which would make
  // routerLinkActive highlight Dashboard too while actually on Leaderboard.
  protected readonly isDashboardActive = computed(() => this.currentUrl().startsWith('/dashboard'));

  constructor() {
    const router = inject(Router);
    const destroyRef = inject(DestroyRef);

    const subscription = router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects);

        const match = DASHBOARD_URL_PATTERN.exec(event.urlAfterRedirects);
        if (match) {
          this.recentDashboardUser.remember(match[1]);
        }
      });

    destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  protected toggleTheme(): void {
    this.theme.toggle();
  }
}
