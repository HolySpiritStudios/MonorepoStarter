import { lazy } from 'react';

export const ExampleWithNoPropsScreenLazy = lazy(async () => {
  const { ExampleWithNoPropsScreen } = await import('./example-with-no-props.screen');
  return { default: ExampleWithNoPropsScreen };
});
