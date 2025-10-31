import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

import { EnvironmentService, EnvironmentVariable } from '../../common/utils/environment.util';
import { MagicToken, MagicTokenSchema } from '../models/magic-token.entity';

export class MagicTokenRepository {
  private readonly client: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor(private readonly env: EnvironmentService) {
    const raw = new DynamoDBClient({ region: this.env.get(EnvironmentVariable.AWS_REGION) });
    this.client = DynamoDBDocumentClient.from(raw);
    this.tableName = this.env.get(EnvironmentVariable.DYNAMODB_TABLE_NAME);
  }

  private key(token: string) {
    return { PK: `MagicToken#${token}`, SK: `MagicToken#${token}` } as const;
  }

  async put(entity: MagicToken): Promise<void> {
    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          ...this.key(entity.token),
          type: 'MagicToken',
          ...entity,
          ttl: entity.expiresAt ? Math.floor(Date.parse(entity.expiresAt) / 1000) : undefined,
        },
      }),
    );
  }

  async get(token: string): Promise<MagicToken | null> {
    const res = await this.client.send(new GetCommand({ TableName: this.tableName, Key: this.key(token) }));
    if (!res.Item) return null;
    return MagicTokenSchema.parse(res.Item);
  }

  async delete(token: string): Promise<void> {
    await this.client.send(new DeleteCommand({ TableName: this.tableName, Key: this.key(token) }));
  }
}
