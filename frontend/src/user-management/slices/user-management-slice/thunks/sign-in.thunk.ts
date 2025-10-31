import { createAsyncThunk } from '@reduxjs/toolkit';

import { AnalyticsEventEnum } from '../../../../main/constants/analytics-event.constant';
import { getMixpanelEventService, getSentryEventService } from '../../../../main/services/service-container.service';
import { ThunkApiConfigType } from '../../../../main/store/main.store';
import { getAwsAuthUtil } from '../../../../main/utils/aws/aws-auth.util';
import { SignInFormData } from '../../../models/sign-in.model';
import { selectUserManagementLoadingStatus } from '../../../selectors/user-management-loading-status.selector';
import { mapAwsUserToAppUser } from '../../../utils/user-mapping.util';
import { setAppUser, setUserManagementLoading } from '../user-management.slice';
import { USER_MANAGEMENT_SLICE_NAME } from '../user-management.slice.types';

export const signInThunk = createAsyncThunk<void, SignInFormData, ThunkApiConfigType>(
  `${USER_MANAGEMENT_SLICE_NAME}/signIn`,
  async (user, { dispatch, getState }) => {
    try {
      const isLoading = selectUserManagementLoadingStatus(getState());
      if (isLoading) {
        return;
      }

      dispatch(setUserManagementLoading(true));

      await getAwsAuthUtil().signIn(user.email, user.password, { isRememberMe: true });
      const currentUser = await getAwsAuthUtil().getCurrentUser();

      dispatch(setUserManagementLoading(false));
      if (currentUser) {
        const appUser = mapAwsUserToAppUser(currentUser);
        dispatch(setAppUser(appUser));

        getMixpanelEventService().identifyUser(appUser);
        getMixpanelEventService().trackEvent({
          event: AnalyticsEventEnum.SIGN_IN,
          data: {
            method: 'email_password',
            is_remember_me: true,
          },
        });

        getSentryEventService().identifyUser(appUser);
      }
    } catch (error) {
      dispatch(setUserManagementLoading(false));
      getSentryEventService().trackError(error as Error, { action: 'signIn' });
    }
  },
);
