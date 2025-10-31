import { createAsyncThunk } from '@reduxjs/toolkit';

import { rehydrateConfigThunk } from '../../../../config/slices/environment-slice/thunks/rehydrate-config.thunk';
import { rehydrateUserThunk } from '../../../../user-management/slices/user-management-slice/thunks/rehydrate-user.thunk';
import { ThunkApiConfigType } from '../../../store/main.store';
import { setIsAppInitialized } from '../app-lifecycle.slice';
import { APP_LIFECYCLE_SLICE_NAME } from '../app-lifecycle.slice.types';

export const loadAppThunk = createAsyncThunk<void, undefined, ThunkApiConfigType>(
  `${APP_LIFECYCLE_SLICE_NAME}/loadApp`,
  async (_, { dispatch }) => {
    await dispatch(rehydrateConfigThunk()).unwrap();
    await dispatch(rehydrateUserThunk()).unwrap();

    dispatch(setIsAppInitialized(true));
  },
);
