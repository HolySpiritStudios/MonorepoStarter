import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'reflect-metadata';

import { getAppLogger } from '../app/common/utils/logger.util';
import { HelloWorldRouter } from '../app/hello-world/routers/hello-world.router';

import { buildHelloWorldRouter } from './containers/hello-world-router.container';

let router: HelloWorldRouter | null = null;

const logger = getAppLogger('hello-world-api-handler');

async function getRouter(): Promise<HelloWorldRouter> {
  if (!router) {
    router = await buildHelloWorldRouter();
  }
  return router;
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  logger.info('Hello World API request received', {
    method: event.httpMethod,
    path: event.path,
  });
  const helloWorldRouter = await getRouter();
  const result = await helloWorldRouter.route(event);
  return result;
}
