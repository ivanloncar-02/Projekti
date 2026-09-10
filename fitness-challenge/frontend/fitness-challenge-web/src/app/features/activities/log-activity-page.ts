import { HttpErrorResponse, httpResource } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  type AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  type ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatOption, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivitiesService } from '../../core/api/activities.service';
import { UsersService } from '../../core/api/users.service';
import type { CreateActivityRequest, Sport } from '../../core/models/activity.model';
import type { ValidationProblemDetails } from '../../core/models/problem-details.model';
import type { UserSummary } from '../../core/models/user.model';
import { applyServerErrors } from '../../shared/server-errors';

const DURATION_PATTERN = /^\d{1,4}:[0-5]\d$/;
const FUTURE_WINDOW_MS = 24 * 60 * 60 * 1000;

type MetricKind = 'distance' | 'duration' | 'steps' | null;

// The five write-side Sport values a real mat-select choice can be, plus the
// UI-only sentinel 'steps' for the "Daily steps" option - never sent under
// the `sport` JSON key (that's the whole point: Daily Steps is reached by
// OMITTING sport, not by sending "steps" - CLAUDE.md rule 4). null means
// "nothing chosen yet", distinct from the deliberate 'steps' choice.
type SportControlValue = Sport | 'steps' | null;

const SPORT_OPTIONS: { value: Sport; label: string; metric: MetricKind }[] = [
  { value: 'running', label: 'Running', metric: 'distance' },
  { value: 'walking', label: 'Walking', metric: 'distance' },
  { value: 'cycling', label: 'Cycling', metric: 'distance' },
  { value: 'gym', label: 'Gym', metric: 'duration' },
  { value: 'swimming', label: 'Swimming', metric: 'duration' },
];

function metricKindFor(sport: SportControlValue): MetricKind {
  if (sport === 'steps') {
    return 'steps';
  }
  return SPORT_OPTIONS.find((o) => o.value === sport)?.metric ?? null;
}

function positiveNumberValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as number | null;
  return value === null || value > 0 ? null : { positive: true };
}

function positiveIntegerValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as number | null;
  return value === null || (Number.isInteger(value) && value > 0) ? null : { positiveInteger: true };
}

// Group-level: mirrors CreateActivityRequestValidator.BeWithinAllowedFutureWindow
// (docs/01-spec-backend.md section 4) - future datetimes are fine, more than 24h
// out isn't. Only fires once both date and time are actually filled in.
function futureWindowValidator(group: AbstractControl): ValidationErrors | null {
  const date = group.get('date')?.value as Date | null;
  const time = group.get('time')?.value as string | null;
  if (!date || !time) {
    return null;
  }
  const combined = combineDateAndTime(date, time);
  return combined && combined.getTime() > Date.now() + FUTURE_WINDOW_MS ? { futureWindow: true } : null;
}

function combineDateAndTime(date: Date, time: string): Date | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time);
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, 0, 0);
}

/** Log activity (spec section 9) - the metric field SWAPS reactively based on the
 * selected sport (distance / duration mm:ss / steps), which is the visible proof
 * of understanding the sport-metric pairing rules (docs/01-spec-backend.md section 4). */
@Component({
  selector: 'app-log-activity-page',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatError,
    MatSuffix,
    MatInput,
    MatSelect,
    MatOption,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatButton,
    MatProgressSpinner,
  ],
  // Route-scoped (B7): the date adapter is only needed here, and keeping it
  // off the global app.config lets the datepicker code stay in this lazy
  // route's chunk instead of the initial bundle.
  providers: [provideNativeDateAdapter()],
  templateUrl: './log-activity-page.html',
  styleUrl: './log-activity-page.scss',
})
export class LogActivityPage {
  private readonly activitiesService = inject(ActivitiesService);
  private readonly usersService = inject(UsersService);
  private readonly snackBar = inject(MatSnackBar);

  // No defaultValue (CLAUDE.md rule 12) so loading, loaded and errored stay
  // distinguishable - the template gates the whole form on this: without a
  // user list there's nobody to log an activity for.
  protected readonly users = httpResource<UserSummary[]>(() => '/api/users');

  protected readonly usersError = computed<string | null>(() => {
    const error = this.users.error();
    if (!error) {
      return null;
    }
    if (error instanceof HttpErrorResponse) {
      const title = (error.error as { title?: string } | null)?.title;
      return title ?? `Could not load users (${error.status}).`;
    }
    return 'Could not load users.';
  });

  protected readonly sportOptions = SPORT_OPTIONS;

  protected readonly form = new FormGroup(
    {
      userId: new FormControl<string | null>(null, { validators: [Validators.required] }),
      date: new FormControl<Date | null>(null, { validators: [Validators.required] }),
      time: new FormControl<string | null>(null, { validators: [Validators.required] }),
      sport: new FormControl<SportControlValue>(null, { validators: [Validators.required] }),
      distance: new FormControl<number | null>(null),
      duration: new FormControl<string | null>(null),
      steps: new FormControl<number | null>(null),
    },
    { validators: [futureWindowValidator] },
  );

  protected readonly metricKind = signal<MetricKind>(null);
  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);

  constructor() {
    this.form.controls.sport.valueChanges.pipe(takeUntilDestroyed()).subscribe((sport) => this.applyMetricKind(sport));
  }

  // Swaps which metric control is active - clears and disables the other two
  // so only the field that's actually valid for the chosen sport can hold a
  // value or fail validation, and the template's @switch shows just that one
  // field. The disappearance of one field and appearance of another IS the
  // visible proof of the pairing rules, not a relabeled input.
  private applyMetricKind(sport: SportControlValue): void {
    const kind = metricKindFor(sport);
    this.metricKind.set(kind);

    const { distance, duration, steps } = this.form.controls;
    distance.setValue(null);
    duration.setValue(null);
    steps.setValue(null);
    distance.clearValidators();
    duration.clearValidators();
    steps.clearValidators();

    if (kind === 'distance') {
      distance.setValidators([Validators.required, positiveNumberValidator]);
    } else if (kind === 'duration') {
      duration.setValidators([Validators.required, Validators.pattern(DURATION_PATTERN)]);
    } else if (kind === 'steps') {
      steps.setValidators([Validators.required, positiveIntegerValidator]);
    }

    distance.updateValueAndValidity();
    duration.updateValueAndValidity();
    steps.updateValueAndValidity();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { userId, date, time, sport, distance, duration, steps } = this.form.controls;
    const datetime = combineDateAndTime(date.value!, time.value!)!.toISOString();

    // The mapping this phase is actually about: sport === 'steps' means the
    // `sport` key is left off the request entirely, never sent as "steps".
    const request: CreateActivityRequest =
      sport.value === 'steps'
        ? { userId: userId.value!, datetime, steps: steps.value! }
        : {
            userId: userId.value!,
            datetime,
            sport: sport.value!,
            ...(this.metricKind() === 'distance' ? { distance: distance.value! } : { duration: duration.value! }),
          };

    this.formError.set(null);
    this.submitting.set(true);

    this.activitiesService.create(request).subscribe({
      next: (response) => {
        this.submitting.set(false);
        this.snackBar.open(`Activity logged - ${response.points} points.`, 'Dismiss', { duration: 5000 });
        this.resetForm();
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        this.handleError(error);
      },
    });
  }

  protected retryUsers(): void {
    this.users.reload();
  }

  private resetForm(): void {
    this.form.reset({ userId: this.form.controls.userId.value });
    this.applyMetricKind(null);
  }

  private handleError(error: unknown): void {
    if (!(error instanceof HttpErrorResponse) || error.status !== 400) {
      this.formError.set('Something went wrong. Please try again.');
      return;
    }

    const body = error.error as ValidationProblemDetails | null;
    this.formError.set(applyServerErrors(this.form, body?.errors ?? {}));
  }
}
