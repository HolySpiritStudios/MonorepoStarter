import { config as dotenvConfig } from 'dotenv';
import { existsSync } from 'fs';
import path from 'node:path';

import { getResourceName, getSSMParameterName } from '../constants/app.constant';
import { LAST_DEPLOYED_COMMIT_FRONTEND } from '../constants/ssm-parameters.constant';
import { CloudFormationService } from '../integrations/cloudformation.service';
import { CloudFrontService } from '../integrations/cloudfront.service';
import { S3Service } from '../integrations/s3.service';
import { SSMService } from '../integrations/ssm.service';
import { getInfraLogger } from '../utils/logger.util';
import { checkRequiredEnvVars } from '../utils/validation.util';

dotenvConfig({ path: path.resolve(__dirname, '../../.env') });

const logger = getInfraLogger('upload-frontend');

const requiredEnvVars: string[] = [];

/**
 * Uploads frontend build files to S3.
 * @param frontendPath Path to the built frontend files directory (typically 'dist')
 * @throws {Error} If any required environment variables are missing or if upload fails.
 */
async function uploadBuildFiles(frontendPath: string): Promise<void> {
  const env = process.env.ENVIRONMENT || 'integration';

  const indexPath = `${frontendPath}/index.html`;
  if (!existsSync(indexPath)) {
    throw new Error(`Frontend index.html not found at path: ${indexPath}`);
  }

  const cloudFormation = new CloudFormationService();
  const outputs = await cloudFormation.getOutputsByKey(getResourceName(env, 'stack'), [
    'FrontendBucketName',
    'DistributionId',
  ]);
  const bucketName = outputs.FrontendBucketName;
  const distributionId = outputs.DistributionId;

  logger.info('🌐 Starting frontend upload', { bucketName, frontendPath });

  const s3Service = new S3Service();
  await s3Service.syncDirectory(bucketName, frontendPath, 'frontend');

  logger.info('🔄 Creating CloudFront invalidation for updated files');
  const cloudFrontService = new CloudFrontService();
  try {
    const invalidationId = await cloudFrontService.createInvalidation(distributionId, ['/index.html', '/*']);
    logger.info('✅ CloudFront invalidation created successfully', { invalidationId });
  } catch (error) {
    logger.error('❌ Failed to create CloudFront invalidation', { error });
  }

  await updateFrontendDeploymentCommit(env);
}

async function updateFrontendDeploymentCommit(env: string): Promise<void> {
  const ssm = new SSMService();
  const currentCommit = process.env.GITHUB_SHA || 'unknown';
  const ssmParameterName = getSSMParameterName(env, LAST_DEPLOYED_COMMIT_FRONTEND);

  try {
    await ssm.setParameter(ssmParameterName, currentCommit, `Last deployed commit for frontend in ${env} environment`);
    logger.info(`✅ Updated frontend deployment commit: ${currentCommit}`);
  } catch (error) {
    logger.warn(`Failed to update frontend deployment commit`, { error });
  }
}

export async function run(args: Record<string, string>): Promise<void> {
  const frontendPath = args.path;

  if (!frontendPath) {
    throw new Error('frontendPath is required. Use --path <frontendPath>');
  }

  checkRequiredEnvVars(requiredEnvVars);

  await uploadBuildFiles(frontendPath);
  logger.info('✅ Upload frontend script succeeded');
}
