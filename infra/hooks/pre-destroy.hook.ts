import { config as dotenvConfig } from 'dotenv';
import path from 'node:path';

import { getInfraLogger } from '../utils/logger.util';

const logger = getInfraLogger('pre-destroy');

dotenvConfig({ path: path.resolve(__dirname, '../../.env') });

/**
 * Executes pre-destroy tasks.
 */
// eslint-disable-next-line @typescript-eslint/require-await
async function preDestroy(): Promise<void> {
  logger.info('Pre-destroy hook succeeded');
}

function main(): void {
  preDestroy()
    .then(() => {
      logger.info('✅ Pre-destroy hook succeeded');
    })
    .catch((error) => {
      logger.error('❌ Pre-destroy hook failed', { error });
      process.exit(1);
    });
}

main();
