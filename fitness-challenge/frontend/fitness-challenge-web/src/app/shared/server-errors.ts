import type { FormGroup } from '@angular/forms';

/**
 * Maps a ValidationProblemDetails `errors` dict onto the matching controls of a
 * reactive form (keyed by the same camelCase names as the request JSON - userId,
 * datetime, sport, ... - see docs/01-spec-backend.md section 4). Any key that
 * doesn't match a control is NOT special-cased individually - it's the general
 * fallback, collected and returned as one joined message for a form-level banner.
 *
 * This deliberately covers "body" (a missing request body) and whatever
 * framework-shaped key a malformed-JSON failure produces WITHOUT enumerating
 * either by name: Angular's HttpClient serializes the request body itself, so
 * this UI can never actually construct a missing or malformed body - the only
 * way to exercise this path is a mocked response in a unit test, not the real
 * API. The same fallback also absorbs any error key the backend adds later,
 * without this function needing to know its name in advance.
 */
export function applyServerErrors(form: FormGroup, errors: Record<string, string[]>): string | null {
  const unmatched: string[] = [];

  for (const [key, messages] of Object.entries(errors)) {
    const message = messages.join(' ');
    const control = form.get(key);
    if (control) {
      control.setErrors({ server: message });
    } else {
      unmatched.push(message);
    }
  }

  return unmatched.length > 0 ? unmatched.join(' ') : null;
}
