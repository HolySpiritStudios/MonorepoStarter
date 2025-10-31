import { config as dotenvConfig } from 'dotenv';
import path from 'node:path';

import { getInfraLogger } from '../utils/logger.util';

const logger = getInfraLogger('pre-deploy');

dotenvConfig({ path: path.resolve(__dirname, '../../.env') });

/**
 * Executes pre-deployment tasks.
 */
// eslint-disable-next-line @typescript-eslint/require-await
async function preDeploy(): Promise<void> {
  const env = process.env.ENVIRONMENT || 'integration';
  logger.info(`🚀 Pre-deploy hook for ${env} environment`);
}

function main(): void {
  preDeploy()
    .then(() => {
      logger.info('✅ Pre-deploy hook succeeded');
    })
    .catch((error) => {
      logger.error('❌ Pre-deploy hook failed', { error });
      process.exit(1);
    });
}

main();
