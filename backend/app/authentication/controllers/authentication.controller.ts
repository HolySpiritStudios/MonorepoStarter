import { User } from '../../common/entities/user.entity';
import { getAppLogger } from '../../common/utils/logger.util';
import { IAuthenticationController } from '../interfaces/authentication-controller.interface';
import { LtiLaunchRequest } from '../models/lti-launch.model';
import { SignUpRequest } from '../models/sign-up.model';
import { AuthenticationService } from '../services/authentication.service';

const logger = getAppLogger('authentication-controller');

export class AuthenticationController implements IAuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  async signUp(args: SignUpRequest): Promise<User> {
    logger.info('Received sign up request');
    return this.authenticationService.signUp(args);
  }

  async ltiLaunch(args: LtiLaunchRequest): Promise<{ redirectUrl: string }> {
    logger.info('Received LTI v1.3 launch request');
    return this.authenticationService.handleLtiLaunch(args.id_token);
  }
}
