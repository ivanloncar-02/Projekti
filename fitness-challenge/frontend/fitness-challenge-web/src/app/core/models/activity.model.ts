/** Write-side sport value (POST /api/activities). Daily Steps has no literal
 * value here - it's reached by omitting `sport` and sending `steps` instead
 * (CLAUDE.md rule 4). */
export type Sport = 'running' | 'walking' | 'cycling' | 'gym' | 'swimming';

/** Read-side sport key: the six values actually returned by sportBreakdown[].sport
 * and daily[].byType keys, and the only valid suffixes for --sport-* CSS variables.
 * "steps" is real here even though it's never a valid `Sport` to submit. */
export type SportKey = Sport | 'steps';

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface ActivityResponse {
  id: string;
  userId: string;
  /** null for Daily Steps - mirrors the write-side convention where sport is
   * omitted for it. Use activitySportKey() from sport.helpers.ts to get a
   * non-null SportKey for colour/label lookups instead of special-casing null
   * at every call site. */
  sport: Sport | null;
  datetime: string;
  distance: number | null;
  durationSeconds: number | null;
  steps: number | null;
  points: number;
}

export interface CreateActivityRequest {
  userId: string;
  datetime: string;
  sport?: Sport;
  steps?: number;
  distance?: number;
  duration?: string;
}

export interface CreateActivityResponse {
  id: string;
  points: number;
}

export interface ActivitiesQuery {
  userId?: string;
  from?: string;
  to?: string;
  sport?: SportKey;
  page?: number;
  pageSize?: number;
}
