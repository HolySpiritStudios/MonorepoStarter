export interface AuthTokenInfo {
  email: string;
  fullName: string;
}

export interface AuthContext {
  email: string;
  userId: string;
  platformId?: string;
}
