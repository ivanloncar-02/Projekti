import type { ActivityResponse } from './activity.model';
import type { SportKey } from './activity.model';

/**
 * ActivityResponse.sport is null for Daily Steps (mirrors the write-side
 * contract, where sport is omitted for it) - but every consumer that wants a
 * colour (--sport-*) or a label needs a real key, and "steps" is what
 * sportBreakdown/daily.byType already use for the same concept. Centralizing
 * the null check here means no component has to special-case it individually.
 */
export function activitySportKey(activity: ActivityResponse): SportKey {
  return activity.sport ?? 'steps';
}

/**
 * Human label for a SportKey - "Daily Steps" for the read-side-only 'steps'
 * key, title-cased sport name otherwise. Shared by sport-chip and B4's
 * sport-breakdown doughnut so the wording stays identical in both places.
 */
export function sportLabel(sport: SportKey): string {
  return sport === 'steps' ? 'Daily Steps' : sport.charAt(0).toUpperCase() + sport.slice(1);
}
