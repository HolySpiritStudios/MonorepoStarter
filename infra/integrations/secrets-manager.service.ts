import { SecretsManager } from '@aws-sdk/client-secrets-manager';

export class SecretsManagerService {
  constructor(private readonly secretsManager: SecretsManager = new SecretsManager()) {}

  async getSecret(secretId: string): Promise<string | null> {
    try {
      const response = await this.secretsManager.getSecretValue({ SecretId: secretId });
      return response.SecretString ?? null;
    } catch (error) {
      if (error instanceof Error && error.name === 'ResourceNotFoundException') {
        return null;
      }
      throw error;
    }
  }

  async getSecretAsJson<T = Record<string, string>>(secretId: string): Promise<T | null> {
    const secretString = await this.getSecret(secretId);
    if (!secretString) {
      return null;
    }
    try {
      return JSON.parse(secretString) as T;
    } catch (error) {
      throw new Error(`Failed to parse secret ${secretId} as JSON: ${String(error)}`);
    }
  }
}
