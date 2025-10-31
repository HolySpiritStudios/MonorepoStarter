import type { APIGatewayProxyEvent, APIGatewayProxyEventHeaders } from 'aws-lambda';
import { config as dotenvConfig } from 'dotenv';
import fs from 'fs';
import { decodeJwt } from 'jose';
import path from 'node:path';

import { getAppLogger } from '../app/common/utils/logger.util';
import { handler } from '../entrypoints/authentication-api-handler.lambda';

dotenvConfig({ path: path.resolve(__dirname, '../../.env') });

const logger = getAppLogger('debug');

interface CognitoClaims {
  sub: string;
  email: string;
  'cognito:username'?: string;
  token_use: string;
}

function extractIdentityFromToken(authHeader?: string): CognitoClaims | undefined {
  if (!authHeader) {
    return undefined;
  }

  let token: string;
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else {
    token = authHeader;
  }

  try {
    const decoded = decodeJwt(token);

    if (decoded.sub && decoded.email && typeof decoded.sub === 'string' && typeof decoded.email === 'string') {
      return {
        sub: decoded.sub,
        email: decoded.email,
        'cognito:username': decoded['cognito:username'] as string | undefined,
        token_use: (decoded.token_use as string) || 'access',
      };
    }

    return undefined;
  } catch (error) {
    logger.warn('Failed to decode JWT token', { error });
    return undefined;
  }
}

async function main(): Promise<void> {
  const eventPath = path.join(__dirname, 'events', 'event.json');
  const eventData = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));

  // Extract authorization header
  const authHeader = eventData.request?.headers?.authorization || eventData.request?.headers?.Authorization;
  const tokenIdentity = extractIdentityFromToken(authHeader as string);

  // Create API Gateway event structure
  const apiGatewayEvent: APIGatewayProxyEvent = {
    resource: '/ping',
    path: '/ping',
    httpMethod: 'GET',
    headers: {
      Authorization: authHeader || '',
      'Content-Type': 'application/json',
      ...eventData.request?.headers,
    } as APIGatewayProxyEventHeaders,
    multiValueHeaders: {},
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    pathParameters: null,
    stageVariables: null,
    body: null,
    isBase64Encoded: false,
    requestContext: {
      resourceId: 'test',
      resourcePath: '/ping',
      httpMethod: 'GET',
      requestId: 'test-request-id',
      protocol: 'HTTP/1.1',
      stage: 'dev',
      requestTime: new Date().toISOString(),
      requestTimeEpoch: Date.now(),
      path: '/ping',
      accountId: '123456789012',
      apiId: 'test-api-id',
      authorizer: tokenIdentity
        ? {
            claims: tokenIdentity,
            principalId: tokenIdentity.sub,
          }
        : undefined,
      identity: {
        cognitoIdentityPoolId: null,
        accountId: null,
        cognitoIdentityId: null,
        caller: null,
        sourceIp: '127.0.0.1',
        principalOrgId: null,
        accessKey: null,
        cognitoAuthenticationType: null,
        cognitoAuthenticationProvider: null,
        userArn: null,
        userAgent: 'test-user-agent',
        user: null,
        apiKey: null,
        apiKeyId: null,
        clientCert: null,
      },
    },
  };

  try {
    const result = await handler(apiGatewayEvent);
    logger.info('Result', { result });
  } catch (error) {
    logger.error('Error', { error });
  }
}

main();
