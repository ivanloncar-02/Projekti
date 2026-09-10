import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { DashboardData, DashboardQuery } from '../models/dashboard.model';
import type { CreateUserRequest, CreateUserResponse, UserSummary } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<UserSummary[]> {
    return this.http.get<UserSummary[]>('/api/users');
  }

  getById(id: string): Observable<UserSummary> {
    return this.http.get<UserSummary>(`/api/users/${id}`);
  }

  create(request: CreateUserRequest): Observable<CreateUserResponse> {
    return this.http.post<CreateUserResponse>('/api/users', request);
  }

  // Route is /api/users/{id}/dashboard, so this stays on UsersService rather
  // than a separate service (docs/02-spec-frontend.md section 3 lists exactly
  // three API services: users, activities, leaderboard).
  getDashboard(id: string, query: DashboardQuery = {}): Observable<DashboardData> {
    let params = new HttpParams();
    if (query.from) {
      params = params.set('from', query.from);
    }
    if (query.to) {
      params = params.set('to', query.to);
    }

    return this.http.get<DashboardData>(`/api/users/${id}/dashboard`, { params });
  }
}
