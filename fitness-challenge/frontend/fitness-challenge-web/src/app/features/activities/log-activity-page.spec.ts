import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LogActivityPage } from './log-activity-page';
import type { UserSummary } from '../../core/models/user.model';

const USERS: UserSummary[] = [{ id: 'u1', firstName: 'Ivan', lastName: 'Horvat', totalPoints: 0 }];

// `form`/`metricKind`/`formError` are `protected` (template-only, per this
// codebase's convention) - bracket notation is the standard escape hatch used
// elsewhere (see B4's sport-breakdown-chart.spec.ts) to reach them from a
// spec without weakening the component's own public API.
function formOf(fixture: ComponentFixture<LogActivityPage>) {
  return fixture.componentInstance['form'];
}
function metricKindOf(fixture: ComponentFixture<LogActivityPage>) {
  return fixture.componentInstance['metricKind']();
}
function formErrorOf(fixture: ComponentFixture<LogActivityPage>) {
  return fixture.componentInstance['formError']();
}

describe('LogActivityPage', () => {
  let httpMock: HttpTestingController;
  let fixture: ComponentFixture<LogActivityPage>;
  let snackBar: MatSnackBar;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [LogActivityPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideNativeDateAdapter()],
    });
    httpMock = TestBed.inject(HttpTestingController);
    snackBar = TestBed.inject(MatSnackBar);
    vi.spyOn(snackBar, 'open');
    fixture = TestBed.createComponent(LogActivityPage);
    fixture.detectChanges();
    httpMock.expectOne('/api/users').flush(USERS);
    // The <form> is now gated on users.hasValue() (B7) - let the httpResource
    // value propagate before the tests reach for the rendered form.
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  function fillCommonFields(): void {
    const { userId, date, time } = formOf(fixture).controls;
    userId.setValue('u1');
    date.setValue(new Date(2026, 5, 1));
    time.setValue('10:30');
  }

  function submit(): void {
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  }

  it('shows no metric field until a sport is chosen', () => {
    expect(metricKindOf(fixture)).toBeNull();
  });

  it('swaps to a distance field for running/walking/cycling, and requires it', () => {
    formOf(fixture).controls.sport.setValue('running');
    expect(metricKindOf(fixture)).toBe('distance');
    expect(formOf(fixture).controls.distance.errors?.['required']).toBeTruthy();
  });

  it('swaps to a duration field for gym/swimming', () => {
    formOf(fixture).controls.sport.setValue('swimming');
    expect(metricKindOf(fixture)).toBe('duration');
  });

  it('swaps to a steps field for the Daily steps sentinel', () => {
    formOf(fixture).controls.sport.setValue('steps');
    expect(metricKindOf(fixture)).toBe('steps');
  });

  it('clears the previous metric value when the sport changes (running distance -> gym duration)', () => {
    const { sport, distance, duration } = formOf(fixture).controls;
    sport.setValue('running');
    distance.setValue(5);
    sport.setValue('gym');

    expect(distance.value).toBeNull();
    expect(duration.value).toBeNull();
  });

  it('the critical mapping: Daily steps omits `sport` from the request entirely, never sends "steps"', () => {
    fillCommonFields();
    const { sport, steps } = formOf(fixture).controls;
    sport.setValue('steps');
    steps.setValue(8000);

    submit();

    const req = httpMock.expectOne('/api/activities');
    expect('sport' in req.request.body).toBe(false);
    expect(req.request.body.steps).toBe(8000);
    req.flush({ id: 'a1', points: 80 }, { status: 201, statusText: 'Created' });
  });

  it('sends `sport` + `distance` for a distance sport (no steps/duration alongside it)', () => {
    fillCommonFields();
    const { sport, distance } = formOf(fixture).controls;
    sport.setValue('running');
    distance.setValue(5.2);

    submit();

    const req = httpMock.expectOne('/api/activities');
    expect(req.request.body).toEqual({
      userId: 'u1',
      datetime: expect.any(String),
      sport: 'running',
      distance: 5.2,
    });
    req.flush({ id: 'a1', points: 520 }, { status: 201, statusText: 'Created' });
  });

  it('sends `sport` + `duration` for a duration sport (swimming)', () => {
    fillCommonFields();
    const { sport, duration } = formOf(fixture).controls;
    sport.setValue('swimming');
    duration.setValue('30:00');

    submit();

    const req = httpMock.expectOne('/api/activities');
    expect(req.request.body).toEqual({
      userId: 'u1',
      datetime: expect.any(String),
      sport: 'swimming',
      duration: '30:00',
    });
    req.flush({ id: 'a1', points: 300 }, { status: 201, statusText: 'Created' });
  });

  it('shows the snackbar with points earned on success and resets the metric field', () => {
    fillCommonFields();
    const { sport, distance } = formOf(fixture).controls;
    sport.setValue('running');
    distance.setValue(5);

    submit();
    httpMock.expectOne('/api/activities').flush({ id: 'a1', points: 500 }, { status: 201, statusText: 'Created' });

    expect(snackBar.open).toHaveBeenCalledWith('Activity logged - 500 points.', 'Dismiss', { duration: 5000 });
    expect(metricKindOf(fixture)).toBeNull();
  });

  it("maps a 400 (e.g. the assignment's swimming+distance case) onto the distance control", () => {
    fillCommonFields();
    const { sport, duration } = formOf(fixture).controls;
    sport.setValue('swimming');
    duration.setValue('30:00');

    submit();

    httpMock.expectOne('/api/activities').flush(
      {
        title: 'One or more validation errors occurred.',
        status: 400,
        errors: { distance: ['Distance is not a valid metric for swimming.'] },
      },
      { status: 400, statusText: 'Bad Request' },
    );
    fixture.detectChanges();

    // distance isn't the currently-active metric control (duration is, for
    // swimming) - applyServerErrors still sets it; it just isn't rendered
    // since the @switch shows duration for this sport. The live-API check
    // (this UI actually being rejected end-to-end) is separate from this
    // unit test - see the B6 live verification notes.
    expect(formOf(fixture).controls.distance.errors?.['server']).toBe('Distance is not a valid metric for swimming.');
  });

  it('falls back to the form-level banner for an error key with no matching control', () => {
    fillCommonFields();
    formOf(fixture).controls.sport.setValue('steps');
    formOf(fixture).controls.steps.setValue(100);

    submit();

    httpMock.expectOne('/api/activities').flush(
      { title: 'A request body is required.', status: 400, errors: { body: ['A request body is required.'] } },
      { status: 400, statusText: 'Bad Request' },
    );
    fixture.detectChanges();

    expect(formErrorOf(fixture)).toBe('A request body is required.');
  });
});
