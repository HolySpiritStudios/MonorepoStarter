import {
  confirmResetPassword,
  confirmSignIn,
  fetchAuthSession,
  resetPassword,
  signIn,
  signInWithRedirect,
  signOut,
} from 'aws-amplify/auth';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';

import { AwsAuthUtilSignInOptions, AwsCurrentUserType, TokenResolverFunction } from '../../types/aws.type';
import { getLocaleUtil } from '../locale.util';
import { AwsCookieStorageUtil } from '../storage/aws-cookie-storage.util';
import { getToasterUtil } from '../toaster.util';

export class AwsAuthUtil {
  private tokenResolvers: TokenResolverFunction[] = [];
  private isRefreshingToken = false;
  private storage: AwsCookieStorageUtil | undefined;

  public readonly AWS_TOKEN_EXPIRATION_THRESHOLD = 1000 * 60 * 10; // 10 minutes

  private static instance: AwsAuthUtil;

  static getInstance(): AwsAuthUtil {
    if (!AwsAuthUtil.instance) {
      AwsAuthUtil.instance = new AwsAuthUtil();
    }

    return AwsAuthUtil.instance;
  }

  constructor(
    private readonly toasterUtil = getToasterUtil(),
    private readonly localeUtil = getLocaleUtil(),
  ) {
    // Set default value to use cookie storage, which is the default for remember me
    // if turns out user did not select remember me, it will be removed once user close the browser
    this.setTokenStorage(true);
  }

  private setTokenStorage(isRememberMe: boolean): void {
    try {
      this.storage = new AwsCookieStorageUtil({
        domain: window.location.hostname,
        secure: window.location.protocol === 'https:',
        path: '/',
        expires: isRememberMe ? 365 : undefined,
        sameSite: 'strict',
      });

      cognitoUserPoolsTokenProvider.setKeyValueStorage(this.storage);
    } catch (_e) {
      /* empty */
    }
  }

  getStorage(): AwsCookieStorageUtil | undefined {
    return this.storage;
  }

  private forceRemoveCognitoCookie(): void {
    const cookies = document.cookie.split(';');

    for (const cookie of cookies) {
      const trimmedCookie = cookie.trim();
      if (trimmedCookie.startsWith('CognitoIdentityServiceProvider')) {
        const cookieName = trimmedCookie.split('=')[0];
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname};`;
      }
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getIdToken();
    return Boolean(token);
  }

  async getCurrentUser(): Promise<undefined | AwsCurrentUserType> {
    const isAuthenticated = await this.isAuthenticated();
    if (!isAuthenticated) {
      return;
    }

    const authSession = await fetchAuthSession().catch(() => undefined);
    const idToken = authSession?.tokens?.idToken;

    if (idToken?.payload) {
      const email = idToken.payload.email as string;
      const name = idToken.payload.name as string;
      const userId = idToken.payload.userId as string;

      if (email && userId) {
        return {
          id: userId,
          email,
          name,
        };
      }
    }

    // If we can't get userId from token claims, something is wrong with auth flow
    // fetchUserAttributes() doesn't have custom claims, so we can't get userId
    return undefined;
  }

  async signIn(email: string, password: string, options: AwsAuthUtilSignInOptions): Promise<void> {
    this.setTokenStorage(options.isRememberMe);

    await signIn({
      username: email,
      password,
      options: { authFlowType: 'USER_PASSWORD_AUTH' },
    });
  }

  async signOut(): Promise<void> {
    await signOut().catch(() => undefined);
    this.forceRemoveCognitoCookie();
  }

  async signInWithGoogle(): Promise<void> {
    this.setTokenStorage(true);
    await signInWithRedirect({ provider: 'Google' });
  }

  async signInWithMagicToken(email: string, magicToken: string): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (user?.email === email) {
      return true;
    } else if (user) {
      await this.signOut();
      window.location.reload();
    }
    try {
      const options = { authFlowType: 'CUSTOM_WITHOUT_SRP' as const };
      await signIn({ username: email, options });
      await confirmSignIn({ challengeResponse: magicToken, options });
      return true;
    } catch (_e) {
      return false;
    }
  }

  async checkTokenAvailability(): Promise<boolean> {
    if (!this.storage) {
      return false;
    }

    const authSession = await fetchAuthSession().catch(() => undefined);
    return Boolean(authSession?.tokens?.accessToken);
  }

  async getTokenExpirationTime(): Promise<number | undefined> {
    const authSession = await fetchAuthSession().catch(() => undefined);
    const exp = authSession?.tokens?.idToken?.payload?.exp;
    return exp ? exp * 1000 : undefined;
  }

  async isTokenExpired(): Promise<boolean> {
    if (!this.storage) {
      return false;
    }

    const expirationDateTimeNumber = await this.getTokenExpirationTime();
    if (!expirationDateTimeNumber) {
      return true;
    }

    const tokenExpiryDate = new Date(expirationDateTimeNumber * 1000);
    const currentDate = new Date();

    const diff = tokenExpiryDate.getTime() - currentDate.getTime();
    return diff < this.AWS_TOKEN_EXPIRATION_THRESHOLD;
  }

  async getIdToken(): Promise<string | undefined> {
    const isTokenAvailable = await this.checkTokenAvailability();
    if (!isTokenAvailable) {
      return undefined;
    }

    const isTokenExpired = await this.isTokenExpired();
    if (isTokenExpired) {
      return await new Promise((resolve) => this.forceRefreshToken(resolve));
    }

    // If token is refreshing, wait for it to finish so we get the latest token
    if (this.isRefreshingToken) {
      return await new Promise((resolve) => this.forceRefreshToken(resolve));
    }

    const result = await fetchAuthSession().catch(() => undefined);
    if (!result?.tokens?.idToken?.toString()) {
      return await new Promise((resolve) => this.forceRefreshToken(resolve));
    }

    return result.tokens.idToken.toString();
  }

  async forceRefreshToken(resolver?: TokenResolverFunction): Promise<void> {
    if (resolver) {
      this.tokenResolvers.push(resolver);
    }

    if (this.isRefreshingToken) {
      return;
    }

    this.isRefreshingToken = true;

    const isTokenAvailable = await this.checkTokenAvailability();

    // If access-token and refresh-token is not available, no need to refresh the token
    if (!isTokenAvailable) {
      this.isRefreshingToken = false;
      this.tokenResolvers.forEach((resolve) => resolve(undefined));
      return;
    }

    const result = await fetchAuthSession({ forceRefresh: true }).catch(() => undefined);
    const token = result?.tokens?.idToken?.toString();

    this.tokenResolvers.forEach((resolve) => resolve(token));
    this.tokenResolvers = [];

    this.isRefreshingToken = false;

    // If token is still not available after refresh, sign out the user
    if (!token) {
      this.toasterUtil.showError(this.localeUtil.select('errors:auth_token_expired'));
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await this.signOut();

      window.location.reload();
    }
  }

  async forgotPassword(email: string): Promise<void> {
    await resetPassword({
      username: email,
    });
  }

  async confirmForgotPassword(email: string, code: string, newPassword: string): Promise<void> {
    await confirmResetPassword({
      username: email,
      confirmationCode: code,
      newPassword,
    });
  }
}

export const getAwsAuthUtil = (): AwsAuthUtil => AwsAuthUtil.getInstance();
