import { config as dotenvConfig } from 'dotenv';
import path from 'node:path';

import { getResourceName, getSSMParameterName } from '../constants/app.constant';
import { INTEGRATION_ENV, isEphemeral } from '../constants/environment.constant';
import { DATA_SEEDED_PARAMETER } from '../constants/ssm-parameters.constant';
import { CloudFormationService } from '../integrations/cloudformation.service';
import { CognitoService } from '../integrations/cognito.service';
import { DynamoDBService } from '../integrations/dynamodb.service';
import { PostmanService } from '../integrations/postman.service';
import { SSMService } from '../integrations/ssm.service';
import { publishEnvironmentConfig } from '../utils/config.util';
import { getInfraLogger } from '../utils/logger.util';
import { checkRequiredEnvVars } from '../utils/validation.util';

dotenvConfig({ path: path.resolve(__dirname, '../../.env') });

const logger = getInfraLogger('post-deploy');

const requiredEnvVars: string[] = [];

/**
 * Executes post-deployment tasks, including updating environment configurations.
 * @throws {Error} If any required environment variables are missing or if any task fails.
 */
async function postDeploy(): Promise<void> {
  const env = process.env.ENVIRONMENT || 'integration';
  const ephemeral = isEphemeral(env);

  const cloudFormation = new CloudFormationService();
  const outputs = await cloudFormation.getOutputsByKey(getResourceName(env, 'stack'), [
    'ApiUrl',
    'UserPoolId',
    'UserPoolClientId',
    'UserPoolRegion',
    'UserPoolDomain',
  ]);

  const dynamicEnvironment = {
    apiUrl: outputs.ApiUrl || '',
    userPoolId: outputs.UserPoolId || '',
    userPoolClientId: outputs.UserPoolClientId || '',
    userPoolRegion: outputs.UserPoolRegion || '',
    userPoolDomain: outputs.UserPoolDomain || '',
    selfSignUpEnabled: ephemeral,
    ssoSignInEnabled: !ephemeral,
  };

  logger.info('🚀 Dynamic environment', { dynamicEnvironment });

  const postmanService = new PostmanService();

  await Promise.all([
    publishEnvironmentConfig(env, dynamicEnvironment),
    createOrUpdatePostmanEnvironmentAndCollection(postmanService, env, dynamicEnvironment),
  ]);

  if (ephemeral) {
    logger.info('Running ephemeral seeding hook');
    await seedEphemeralEnvironment(env);
  } else {
    logger.info('Not an ephemeral environment, skipping seeding');
  }
}

async function createOrUpdatePostmanEnvironmentAndCollection(
  postmanService: PostmanService,
  env: string,
  dynamicEnvironment: {
    apiUrl: string;
    userPoolId: string;
    userPoolClientId: string;
    userPoolRegion: string;
    userPoolDomain: string;
  },
): Promise<void> {
  try {
    await postmanService.createOrUpdateEnvironment({
      name: env,
      values: [
        {
          enabled: true,
          key: 'API_BASE_URL',
          type: 'string',
          value: dynamicEnvironment.apiUrl,
        },
        {
          enabled: true,
          key: 'COGNITO_BASE_URL',
          type: 'string',
          value: `https://${dynamicEnvironment.userPoolDomain}`,
        },
        {
          enabled: true,
          key: 'COGNITO_CLIENT_ID',
          type: 'string',
          value: dynamicEnvironment.userPoolClientId,
        },
      ],
    });

    const openApiUrl = `${dynamicEnvironment.apiUrl}/docs/openapi.json`;
    await postmanService.createOrUpdateCollectionFromOpenAPI(env, openApiUrl);

    logger.info(`✅ Postman environment and collection for '${env}' processed successfully`);
  } catch (error) {
    logger.error(`Failed to create/update Postman environment and collection for '${env}':`, { error });
    // Don't throw here to avoid failing the entire deployment for Postman issues
  }
}

async function seedEphemeralEnvironment(env: string): Promise<void> {
  const cloudFormation = new CloudFormationService();
  const ssm = new SSMService();
  const stackName = getResourceName(env, 'stack');
  const ssmParameterName = getSSMParameterName(env, DATA_SEEDED_PARAMETER);

  const hasBeenSeeded = await ssm.getParameter(ssmParameterName);
  if (hasBeenSeeded === 'true') {
    logger.info('Environment already seeded, skipping');
    return;
  }

  logger.info('Starting ephemeral environment seeding');

  const sourceStackName = getResourceName(INTEGRATION_ENV, 'stack');
  const targetStackName = stackName;

  const [sourceOutputs, targetOutputs] = await Promise.all([
    cloudFormation.getOutputsByKey(sourceStackName, ['TableName', 'UserPoolId']),
    cloudFormation.getOutputsByKey(targetStackName, ['TableName', 'UserPoolId']),
  ]);

  const sourceTableName = sourceOutputs.TableName;
  const sourceUserPoolId = sourceOutputs.UserPoolId;
  const targetTableName = targetOutputs.TableName;
  const targetUserPoolId = targetOutputs.UserPoolId;

  if (!sourceTableName || !sourceUserPoolId || !targetTableName || !targetUserPoolId) {
    throw new Error('Missing required stack outputs for seeding');
  }

  const dynamoDBService = new DynamoDBService();
  const cognitoService = new CognitoService();

  await Promise.all([
    dynamoDBService.copyTableData(sourceTableName, targetTableName),
    cognitoService.copyUsersWithFakePasswords(sourceUserPoolId, targetUserPoolId),
  ]);

  await ssm.setParameter(ssmParameterName, 'true', `Data seeding status for ${env} environment`);
  logger.info('✅ Ephemeral environment seeding completed');
}

function main(): void {
  checkRequiredEnvVars(requiredEnvVars);

  postDeploy()
    .then(() => {
      logger.info('✅ Post deploy hook succeeded');
    })
    .catch((error) => {
      logger.error('❌ Post deploy hook failed', { error });
      process.exit(1);
    });
}

main();
