export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function parseApiError(response: Response, errorData: any): ApiError {
  switch (response.status) {
    case 410:
      return new ApiError(
        410,
        'Ova praksa više nije dostupna za prijave',
        errorData
      );
    case 409:
      return new ApiError(
        409,
        'Već ste se prijavili na ovu praksu',
        errorData
      );
    case 400:
      return new ApiError(
        400,
        errorData?.message || 'Nevažeći podaci. Provjerite unesene informacije.',
        errorData
      );
    case 500:
      return new ApiError(
        500,
        'Greška servera. Pokušajte ponovno kasnije.',
        errorData
      );
    default:
      return new ApiError(
        response.status,
        errorData?.message || `HTTP greška! status: ${response.status}`,
        errorData
      );
  }
}
