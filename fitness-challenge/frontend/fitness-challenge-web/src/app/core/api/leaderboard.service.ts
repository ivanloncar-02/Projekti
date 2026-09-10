import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type { LeaderboardEntry } from '../models/leaderboard.model';

@Injectable({ providedIn: 'root' })
export class LeaderboardService {
  private readonly http = inject(HttpClient);

  get(trendWindowDays?: number): Observable<LeaderboardEntry[]> {
    let params = new HttpParams();
    if (trendWindowDays !== undefined) {
      params = params.set('trendWindowDays', trendWindowDays);
    }

    return this.http.get<LeaderboardEntry[]>('/api/leaderboard', { params });
  }
}
