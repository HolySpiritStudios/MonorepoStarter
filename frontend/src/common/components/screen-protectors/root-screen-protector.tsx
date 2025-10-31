import { Navigate } from 'react-router';

import { PathEnum } from '../../../main/constants/path.constant';
import { useAppSelector } from '../../../main/hooks/use-app-selector';
import { selectUserAuthenticationStatus } from '../../../user-management/selectors/user-authentication-status.selector';

export const RootScreenProtector = () => {
  const isAuthenticated = useAppSelector(selectUserAuthenticationStatus);

  if (isAuthenticated) {
    return <Navigate to={PathEnum.HOME} replace={true} />;
  }

  return <Navigate to={PathEnum.SIGN_IN} replace={true} />;
};
