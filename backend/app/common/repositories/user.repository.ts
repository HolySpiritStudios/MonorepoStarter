import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { BatchGetCommand, DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

import { randomUUID } from 'crypto';

import { User } from '../entities/user.entity';
import { EnvironmentService, EnvironmentVariable } from '../utils/environment.util';

export class UserRepository {
  private readonly client: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor(private readonly env: EnvironmentService) {
    const rawClient = new DynamoDBClient({
      region: this.env.get(EnvironmentVariable.AWS_REGION),
    });
    this.client = DynamoDBDocumentClient.from(rawClient);
    this.tableName = this.env.get(EnvironmentVariable.DYNAMODB_TABLE_NAME);
  }

  async findUserById(id: string): Promise<User | null> {
    const result = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { PK: `User#${id}`, SK: `User#${id}` },
      }),
    );

    if (!result.Item) {
      return null;
    }

    return this.mapItemToUser(result.Item);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const normalizedEmail = email.toLowerCase();

    const result = await this.client.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :gsi1pk',
        ExpressionAttributeValues: {
          ':gsi1pk': `Email#${normalizedEmail}`,
        },
        Limit: 1,
      }),
    );

    if (!result.Items || result.Items.length === 0) {
      return null;
    }

    const item = result.Items[0];
    return this.mapItemToUser(item);
  }

  async upsertUser(userData: Omit<User, 'id'> & Partial<Pick<User, 'id'>>): Promise<User> {
    const user: User = {
      id: userData.id ?? randomUUID(),
      ...userData,
    };

    const normalizedEmail = user.email.toLowerCase();

    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          PK: `User#${user.id}`,
          SK: `User#${user.id}`,
          GSI1PK: `Email#${normalizedEmail}`,
          GSI1SK: `User#${user.id}`,
          type: 'User',
          ...user,
        },
      }),
    );
    return user;
  }

  async findUsersByIds(ids: string[]): Promise<User[]> {
    if (ids.length === 0) {
      return [];
    }

    const keys = ids.map((id) => ({
      PK: `User#${id}`,
      SK: `User#${id}`,
    }));

    const result = await this.client.send(
      new BatchGetCommand({
        RequestItems: {
          [this.tableName]: {
            Keys: keys,
          },
        },
      }),
    );

    const items = result.Responses?.[this.tableName] || [];
    return items.map((item) => this.mapItemToUser(item));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapItemToUser(item: Record<string, any>): User {
    return {
      id: item.id,
      email: item.email,
      fullName: item.fullName,
      platformId: item.platformId,
    };
  }
}
