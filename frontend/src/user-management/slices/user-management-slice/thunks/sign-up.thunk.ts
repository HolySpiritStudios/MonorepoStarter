import { createAsyncThunk } from '@reduxjs/toolkit';

import { extractMessageFromApiError } from '../../../../common/utils/error.utils';
import { PathEnum } from '../../../../main/constants/path.constant';
import { ThunkApiConfigType } from '../../../../main/store/main.store';
import { getLocaleUtil } from '../../../../main/utils/locale.util';
import { getToasterUtil } from '../../../../main/utils/toaster.util';
import { ErrorTrackerUtil } from '../../../../main/utils/trackers/error-tracker.util';
import { getUrlUtil } from '../../../../main/utils/url.util';
import { SignUpFormData } from '../../../models/sign-up.model';
import { signUpRequest } from '../../../requests/sign-up.request';
import { selectUserManagementLoadingStatus } from '../../../selectors/user-management-loading-status.selector';
import { setUserManagementLoading } from '../user-management.slice';
import { USER_MANAGEMENT_SLICE_NAME } from '../user-management.slice.types';

export const signUpThunk = createAsyncThunk<void, SignUpFormData, ThunkApiConfigType>(
  `${USER_MANAGEMENT_SLICE_NAME}/signUp`,
  async (props, { dispatch, getState }) => {
    try {
      const isLoading = selectUserManagementLoadingStatus(getState());
      if (isLoading) {
        return;
      }

      dispatch(setUserManagementLoading(true));
      await signUpRequest({
        fullName: props.name,
        email: props.email,
        password: props.password,
      });
      dispatch(setUserManagementLoading(false));
      getToasterUtil().showSuccess(getLocaleUtil().select('userManagement:sign_up_success'));
      await getUrlUtil().navigateToUrl(PathEnum.SIGN_IN, true);
    } catch (error) {
      dispatch(setUserManagementLoading(false));
      const fallbackMessage = getLocaleUtil().select('userManagement:sign_up_error');
      const errorMessage = extractMessageFromApiError(error) ?? fallbackMessage;
      getToasterUtil().showError(errorMessage);
      ErrorTrackerUtil.getInstance().trackAuthError(error as Error, 'sign-up', { input: props });
    }
  },
);
