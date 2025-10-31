import { MockAuthenticationController } from '../../app/authentication/controllers/mock-authentication.controller';
import { AuthenticationRouter } from '../../app/authentication/routers/authentication.router';
import { DocsRouter } from '../../app/common/routers/docs.router';
import { Environment, EnvironmentService } from '../../app/common/utils/environment.util';
import { type App, RoutesService } from '../../app/common/utils/routes.util';
import { MockHelloWorldController } from '../../app/hello-world/controllers/mock-hello-world.controller';
import { HelloWorldRouter } from '../../app/hello-world/routers/hello-world.router';

export async function buildMockUberApp(config: Partial<Environment> = {}): Promise<App> {
  const environmentService = new EnvironmentService(config);
  const routesService = new RoutesService(environmentService);

  const app = routesService.buildApp();

  new AuthenticationRouter(new MockAuthenticationController(), app);
  new HelloWorldRouter(new MockHelloWorldController(), app);
  await DocsRouter.create(environmentService, routesService, app);

  return Promise.resolve(app);
}
