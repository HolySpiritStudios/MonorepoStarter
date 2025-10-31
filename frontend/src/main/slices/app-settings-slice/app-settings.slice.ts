import { createSlice } from '@reduxjs/toolkit';

import { PersistConfig, persistReducer } from 'redux-persist';

import { getReduxStorageUtil } from '../../utils/storage/redux-storage.util.ts';

import { APP_SETTINGS_SLICE_NAME, AppSettingsSliceState } from './app-settings.slice.types.ts';

const initialState: AppSettingsSliceState = {
  isDeveloperMode: false,
};

const persistConfig: PersistConfig<AppSettingsSliceState> = {
  key: APP_SETTINGS_SLICE_NAME,
  storage: getReduxStorageUtil(),
  whitelist: ['isDeveloperMode'],
};

const appSettingsSlice = createSlice({
  name: APP_SETTINGS_SLICE_NAME,
  initialState,
  reducers: {},
});

export const AppSettingsSlice = persistReducer(persistConfig, appSettingsSlice.reducer);
