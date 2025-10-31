import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { BatchWriteCommand, DynamoDBDocumentClient, ScanCommand, ScanCommandOutput } from '@aws-sdk/lib-dynamodb';

import { EnvironmentService, EnvironmentVariable } from '../app/common/utils/environment.util';

interface DynamoDBItem {
  PK: string;
  SK: string;
  id?: string;
  type?: string;
  [key: string]: unknown;
}

async function getAllItems(client: DynamoDBDocumentClient, tableName: string): Promise<DynamoDBItem[]> {
  const allItems: DynamoDBItem[] = [];
  let lastEvaluatedKey: Record<string, unknown> | undefined = undefined;

  do {
    const result: ScanCommandOutput = await client.send(
      new ScanCommand({
        TableName: tableName,
        ExclusiveStartKey: lastEvaluatedKey,
      }),
    );

    if (result.Items) {
      allItems.push(...(result.Items as DynamoDBItem[]));
    }
    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey);

  return allItems;
}

async function deleteItemsInBatches(
  client: DynamoDBDocumentClient,
  tableName: string,
  items: DynamoDBItem[],
): Promise<void> {
  const BATCH_SIZE = 25; // DynamoDB batch write limit

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const deleteRequests = batch.map((item) => ({
      DeleteRequest: {
        Key: {
          PK: item.PK,
          SK: item.SK,
        },
      },
    }));

    await client.send(
      new BatchWriteCommand({
        RequestItems: {
          [tableName]: deleteRequests,
        },
      }),
    );

    console.log(
      `✅ Deleted batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(items.length / BATCH_SIZE)} (${batch.length} items)`,
    );
  }
}

export async function run(args: Record<string, string>): Promise<void> {
  const env = new EnvironmentService();

  const rawClient = new DynamoDBClient({
    region: env.get(EnvironmentVariable.AWS_REGION),
  });
  const client = DynamoDBDocumentClient.from(rawClient, {
    marshallOptions: {
      removeUndefinedValues: true,
    },
  });
  const tableName = env.get(EnvironmentVariable.DYNAMODB_TABLE_NAME);

  console.log('🔍 Scanning database for all items...');
  console.log(`📋 Skip users option: ${args['skip-users'] === 'true' ? 'ENABLED' : 'DISABLED'}`);

  const allItems = await getAllItems(client, tableName);
  console.log(`Found ${allItems.length} total items in database`);

  if (allItems.length === 0) {
    console.log('✅ Database is already empty');
    return;
  }

  // Filter items based on skip-users option
  let itemsToDelete = allItems;
  if (args['skip-users'] === 'true') {
    const userItems = allItems.filter((item) => item.type === 'User');
    itemsToDelete = allItems.filter((item) => item.type !== 'User');
    console.log(`👥 Found ${userItems.length} user items (will be preserved)`);
    console.log(`🗑️  Found ${itemsToDelete.length} non-user items (will be deleted)`);
  } else {
    console.log(`🗑️  All ${itemsToDelete.length} items will be deleted`);
  }

  if (itemsToDelete.length === 0) {
    console.log('✅ No items to delete');
    return;
  }

  // Group items by type for reporting
  const itemsByType: Record<string, number> = {};
  for (const item of itemsToDelete) {
    const type = item.type || 'Unknown';
    itemsByType[type] = (itemsByType[type] || 0) + 1;
  }

  console.log('\n📊 Items to be deleted by type:');
  Object.entries(itemsByType).forEach(([type, count]) => {
    console.log(`  - ${type}: ${count} items`);
  });

  console.log('\n🚨 WARNING: This will permanently delete data!');
  console.log('Starting deletion in 3 seconds...');

  // Give user a moment to cancel if running interactively
  await new Promise((resolve) => setTimeout(resolve, 3000));

  console.log('\n🗑️  Starting deletion process...');
  await deleteItemsInBatches(client, tableName, itemsToDelete);

  console.log('\n🎉 Database wipe completed!');
  console.log(`📊 Final stats:`);
  console.log(`  - Items deleted: ${itemsToDelete.length}`);
  if (args['skip-users'] === 'true') {
    const userCount = allItems.filter((item) => item.type === 'User').length;
    console.log(`  - Users preserved: ${userCount}`);
  }
  console.log(`  - Total items processed: ${allItems.length}`);
}
