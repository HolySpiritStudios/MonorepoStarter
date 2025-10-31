import { config as dotenvConfig } from 'dotenv';
import path from 'node:path';

import { deleteAllEnvironmentConfigs } from '../utils/config.util';
import { getInfraLogger } from '../utils/logger.util';
import { checkRequiredEnvVars } from '../utils/validation.util';

dotenvConfig({ path: path.resolve(__dirname, '../../.env') });

const logger = getInfraLogger('post-destroy');

const requiredEnvVars: string[] = [];

/**
 * Executes post-destroy tasks, including deleting environment configurations.
 * @throws {Error} If any required environment variables are missing or if any task fails.
 */
async function postDestroy(): Promise<void> {
  const env = process.env.ENVIRONMENT || 'integration';

  await Promise.all([deleteAllEnvironmentConfigs(env)]);
}

function main(): void {
  checkRequiredEnvVars(requiredEnvVars);

  postDestroy()
    .then(() => {
      logger.info('✅ Post destroy hook succeeded');
    })
    .catch((error) => {
      logger.error('❌ Post destroy hook failed', { error });
      process.exit(1);
    });
}

main();
