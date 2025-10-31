import { User } from '../../common/entities/user.entity';
import { NotFoundError } from '../../common/utils/errors';
import { IAuthenticationController } from '../interfaces/authentication-controller.interface';
import { LtiLaunchRequest } from '../models/lti-launch.model';
import { SignUpRequest } from '../models/sign-up.model';

export class MockAuthenticationController implements IAuthenticationController {
  signUp(_: SignUpRequest): Promise<User> {
    throw new NotFoundError('MockAuthenticationController.signUp not implemented');
  }

  ltiLaunch(_: LtiLaunchRequest): Promise<{ redirectUrl: string }> {
    throw new NotFoundError('MockAuthenticationController.ltiLaunch not implemented');
  }
}
