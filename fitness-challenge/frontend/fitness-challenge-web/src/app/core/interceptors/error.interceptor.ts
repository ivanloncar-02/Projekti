import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

/**
 * Surfaces HTTP errors through MatSnackBar. Validation errors (400, field-keyed
 * ValidationProblemDetails) and 409 (duplicate-name conflict) are re-thrown
 * WITHOUT a toast so a form can map them onto individual controls / a form-level
 * banner instead (see B6) - a generic "Request failed (400)" toast on top of the
 * form's own field errors would just be noise. Everything else (network failure,
 * 401/403/404, 500) still gets the toast, since nothing else is positioned to
 * show it.
 *
 * This distinction was previously only a comment, not the actual code - the
 * snackbar fired unconditionally for every HttpErrorResponse. Nothing exercised
 * this path before B6 built the first forms that call these endpoints.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status !== 400 && error.status !== 409) {
        snackBar.open(errorMessage(error), 'Dismiss', { duration: 5000 });
      }

      return throwError(() => error);
    }),
  );
};

function errorMessage(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'Cannot reach the server. Check your connection and try again.';
  }

  const title = (error.error as { title?: string } | null)?.title;
  return title ?? `Request failed (${error.status}).`;
}
