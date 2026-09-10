export interface UserSummary {
  id: string;
  firstName: string;
  lastName: string;
  totalPoints: number;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
}

export interface CreateUserResponse {
  id: string;
}
