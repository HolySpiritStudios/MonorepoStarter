import { lazy } from 'react';

export const ExampleScreenLazy = lazy(async () => {
  const { ExampleScreen } = await import('./example.screen');
  return { default: ExampleScreen };
});
