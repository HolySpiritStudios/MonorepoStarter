import { createRoute } from '@hono/zod-openapi';

import type { APIGatewayProxyEvent, APIGatewayProxyEventV2 } from 'aws-lambda';
import { LambdaEvent, handle } from 'hono/aws-lambda';

import { App, errorResponses, successResponse } from '../../common/utils/routes.util';
import { IHelloWorldController } from '../interfaces/hello-world-controller.interface';
import { helloWorldResponseSchema } from '../models/hello-world.model';

export class HelloWorldRouter {
  private readonly handler: ReturnType<typeof handle>;

  constructor(
    private readonly controller: IHelloWorldController,
    private readonly app: App,
    private readonly basePath = '/hello-world/v1',
  ) {
    this.setupGetHelloWorld();

    this.handler = handle(this.app);
  }

  private prefixed(path: string): string {
    return `${this.basePath}${path}`;
  }

  private setupGetHelloWorld() {
    this.app.openapi(
      createRoute({
        method: 'get',
        path: this.prefixed('/'),
        tags: ['HelloWorld'],
        summary: 'Get hello world message',
        description: 'Returns a simple hello world message with timestamp',
        security: [{ cognito: ['openid'] }],
        request: {},
        responses: {
          ...successResponse(helloWorldResponseSchema),
          ...errorResponses,
        },
      }),
      async (c) => {
        const result = await this.controller.getHelloWorld();
        return c.json(result, 200);
      },
    );
  }

  public route(event: APIGatewayProxyEvent | APIGatewayProxyEventV2) {
    return this.handler(event as unknown as LambdaEvent);
  }
}
