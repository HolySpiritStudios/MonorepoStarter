import type { Logger } from '@aws-lambda-powertools/logger';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { BatchWriteCommand, DynamoDBDocumentClient, ScanCommandInput, paginateScan } from '@aws-sdk/lib-dynamodb';

import { getInfraLogger } from '../utils/logger.util';

export class DynamoDBService {
  private readonly documentClient: DynamoDBDocumentClient;

  constructor(
    private readonly dynamoDbClient: DynamoDBClient = new DynamoDBClient(),
    private readonly logger: Logger = getInfraLogger(DynamoDBService.name),
  ) {
    this.documentClient = DynamoDBDocumentClient.from(this.dynamoDbClient);
  }

  async copyTableData(sourceTableName: string, targetTableName: string): Promise<void> {
    this.logger.info(`Starting copy from ${sourceTableName} to ${targetTableName}`);

    const scanInput: ScanCommandInput = {
      TableName: sourceTableName,
    };

    let itemCount = 0;
    for await (const page of paginateScan({ client: this.documentClient }, scanInput)) {
      const items = page.Items || [];
      if (items.length === 0) continue;

      // DynamoDB batch write limit is 25 items per request
      const chunks = chunk(items, 25);
      for (const chunkItems of chunks) {
        await this.batchWriteWithRetry(targetTableName, chunkItems);
      }

      itemCount += items.length;
      this.logger.info(`Copied ${items.length} items (total: ${itemCount})`);
    }

    this.logger.info(`Completed copying ${itemCount} items from ${sourceTableName} to ${targetTableName}`);
  }

  private async batchWriteWithRetry(tableName: string, items: Record<string, unknown>[]): Promise<void> {
    let unprocessed = items;
    let attempt = 0;

    while (unprocessed.length > 0) {
      const requestItems = unprocessed.map((item) => ({ PutRequest: { Item: item } }));
      const result = await this.documentClient.send(
        new BatchWriteCommand({ RequestItems: { [tableName]: requestItems } }),
      );

      const next = result.UnprocessedItems?.[tableName] ?? [];
      unprocessed = next.map((wr) => wr.PutRequest?.Item as Record<string, unknown>).filter(Boolean);

      if (unprocessed.length > 0) {
        attempt += 1;
        const backoffMs = Math.min(1000 * attempt, 5000);
        this.logger.warn('Retrying unprocessed batch write items', { count: unprocessed.length, attempt, backoffMs });
        await delay(backoffMs);
      }
    }
  }
}

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
