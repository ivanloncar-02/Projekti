import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type {
  ActivitiesQuery,
  ActivityResponse,
  CreateActivityRequest,
  CreateActivityResponse,
  PagedResult,
} from '../models/activity.model';

@Injectable({ providedIn: 'root' })
export class ActivitiesService {
  private readonly http = inject(HttpClient);

  getAll(query: ActivitiesQuery = {}): Observable<PagedResult<ActivityResponse>> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) {
        params = params.set(key, value);
      }
    }

    return this.http.get<PagedResult<ActivityResponse>>('/api/activities', { params });
  }

  getById(id: string): Observable<ActivityResponse> {
    return this.http.get<ActivityResponse>(`/api/activities/${id}`);
  }

  create(request: CreateActivityRequest): Observable<CreateActivityResponse> {
    return this.http.post<CreateActivityResponse>('/api/activities', request);
  }
}
