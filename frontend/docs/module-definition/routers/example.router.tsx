import { RouteObject } from 'react-router';

import { CommonSuspense } from '../../../src/common/components/common-suspense';
import { PublicScreenProtector } from '../../../src/common/components/screen-protectors/public-screen-protector';
import { UserAuthenticatedScreenProtector } from '../../../src/common/components/screen-protectors/user-authenticated-screen-protector';

export const ExampleRouter: RouteObject[] = [
  {
    path: '/example/public',

    element: (
      <CommonSuspense suspenseKey={'example-public'}>
        <PublicScreenProtector>
          <div>This is lazy imported component</div>
        </PublicScreenProtector>
      </CommonSuspense>
    ),
  },
  {
    path: '/example/user-authenticated',
    element: (
      <CommonSuspense suspenseKey={'example-user-authenticated'}>
        <UserAuthenticatedScreenProtector>
          <div>This is lazy imported component</div>
        </UserAuthenticatedScreenProtector>
      </CommonSuspense>
    ),
  },
];
