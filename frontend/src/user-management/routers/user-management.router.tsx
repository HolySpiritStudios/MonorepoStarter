import { RouteObject } from 'react-router';

import { CommonSuspense } from '../../common/components/common-suspense';
import { PublicScreenProtector } from '../../common/components/screen-protectors/public-screen-protector';
import { PathEnum } from '../../main/constants/path.constant';
import { SignInScreenLazy } from '../screens/sign-in.screen.lazy';
import { SignUpScreenLazy } from '../screens/sign-up.screen.lazy';

export const UserManagementRouter: RouteObject[] = [
  {
    path: PathEnum.SIGN_IN,
    element: (
      <CommonSuspense suspenseKey={PathEnum.SIGN_IN}>
        <PublicScreenProtector>
          <SignInScreenLazy />
        </PublicScreenProtector>
      </CommonSuspense>
    ),
  },
  {
    path: PathEnum.SIGN_UP,
    element: (
      <CommonSuspense suspenseKey={PathEnum.SIGN_UP}>
        <PublicScreenProtector>
          <SignUpScreenLazy />
        </PublicScreenProtector>
      </CommonSuspense>
    ),
  },
];
