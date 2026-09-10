/** "5.20 km" - always two decimal places, matching the history table column
 * format from docs/02-spec-frontend.md section 8. */
export function formatDistance(km: number): string {
  return `${km.toFixed(2)} km`;
}

/** Seconds -> "mm:ss", matching the request/response duration format. */
export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/** "8 400 steps" - space as the thousands separator (not a locale-dependent
 * comma/period, which would drift depending on where this runs). */
export function formatSteps(steps: number): string {
  return `${steps.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} steps`;
}
