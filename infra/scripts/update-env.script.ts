import { config as dotenvConfig } from 'dotenv';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'node:path';

import { getResourceName } from '../constants/app.constant';
import { CloudFormationService } from '../integrations/cloudformation.service';
import { SecretsManagerService } from '../integrations/secrets-manager.service';
import { getInfraLogger } from '../utils/logger.util';

dotenvConfig({ path: path.resolve(__dirname, '../../.env') });

const logger = getInfraLogger('update-env');

// Keys we never write to .env
const EXCLUDED_ENV_VARS = new Set(['LOG_LEVEL', 'AWS_REGION', 'AWS_ACCOUNT_ID']);
const OUTPUTS_TO_ENV_VARS = new Map<string, string>([['LambdaRoleArn', 'LAMBDA_ROLE_ARN']]);
const WHITELISTED_SECRET_KEYS = new Set(['SENTRY_DSN', 'MIXPANEL_TOKEN']);

function loadDotEnvFile(dotenvPath: string): string[] {
  if (!existsSync(dotenvPath)) {
    return [];
  }
  const content = readFileSync(dotenvPath, 'utf8');
  return content.split(/\r?\n/);
}

function saveDotEnvFile(dotenvPath: string, lines: string[]): void {
  const normalized = lines.join('\n');
  writeFileSync(dotenvPath, normalized.endsWith('\n') ? normalized : normalized + '\n', 'utf8');
}

function upsertEnvLines(lines: string[], entries: Record<string, string>): string[] {
  const keyToIndex = new Map<string, number>();
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const match = /^([A-Z0-9_]+)\s*=/.exec(line);
    if (match) {
      keyToIndex.set(match[1], i);
    }
  }

  const updates: string[] = [];
  const additions: string[] = [];

  Object.entries(entries)
    .filter(([key]) => !EXCLUDED_ENV_VARS.has(key))
    .forEach(([key, value]) => {
      const serialized = `${key}=${value}`;
      const idx = keyToIndex.get(key);
      if (idx !== undefined) {
        if (lines[idx] !== serialized) {
          lines[idx] = serialized;
          updates.push(key);
        }
      } else {
        additions.push(serialized);
      }
    });

  if (additions.length > 0) {
    if (lines.length > 0 && lines[lines.length - 1].trim() !== '') {
      lines.push('');
    }
    lines.push(...additions);
  }

  if (updates.length > 0) {
    logger.info('Updated existing .env keys', { keys: updates });
  }
  if (additions.length > 0) {
    logger.info('Appended new .env keys', { keys: additions.map((l) => l.split('=')[0]) });
  }

  return lines;
}

async function appendLambdaEnvToDotEnv(env: string): Promise<void> {
  const cloudFormation = new CloudFormationService();
  const stackName = getResourceName(env, 'stack');

  const extraKeys = Array.from(OUTPUTS_TO_ENV_VARS.keys());
  const outputs = await cloudFormation.getOutputsByKey(stackName, ['LambdaEnvVars', ...extraKeys]);
  const rawJson = outputs.LambdaEnvVars;
  if (!rawJson) {
    throw new Error('LambdaEnvVars output not found in stack outputs');
  }

  let parsed: Record<string, string> = {};
  try {
    parsed = JSON.parse(rawJson);
  } catch (error) {
    logger.error('Failed to parse LambdaEnvVars JSON', { error });
    throw error;
  }

  for (const [outputKey, envKey] of OUTPUTS_TO_ENV_VARS.entries()) {
    const output = outputs[outputKey];
    if (output) {
      parsed[envKey] = output;
    }
  }

  const secretId = parsed.SECRET_ID;
  if (secretId) {
    logger.info('Reading secrets from Secrets Manager', { secretId });
    const secretsManager = new SecretsManagerService();
    const secrets = await secretsManager.getSecretAsJson<Record<string, string>>(secretId);
    if (secrets) {
      const whitelistedSecrets = Object.entries(secrets)
        .filter(([key]) => WHITELISTED_SECRET_KEYS.has(key))
        .flatMap(([key, value]) => [
          [key, value],
          ['VITE_' + key, value],
        ])
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      Object.assign(parsed, whitelistedSecrets);
      logger.info('Added whitelisted secrets to .env', { keys: Object.keys(whitelistedSecrets) });
    } else {
      logger.warn('Secret not found in Secrets Manager', { secretId });
    }
  }

  parsed.ENVIRONMENT = env;
  parsed.VITE_ENVIRONMENT = env;

  const dotenvPath = path.resolve(__dirname, '../../.env');
  const lines = loadDotEnvFile(dotenvPath);
  const updated = upsertEnvLines(lines, parsed);
  saveDotEnvFile(dotenvPath, updated);

  logger.info('✅ .env updated from LambdaEnvVars');
}

function getEnv(args: Record<string, string>): string {
  if (args.pr) {
    return 'pr' + args.pr.padStart(4, '0');
  }
  return args.env || process.env.ENVIRONMENT || 'integration';
}

export async function run(args: Record<string, string>): Promise<void> {
  const env = getEnv(args);
  await appendLambdaEnvToDotEnv(env);
  logger.info('✅ Update env script succeeded');
}
