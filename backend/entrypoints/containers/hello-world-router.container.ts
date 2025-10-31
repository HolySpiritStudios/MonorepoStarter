import { Environment, EnvironmentService } from '../../app/common/utils/environment.util';
import { type App, RoutesService } from '../../app/common/utils/routes.util';
import { HelloWorldController } from '../../app/hello-world/controllers/hello-world.controller';
import { IHelloWorldController } from '../../app/hello-world/interfaces/hello-world-controller.interface';
import { HelloWorldRouter } from '../../app/hello-world/routers/hello-world.router';
import { HelloWorldService } from '../../app/hello-world/services/hello-world.service';

// eslint-disable-next-line @typescript-eslint/require-await
export async function buildHelloWorldRouter(config: Partial<Environment> = {}, app?: App): Promise<HelloWorldRouter> {
  const environmentService = new EnvironmentService(config);

  const helloWorldService = new HelloWorldService();
  const controller: IHelloWorldController = new HelloWorldController(helloWorldService);
  app ??= new RoutesService(environmentService).buildApp();
  const router = new HelloWorldRouter(controller, app);
  return router;
}
