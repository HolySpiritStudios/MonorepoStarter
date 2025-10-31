import { lazy } from 'react';

export const SignUpScreenLazy = lazy(async () => {
  const { SignUpScreen } = await import('./sign-up.screen');
  return { default: SignUpScreen };
});
