import { FC, ReactNode, Suspense } from 'react';

import { CommonSuspenseFallback } from './common-suspense-fallback';

// Due to an issue with suspense of react-router, we need to pass a key to the component to make it work.
// Make sure to pass a unique key to the component.
// https://github.com/remix-run/react-router/issues/12474
interface Props {
  suspenseKey: string;
  children: ReactNode;
  fitContent?: boolean;
}

export const CommonSuspense: FC<Props> = ({ children, suspenseKey }) => {
  return (
    <Suspense key={suspenseKey} fallback={<CommonSuspenseFallback />}>
      {children}
    </Suspense>
  );
};
