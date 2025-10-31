import { createAsyncThunk } from '@reduxjs/toolkit';

import { AnalyticsEventEnum } from '../../../../main/constants/analytics-event.constant';
import { getMixpanelEventService, getSentryEventService } from '../../../../main/services/service-container.service';
import { ThunkApiConfigType } from '../../../../main/store/main.store';
import { getAwsAuthUtil } from '../../../../main/utils/aws/aws-auth.util';
import { mapAwsUserToAppUser } from '../../../utils/user-mapping.util';
import { setAppUser } from '../user-management.slice';
import { USER_MANAGEMENT_SLICE_NAME } from '../user-management.slice.types';

export const rehydrateUserThunk = createAsyncThunk<void, void, ThunkApiConfigType>(
  `${USER_MANAGEMENT_SLICE_NAME}/rehydrateUser`,
  async (_, { dispatch }) => {
    const currentUser = await getAwsAuthUtil().getCurrentUser();
    if (currentUser) {
      const appUser = mapAwsUserToAppUser(currentUser);
      dispatch(setAppUser(appUser));

      getMixpanelEventService().identifyUser(appUser);
      getMixpanelEventService().trackEvent({
        event: AnalyticsEventEnum.SIGN_IN,
        data: {
          method: 'session_rehydration',
          is_returning_user: true,
        },
      });

      getSentryEventService().identifyUser(appUser);
    }
  },
);
