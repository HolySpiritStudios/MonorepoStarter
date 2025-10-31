import { AwsCurrentUserType } from '../../main/types/aws.type';
import { AppUser } from '../models/user.model';

/**
 * Maps AWS Cognito user data to AppUser format
 */
export const mapAwsUserToAppUser = (awsUser: AwsCurrentUserType): AppUser => {
  return {
    id: awsUser.id,
    name: awsUser.name ?? '',
    email: awsUser.email,
  };
};
