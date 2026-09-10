import type { SportKey } from './activity.model';

/** The three window sizes Chart 1's range toggle offers (spec section 8). */
export type RangeWindowDays = 7 | 30 | 90;

/** The three per-day fields Chart 1's metric toggle switches between - one
 * DashboardDailyEntry key per option (spec section 8: "points / km / minutes"). */
export type ChartMetric = 'points' | 'distanceKm' | 'minutes';

export interface DashboardTotals {
  activities: number;
  distanceKm: number;
  minutes: number;
  steps: number;
}

export interface DashboardDailyEntry {
  date: string;
  points: number;
  // Added in B4 for the chart's metric toggle (points/km/minutes) - real
  // per-day values, not reconstructed client-side from points.
  distanceKm: number;
  minutes: number;
  steps: number;
  // Added in B5 - the heatmap's tooltip needs "date + points + activity
  // count"; points alone can't distinguish one big activity from several
  // small ones on the same day.
  activities: number;
  byType: Partial<Record<SportKey, number>>;
}

export interface DashboardSportBreakdownEntry {
  sport: SportKey;
  activities: number;
  points: number;
  distanceKm: number;
}

export interface DashboardStreak {
  current: number;
  longest: number;
}

export interface DashboardData {
  userId: string;
  name: string;
  /** All-time - the user's real leaderboard standing, not scoped to from/to.
   * See docs/01-spec-backend.md section 3.6 and docs/02-spec-frontend.md
   * section 5: a date-range picker must only re-fetch/re-render totals,
   * daily and sportBreakdown - this and rank/streak stay fixed. */
  totalPoints: number;
  /** All-time. */
  rank: number;
  /** Scoped to [from, to]. */
  totals: DashboardTotals;
  /** Scoped to [from, to], gap days filled with zero-point entries. */
  daily: DashboardDailyEntry[];
  /** Scoped to [from, to]. */
  sportBreakdown: DashboardSportBreakdownEntry[];
  /** All-time. */
  streak: DashboardStreak;
}

export interface DashboardQuery {
  from?: string;
  to?: string;
}
