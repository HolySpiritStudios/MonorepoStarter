import { AuthenticationController } from '../../app/authentication/controllers/authentication.controller';
import { IAuthenticationController } from '../../app/authentication/interfaces/authentication-controller.interface';
import { AuthenticationRouter } from '../../app/authentication/routers/authentication.router';
import { AuthenticationService } from '../../app/authentication/services/authentication.service';
import { CognitoService } from '../../app/common/integrations/aws/services/cognito.service';
import { UserRepository } from '../../app/common/repositories/user.repository';
import { Environment, EnvironmentService } from '../../app/common/utils/environment.util';
import { type App, RoutesService } from '../../app/common/utils/routes.util';

export function buildAuthenticationRouter(config: Partial<Environment> = {}, app?: App): Promise<AuthenticationRouter> {
  const environmentService = new EnvironmentService(config);
  const cognitoService = new CognitoService(environmentService);
  const userRepository = new UserRepository(environmentService);
  const authenticationService = new AuthenticationService(cognitoService, userRepository, environmentService);
  const controller: IAuthenticationController = new AuthenticationController(authenticationService);
  app ??= new RoutesService(environmentService).buildApp();
  const router = new AuthenticationRouter(controller, app);
  return Promise.resolve(router);
}
