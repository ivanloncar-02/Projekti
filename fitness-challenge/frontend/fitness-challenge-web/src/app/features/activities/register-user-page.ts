import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UsersService } from '../../core/api/users.service';
import type { ProblemDetails, ValidationProblemDetails } from '../../core/models/problem-details.model';
import { applyServerErrors } from '../../shared/server-errors';

/** Register user (spec section 9): two mat-form-fields, success via MatSnackBar with
 * the returned id, 409 duplicate-name rendered under lastName (the pair is what's
 * actually unique - see docs/01-spec-backend.md section 3.1). */
@Component({
  selector: 'app-register-user-page',
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatError, MatButton],
  templateUrl: './register-user-page.html',
  styleUrl: './register-user-page.scss',
})
export class RegisterUserPage {
  private readonly usersService = inject(UsersService);
  private readonly snackBar = inject(MatSnackBar);

  // Mirrors CreateUserRequestValidator: required, max 100 chars each.
  protected readonly form = new FormGroup({
    firstName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    lastName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
  });

  protected readonly submitting = signal(false);
  protected readonly formError = signal<string | null>(null);

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formError.set(null);
    this.submitting.set(true);

    this.usersService.create(this.form.getRawValue()).subscribe({
      next: (response) => {
        this.submitting.set(false);
        this.snackBar.open(`User created - id ${response.id}`, 'Dismiss', { duration: 5000 });
        this.form.reset({ firstName: '', lastName: '' });
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        this.handleError(error);
      },
    });
  }

  private handleError(error: unknown): void {
    if (!(error instanceof HttpErrorResponse)) {
      this.formError.set('Something went wrong. Please try again.');
      return;
    }

    if (error.status === 409) {
      const body = error.error as ProblemDetails | null;
      this.form
        .get('lastName')!
        .setErrors({ server: body?.title ?? 'A user with this name already exists.' });
      return;
    }

    if (error.status === 400) {
      const body = error.error as ValidationProblemDetails | null;
      this.formError.set(applyServerErrors(this.form, body?.errors ?? {}));
      return;
    }

    this.formError.set('Something went wrong. Please try again.');
  }
}
