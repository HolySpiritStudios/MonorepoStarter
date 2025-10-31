import { createAsyncThunk } from '@reduxjs/toolkit';

import { ThunkApiConfigType } from '../../../store/main.store';
import { APP_LIFECYCLE_SLICE_NAME } from '../app-lifecycle.slice.types';

export const resetSlicesStateThunk = createAsyncThunk<void, undefined, ThunkApiConfigType>(
  `${APP_LIFECYCLE_SLICE_NAME}/resetSlicesState`,
  (_) => {
    // TODO: reset all slices state, commonly it will be "user specific" data
  },
);
