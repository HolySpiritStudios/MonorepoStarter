import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { APP_LIFECYCLE_SLICE_NAME, AppLifecycleSliceState } from './app-lifecycle.slice.types';

const initialState: AppLifecycleSliceState = {
  isAppInitialized: false,
};

const appLifecycleSlice = createSlice({
  name: APP_LIFECYCLE_SLICE_NAME,
  initialState,
  reducers: {
    setIsAppInitialized: (state, action: PayloadAction<boolean>) => {
      state.isAppInitialized = action.payload;
    },
  },
});

export const { setIsAppInitialized } = appLifecycleSlice.actions;

export const AppLifecycleSlice = appLifecycleSlice.reducer;
