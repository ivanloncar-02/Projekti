export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  totalPoints: number;
  previousRank: number | null;
  /** Null exactly when previousRank is null (isNew) - there's nothing to
   * compare against yet. previousRank - rank; positive = climbed. */
  rankChange: number | null;
  pointsInWindow: number;
  isNew: boolean;
}
