import { createAsyncThunk } from '@reduxjs/toolkit';

import { AnalyticsEventEnum } from '../../../../main/constants/analytics-event.constant';
import { getMixpanelEventService, getSentryEventService } from '../../../../main/services/service-container.service';
import { resetSlicesStateThunk } from '../../../../main/slices/app-lifecycle-slice/thunks/reset-slices-state.thunk';
import { ThunkApiConfigType } from '../../../../main/store/main.store';
import { getAwsAuthUtil } from '../../../../main/utils/aws/aws-auth.util';
import { resetAppUser } from '../user-management.slice';
import { USER_MANAGEMENT_SLICE_NAME } from '../user-management.slice.types';

export const signOutThunk = createAsyncThunk<void, void, ThunkApiConfigType>(
  `${USER_MANAGEMENT_SLICE_NAME}/signOut`,
  async (_, { dispatch }) => {
    // Track sign out event before clearing user data
    getMixpanelEventService().trackEvent({
      event: AnalyticsEventEnum.SIGN_OUT,
      data: {
        method: 'manual_signout',
      },
    });

    // Reset analytics user identities
    getMixpanelEventService().resetUser();
    getSentryEventService().resetUser();

    await getAwsAuthUtil().signOut();
    await dispatch(resetSlicesStateThunk());
    dispatch(resetAppUser());
    window.location.reload();
  },
);
