import { AuthenticationService } from '../../app/authentication/services/authentication.service';
import { CognitoService } from '../../app/common/integrations/aws/services/cognito.service';
import { UserRepository } from '../../app/common/repositories/user.repository';
import { Environment, EnvironmentService } from '../../app/common/utils/environment.util';

export function buildAuthenticationService(config: Partial<Environment> = {}): AuthenticationService {
  const environmentService = new EnvironmentService(config);
  const cognitoService = new CognitoService(environmentService);
  const userRepository = new UserRepository(environmentService);
  const authenticationService = new AuthenticationService(cognitoService, userRepository, environmentService);
  return authenticationService;
}
