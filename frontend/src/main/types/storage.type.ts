export type SameSite = 'strict' | 'lax' | 'none';

export interface CookieStorageData {
  path?: string;
  domain?: string;
  expires?: number;
  sameSite?: SameSite;
  secure?: boolean;
}
