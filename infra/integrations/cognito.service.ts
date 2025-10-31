import type { Logger } from '@aws-lambda-powertools/logger';
import {
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AttributeType,
  CognitoIdentityProviderClient,
  MessageActionType,
  UserType,
  paginateListUsers,
} from '@aws-sdk/client-cognito-identity-provider';

import { getInfraLogger } from '../utils/logger.util';

const BLACKLISTED_USER_ATTRIBUTES = ['sub', 'identities'];

export class CognitoService {
  constructor(
    private readonly cognitoClient: CognitoIdentityProviderClient = new CognitoIdentityProviderClient(),
    private readonly logger: Logger = getInfraLogger(CognitoService.name),
  ) {}

  async copyUsersWithFakePasswords(sourceUserPoolId: string, targetUserPoolId: string): Promise<void> {
    const sourceUsers = await this.getAllUsersForCopy(sourceUserPoolId);
    await this.createUsersWithFakePasswords(targetUserPoolId, sourceUsers);
  }

  private async getAllUsersForCopy(userPoolId: string): Promise<{ email: string; attributes: AttributeType[] }[]> {
    this.logger.info(`Fetching internal users from ${userPoolId}`);

    const usersForCopy: { email: string; attributes: AttributeType[] }[] = [];
    const paginatorConfig = {
      client: this.cognitoClient,
    };

    const commandInput = {
      UserPoolId: userPoolId,
    };

    for await (const page of paginateListUsers(paginatorConfig, commandInput)) {
      const users = page.Users || [];
      for (const user of users) {
        const email = this.extractEmail(user);
        if (!email || usersForCopy.some((u) => u.email === email)) continue;
        const attributes = this.buildAttributesForTarget(user, email);
        usersForCopy.push({ email, attributes });
      }
    }

    this.logger.info(`Found ${usersForCopy.length} internal users`);
    return usersForCopy;
  }

  private async createUsersWithFakePasswords(
    targetUserPoolId: string,
    users: { email: string; attributes: AttributeType[] }[],
    fakePassword = 'Password123!',
  ): Promise<void> {
    this.logger.info(`Creating ${users.length} users in ${targetUserPoolId}`);

    await Promise.all(
      users.map(async ({ email, attributes }) => {
        try {
          await this.cognitoClient.send(
            new AdminCreateUserCommand({
              UserPoolId: targetUserPoolId,
              Username: email,
              UserAttributes: attributes,
              MessageAction: MessageActionType.SUPPRESS,
              TemporaryPassword: fakePassword,
            }),
          );

          await this.cognitoClient.send(
            new AdminSetUserPasswordCommand({
              UserPoolId: targetUserPoolId,
              Username: email,
              Password: fakePassword,
              Permanent: true,
            }),
          );

          this.logger.info(`Created user: ${email}`);
        } catch (error) {
          this.logger.warn(`Failed to create user ${email}:`, { error });
        }
      }),
    );

    this.logger.info(`Completed creating users in ${targetUserPoolId}`);
  }

  private extractEmail(user: UserType): string | undefined {
    return user.Attributes?.find((attr) => attr.Name === 'email')?.Value;
  }

  private buildAttributesForTarget(user: UserType, email: string): AttributeType[] {
    const original = user.Attributes ?? [];
    const filtered = original.filter((attr) => !BLACKLISTED_USER_ATTRIBUTES.includes(attr.Name ?? ''));

    const attributesMap = new Map<string, string | undefined>();
    for (const attr of filtered) {
      if (attr.Name) attributesMap.set(attr.Name, attr.Value);
    }

    attributesMap.set('email', email);
    attributesMap.set('email_verified', 'true');

    return Array.from(attributesMap.entries()).map(([Name, Value]) => ({ Name, Value }));
  }
}
