import {
  AdminCreateUserCommand,
  AdminGetUserCommand,
  AdminSetUserPasswordCommand,
  CognitoIdentityProviderClient,
  UserType,
} from '@aws-sdk/client-cognito-identity-provider';

import { EnvironmentService, EnvironmentVariable } from '../../../utils/environment.util';
import { getAppLogger } from '../../../utils/logger.util';

const logger = getAppLogger('cognito-service');

export class CognitoService {
  private readonly cognitoClient: CognitoIdentityProviderClient;
  private readonly userPoolId: string;

  constructor(private readonly environmentService: EnvironmentService) {
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: this.environmentService.get(EnvironmentVariable.AWS_REGION),
    });
    this.userPoolId = this.environmentService.get(EnvironmentVariable.USER_POOL_ID);
  }

  public async createUser(email: string, fullName: string): Promise<UserType> {
    try {
      const { User: cognitoUser } = await this.cognitoClient.send(
        new AdminCreateUserCommand({
          UserPoolId: this.userPoolId,
          Username: email,
          UserAttributes: [
            { Name: 'email', Value: email },
            { Name: 'name', Value: fullName },
            { Name: 'email_verified', Value: 'true' },
          ],
          MessageAction: 'SUPPRESS',
        }),
      );

      if (!cognitoUser) {
        throw new Error('User creation failed in Cognito.');
      }
      return cognitoUser;
    } catch (error) {
      logger.error('Error creating user in Cognito:', { error });
      throw error;
    }
  }

  public async setUserPassword(username: string, password?: string): Promise<void> {
    if (!password) {
      return;
    }

    try {
      await this.cognitoClient.send(
        new AdminSetUserPasswordCommand({
          UserPoolId: this.userPoolId,
          Username: username,
          Password: password,
          Permanent: true,
        }),
      );
    } catch (error) {
      logger.error('Error setting user password in Cognito:', { error });
      throw error;
    }
  }

  public async ensureUser(email: string, fullName?: string): Promise<string> {
    try {
      await this.cognitoClient.send(new AdminGetUserCommand({ UserPoolId: this.userPoolId, Username: email }));
      return email;
    } catch {
      // fallthrough create
    }

    try {
      await this.cognitoClient.send(
        new AdminCreateUserCommand({
          UserPoolId: this.userPoolId,
          Username: email,
          UserAttributes: [
            { Name: 'email', Value: email },
            { Name: 'email_verified', Value: 'true' },
            ...(fullName ? [{ Name: 'name', Value: fullName }] : []),
          ],
          MessageAction: 'SUPPRESS',
        }),
      );
      return email;
    } catch (error) {
      logger.error('Error ensuring Cognito user', { error, email });
      throw error;
    }
  }
}
