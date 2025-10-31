import { lazy } from 'react';

export const HomeScreenLazy = lazy(async () => {
  const { HomeScreen } = await import('./home.screen');
  return { default: HomeScreen };
});
