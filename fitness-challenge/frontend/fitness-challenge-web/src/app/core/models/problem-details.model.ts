/** ASP.NET Core's ValidationProblemDetails shape (docs/01-spec-backend.md section 4) -
 * `errors` keys match the request JSON's own field names (userId, datetime, sport,
 * distance, duration, steps / firstName, lastName), except for cases the UI can never
 * produce itself (a missing body -> "body"; malformed JSON -> framework-chosen keys).
 * Those aren't enumerated here - see shared/server-errors.ts's catch-all instead. */
export interface ValidationProblemDetails {
  title?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

/** The plain ProblemDetails shape for the 409 duplicate-name conflict - no `errors`
 * dict, just a title (see UsersController.Create). */
export interface ProblemDetails {
  title?: string;
  status?: number;
}
