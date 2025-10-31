import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { LambdaEvent, handle } from 'hono/aws-lambda';
import 'reflect-metadata';

import { getAppLogger } from '../app/common/utils/logger.util';

import { buildMockUberApp } from './containers/mock-uber-app.container';

const logger = getAppLogger('docs-api-handler');

let cachedHandler: ReturnType<typeof handle> | null = null;

async function getHandler(): Promise<ReturnType<typeof handle>> {
  if (!cachedHandler) {
    const app = await buildMockUberApp();
    cachedHandler = handle(app);
  }
  return cachedHandler;
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  logger.info('Docs request received', {
    method: event.httpMethod,
    path: event.path,
  });

  const h = await getHandler();
  const result = await h(event as unknown as LambdaEvent);
  return result as APIGatewayProxyResult;
}
