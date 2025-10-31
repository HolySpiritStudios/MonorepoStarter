import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'reflect-metadata';

import { AuthenticationRouter } from '../app/authentication/routers/authentication.router';
import { getAppLogger } from '../app/common/utils/logger.util';

import { buildAuthenticationRouter } from './containers/auth-router.container';

let router: AuthenticationRouter | null = null;

const logger = getAppLogger('authentication-api-handler');

async function getRouter(): Promise<AuthenticationRouter> {
  if (!router) {
    router = await buildAuthenticationRouter();
  }
  return router;
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  logger.info('Learning API request received', {
    method: event.httpMethod,
    path: event.path,
  });
  const authRouter = await getRouter();
  const result = await authRouter.route(event);
  return result;
}
