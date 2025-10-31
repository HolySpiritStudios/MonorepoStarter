import { randomBytes } from 'crypto';
import { JWTPayload, createRemoteJWKSet, jwtVerify } from 'jose';

import { User } from '../../common/entities/user.entity';
import { CognitoService } from '../../common/integrations/aws/services/cognito.service';
import { AuthContext, AuthTokenInfo } from '../../common/models/auth-context.model';
import { UserRepository } from '../../common/repositories/user.repository';
import { EnvironmentService, EnvironmentVariable } from '../../common/utils/environment.util';
import { InvalidArgumentsError } from '../../common/utils/errors';
import { getAppLogger } from '../../common/utils/logger.util';
import { SignUpRequest } from '../models/sign-up.request';
import { MagicTokenRepository } from '../repositories/magic-token.repository';

const logger = getAppLogger('authentication-service');

const MAGIC_TOKEN_EXPIRATION_TIME = 5 * 60 * 1000;

export class AuthenticationService {
  constructor(
    private readonly cognitoService: CognitoService,
    private readonly userRepository: UserRepository,
    private readonly environmentService: EnvironmentService,
  ) {}

  async signUp(signUpRequest: SignUpRequest): Promise<User> {
    const { email, password, fullName } = signUpRequest;
    const normalizedEmail = email.toLowerCase();

    const existingUser = await this.userRepository.findUserByEmail(normalizedEmail);
    if (existingUser) {
      throw new InvalidArgumentsError('User already exists');
    }

    try {
      const user = await this.userRepository.upsertUser({ email: normalizedEmail, fullName });
      await this.cognitoService.createUser(normalizedEmail, fullName);
      await this.cognitoService.setUserPassword(normalizedEmail, password);

      return user;
    } catch (error) {
      logger.error('Error signing up user:', { error });
      throw error;
    }
  }

  async getAuthContext({ email, fullName }: AuthTokenInfo): Promise<AuthContext> {
    const finalUser = await this.resolveFinalUser(email, fullName);

    return {
      email,
      userId: finalUser.id,
      platformId: finalUser.platformId,
    };
  }

  private async resolveFinalUser(email: string, fullName: string): Promise<User> {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      logger.info('No user found for email during token generation', { email });
      return await this.userRepository.upsertUser({ email, fullName });
    }
    return user;
  }

  async handleLtiLaunch(idToken: string): Promise<{ redirectUrl: string }> {
    const issuer = this.environmentService.get(EnvironmentVariable.LTI_ISSUER);
    const jwksUrl = this.environmentService.get(EnvironmentVariable.LTI_JWKS_URL);
    const audience = this.environmentService.getOptional(EnvironmentVariable.LTI_AUDIENCE);

    const { payload } = await this.verifyLtiIdToken(idToken, { issuer, jwksUrl, audience });
    const tokenUser = this.extractUserIdentity(payload);
    const user = await this.ensureUserInDatabase(tokenUser);
    const username = await this.cognitoService.ensureUser(user.email, user.fullName);
    const magicToken = await this.generateMagicToken(username, user.id, user.email);

    const redirectUrl = this.buildFrontendRedirectUrl(magicToken, user.email);
    logger.info('LTI launch processed, redirecting', { userId: user.id });
    return { redirectUrl };
  }

  private extractUserIdentity(payload: JWTPayload): Omit<User, 'id'> {
    const email = (payload.email as string | undefined)?.toLowerCase();
    const fullName =
      (payload.name as string | undefined) ||
      [payload.given_name, payload.family_name].filter(Boolean).join(' ') ||
      'Unknown';
    const platformId = payload.sub;
    if (!email) {
      throw new InvalidArgumentsError('LTI token missing required claim: email');
    }
    return { email, fullName, platformId };
  }

  private async ensureUserInDatabase(user: Omit<User, 'id'>) {
    const existing = await this.userRepository.findUserByEmail(user.email);
    if (existing) {
      return this.userRepository.upsertUser({ ...existing, ...user });
    } else {
      return this.userRepository.upsertUser(user);
    }
  }

  private async generateMagicToken(username: string, userId: string, email: string): Promise<string> {
    const repo = new MagicTokenRepository(this.environmentService);
    const token = randomBytes(32).toString('hex');
    const now = Date.now();
    const expiresAt = new Date(now + MAGIC_TOKEN_EXPIRATION_TIME).toISOString();
    await repo.put({ token, username, userId, email, expiresAt });
    return token;
  }

  private async verifyLtiIdToken(
    idToken: string,
    opts: { issuer: string; jwksUrl: string; audience?: string },
  ): Promise<{ payload: JWTPayload }> {
    const JWKS = createRemoteJWKSet(new URL(opts.jwksUrl));
    try {
      const verified = await jwtVerify(idToken, JWKS, {
        issuer: opts.issuer,
        audience: opts.audience,
      });
      return { payload: verified.payload };
    } catch (error) {
      logger.error('Error verifying LTI ID token', { error });
      throw new InvalidArgumentsError('Invalid LTI ID token');
    }
  }

  private buildFrontendRedirectUrl(magicToken: string, email: string): string {
    const frontendBaseUrl = this.environmentService.get(EnvironmentVariable.FRONTEND_BASE_URL);
    const params = new URLSearchParams({ magicToken, email });
    return `${frontendBaseUrl}/?${params.toString()}`;
  }

  public async verifyMagicLinkChallenge(email: string, token: string): Promise<boolean> {
    logger.info('Verifying magic link challenge', { email, token });
    const repo = new MagicTokenRepository(this.environmentService);
    try {
      const item = await repo.get(token);
      if (!item) {
        logger.error('Magic token not found', { token });
        return false;
      }
      logger.info('Magic token found', { username: item.email, expiresAt: item.expiresAt });
      const notExpired = new Date(item.expiresAt) > new Date();
      const usernameMatch = item.email === email;
      const isValid = notExpired && usernameMatch;
      logger.info('Magic token verified', { notExpired, token, usernameMatch });
      try {
        await repo.delete(token);
      } catch (error) {
        logger.error('Error deleting magic token', { error, token });
      }
      return isValid;
    } catch (error) {
      logger.error('Error verifying magic token', { error, email });
      return false;
    }
  }
}
