export type TokenResolverFunction = (token: string | undefined) => void;

export interface AwsCurrentUserType {
  id: string;
  email: string;
  name?: string;
}

export interface AwsAuthUtilSignInOptions {
  isRememberMe: boolean;
}
