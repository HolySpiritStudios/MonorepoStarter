import { Amplify, ResourcesConfig } from 'aws-amplify';

import { EnvironmentType } from '../../types/environment.type.ts';

export class AwsConfigUtil {
  private static instance: AwsConfigUtil;

  static getInstance(): AwsConfigUtil {
    if (!AwsConfigUtil.instance) {
      AwsConfigUtil.instance = new AwsConfigUtil();
    }

    return AwsConfigUtil.instance;
  }

  configureAws(props: EnvironmentType): void {
    const { apiUrl, userPoolRegion, userPoolId, userPoolClientId, userPoolDomain } = props;

    const currentOrigin = window.location.origin;

    Amplify.configure({
      Auth: {
        Cognito: {
          userPoolId,
          userPoolClientId,
          loginWith: {
            oauth: {
              domain: userPoolDomain,
              scopes: ['openid', 'email', 'profile'],
              redirectSignIn: [`${currentOrigin}/`],
              redirectSignOut: [`${currentOrigin}/`],
              responseType: 'code',
            },
          },
        },
      },
      API: {
        REST: {
          api: {
            endpoint: apiUrl,
            region: userPoolRegion,
          },
        },
      },
    });
  }

  get config(): ResourcesConfig {
    return Amplify.getConfig();
  }
}

export const getAwsConfigUtil = (): AwsConfigUtil => AwsConfigUtil.getInstance();
