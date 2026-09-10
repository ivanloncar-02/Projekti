import { Routes } from '@angular/router';

// Lazy per route (B7): the initial bundle no longer carries the dashboard's
// chart.js/ng2-charts (~187 kB) or the log-activity form's datepicker for a
// visitor who only opens the leaderboard. withComponentInputBinding still
// binds :userId -> DashboardPage.userId with loadComponent.
export const routes: Routes = [
  { path: '', redirectTo: 'leaderboard', pathMatch: 'full' },
  {
    path: 'leaderboard',
    loadComponent: () => import('./features/leaderboard/leaderboard-page').then((m) => m.LeaderboardPage),
  },
  {
    path: 'dashboard/:userId',
    loadComponent: () => import('./features/dashboard/dashboard-page').then((m) => m.DashboardPage),
  },
  {
    path: 'activities/new',
    loadComponent: () => import('./features/activities/log-activity-page').then((m) => m.LogActivityPage),
  },
  {
    path: 'users/new',
    loadComponent: () => import('./features/activities/register-user-page').then((m) => m.RegisterUserPage),
  },
];
