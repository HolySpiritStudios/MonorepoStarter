import { lazy } from 'react';

export const ExampleWithExportedPropsScreenLazy = lazy(async () => {
  const { ExampleWithExportedPropsScreen } = await import('./example-with-exported-props.screen');
  return { default: ExampleWithExportedPropsScreen };
});
