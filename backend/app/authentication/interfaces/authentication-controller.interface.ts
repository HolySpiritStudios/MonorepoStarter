import { User } from '../../common/entities/user.entity';
import { LtiLaunchRequest, LtiLaunchResponse } from '../models/lti-launch.model';
import { SignUpRequest } from '../models/sign-up.model';

export interface IAuthenticationController {
  signUp(args: SignUpRequest): Promise<User>;

  ltiLaunch(args: LtiLaunchRequest): Promise<LtiLaunchResponse>;
}
