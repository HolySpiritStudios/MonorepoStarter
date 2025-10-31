import { APP_NAME } from '../constants/app.constant';
import {
  CUSTOM_INTEGRATION_ENV_CONFIG,
  CUSTOM_PRODUCTION_ENV_CONFIG,
  isProduction,
} from '../constants/environment.constant';
import { S3Service } from '../integrations/s3.service';

import { getInfraLogger } from './logger.util';

const getEnvPath = (env: string): string => `app-configs/${env}/environment.json`;

const logger = getInfraLogger('environment-config.util');

const PRODUCTION_BUCKET_NAME = `${APP_NAME}-production-assets`;
const INTEGRATION_BUCKET_NAME = `${APP_NAME}-integration-assets`;

export interface DynamicEnvironmentConfig {
  apiUrl: string;
}

export interface VersionConfig {
  gameVersion: string;
}

async function publishConfig(env: string, path: string, config: string): Promise<void> {
  const bucketName = isProduction(env) ? PRODUCTION_BUCKET_NAME : INTEGRATION_BUCKET_NAME;
  const s3Service = new S3Service();

  await s3Service.uploadFile(bucketName, path, config, 'application/json');
}

export async function publishEnvironmentConfig(env: string, dynamicConfig: DynamicEnvironmentConfig): Promise<void> {
  const environmentConfig = {
    ...dynamicConfig,
    ...(isProduction(env) ? CUSTOM_PRODUCTION_ENV_CONFIG : CUSTOM_INTEGRATION_ENV_CONFIG),
  };

  await publishConfig(env, getEnvPath(env), JSON.stringify(environmentConfig));
}

export async function deleteAllEnvironmentConfigs(env: string): Promise<void> {
  if (isProduction(env)) {
    logger.info(`Skipping deletion of production environment config`);
    return;
  }

  const bucketName = INTEGRATION_BUCKET_NAME;
  const s3Service = new S3Service();
  await s3Service.deleteFile(bucketName, getEnvPath(env));
}
