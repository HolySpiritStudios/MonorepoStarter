import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

import { EnvironmentService, EnvironmentVariable } from '../../../utils/environment.util';
import { getAppLogger } from '../../../utils/logger.util';

const logger = getAppLogger('secrets-service');

export class SecretsService {
  private readonly client: SecretsManagerClient;

  constructor(private readonly environmentService: EnvironmentService) {
    this.client = new SecretsManagerClient({
      region: this.environmentService.get(EnvironmentVariable.AWS_REGION),
    });
  }

  async getSecret<T>(secretId: string): Promise<T> {
    try {
      logger.info('Retrieving secret', { secretId });

      const command = new GetSecretValueCommand({
        SecretId: secretId,
      });

      const response = await this.client.send(command);

      if (!response.SecretString) {
        throw new Error('Secret value is empty');
      }

      const secret = JSON.parse(String(response.SecretString));
      logger.info('Successfully retrieved secret', { secretId });

      return secret;
    } catch (error) {
      logger.error('Error retrieving secret', { error, secretId });
      throw error;
    }
  }
}
