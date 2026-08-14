export interface AuthClaims {
  userId: number;
  sessionId: string;
  exp?: number;
}

export interface AuthSessionResult {
  id: number;
  email: string;
  token: string;
  expires_at: string;
  expires_in: number;
}

export interface SerializedUser {
  id: number;
  email: string;
  created_at: string;
}
