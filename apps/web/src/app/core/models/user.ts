export interface User {
  id: number;
  email: string;
  created_at: string;
}

export interface AuthSession {
  id: number;
  email: string;
  token: string;
  expires_at: string;
  expires_in: number;
}
