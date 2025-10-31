import { lazy } from 'react';

export const SignInScreenLazy = lazy(async () => {
  const { SignInScreen } = await import('./sign-in.screen');
  return { default: SignInScreen };
});
