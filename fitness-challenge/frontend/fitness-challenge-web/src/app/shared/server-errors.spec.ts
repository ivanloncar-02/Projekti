import { FormControl, FormGroup } from '@angular/forms';
import { applyServerErrors } from './server-errors';

function buildForm(): FormGroup {
  return new FormGroup({
    userId: new FormControl(''),
    datetime: new FormControl(''),
    sport: new FormControl(''),
  });
}

describe('applyServerErrors', () => {
  it('sets a server error on each control whose key matches', () => {
    const form = buildForm();

    const banner = applyServerErrors(form, {
      sport: ["'foo' is not a recognized sport."],
      userId: ['User does not exist.'],
    });

    expect(form.get('sport')!.errors).toEqual({ server: "'foo' is not a recognized sport." });
    expect(form.get('userId')!.errors).toEqual({ server: 'User does not exist.' });
    expect(banner).toBeNull();
  });

  it('joins multiple messages for the same control into one string', () => {
    const form = buildForm();

    applyServerErrors(form, { sport: ['First problem.', 'Second problem.'] });

    expect(form.get('sport')!.errors).toEqual({ server: 'First problem. Second problem.' });
  });

  // The UI can never actually construct a missing/malformed body itself -
  // HttpClient serializes the request, so this only happens via a mocked
  // response, not the real API (see shared/server-errors.ts's own comment).
  it('falls back to a form-level banner for a key with no matching control ("body")', () => {
    const form = buildForm();

    const banner = applyServerErrors(form, { body: ['A request body is required.'] });

    expect(banner).toBe('A request body is required.');
    expect(form.get('userId')!.errors).toBeNull();
    expect(form.get('datetime')!.errors).toBeNull();
    expect(form.get('sport')!.errors).toBeNull();
  });

  it('falls back to the banner for an arbitrary framework-shaped key (malformed JSON), same as "body"', () => {
    const form = buildForm();

    // ASP.NET Core's own model-binding failures don't use this app's field
    // names - this is deliberately NOT one of userId/datetime/sport/etc.
    const banner = applyServerErrors(form, { '$.distance': ['The JSON value could not be converted.'] });

    expect(banner).toBe('The JSON value could not be converted.');
  });

  it('mixes matched controls and an unmatched banner in the same response', () => {
    const form = buildForm();

    const banner = applyServerErrors(form, {
      sport: ['Sport is invalid.'],
      body: ['Something else the form has no control for.'],
    });

    expect(form.get('sport')!.errors).toEqual({ server: 'Sport is invalid.' });
    expect(banner).toBe('Something else the form has no control for.');
  });

  it('returns null when there are no errors at all', () => {
    const form = buildForm();
    expect(applyServerErrors(form, {})).toBeNull();
  });
});
