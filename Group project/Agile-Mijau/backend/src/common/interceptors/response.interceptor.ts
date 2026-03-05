import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // If data is null or undefined, return appropriate structure
        if (data === null || data === undefined) {
          const request = context.switchToHttp().getRequest();
          const path = request.url;

          // For list endpoints, return empty array with meta
          if (this.isListEndpoint(path)) {
            return {
              items: [],
              meta: {
                total: 0,
                page: 1,
                limit: 20,
                totalPages: 0,
              },
            };
          }

          // For other endpoints, return null
          return null;
        }

        // If data already has items array, ensure meta exists
        if (Array.isArray(data)) {
          return {
            items: data,
            meta: {
              total: data.length,
              page: 1,
              limit: data.length,
              totalPages: 1,
            },
          };
        }

        // If data has items but no meta, add default meta
        if (data.items !== undefined && !data.meta) {
          return {
            ...data,
            meta: {
              total: data.items.length,
              page: 1,
              limit: data.items.length,
              totalPages: 1,
            },
          };
        }

        return data;
      }),
    );
  }

  private isListEndpoint(path: string): boolean {
    // Check if path matches list endpoints (no UUID in path)
    const listPatterns = [
      /\/api\/[^/]+$/,
      /\/api\/admin\/[^/]+$/,
      /\/api\/students\/me\/[^/]+$/,
    ];

    return listPatterns.some((pattern) => pattern.test(path));
  }
}
