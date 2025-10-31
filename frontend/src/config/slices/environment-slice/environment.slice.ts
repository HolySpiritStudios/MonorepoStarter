import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { PersistConfig } from 'redux-persist';
import persistReducer from 'redux-persist/es/persistReducer';

import { getReduxStorageUtil } from '../../../main/utils/storage/redux-storage.util';

import { ENVIRONMENT_SLICE_NAME, EnvironmentSliceState, SetEnvironmentPayload } from './envionment.slice.types';

const initialState: EnvironmentSliceState = {
  isLoading: false,
  name: undefined,
  config: undefined,
};

const environmentSlice = createSlice({
  name: ENVIRONMENT_SLICE_NAME,
  initialState,
  reducers: {
    setEnvironment: (state, action: PayloadAction<SetEnvironmentPayload>) => {
      state.name = action.payload.name;
      state.config = action.payload.config;
    },
    setEnvironmentLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

const persistConfig: PersistConfig<EnvironmentSliceState> = {
  key: ENVIRONMENT_SLICE_NAME,
  storage: getReduxStorageUtil(),
  whitelist: ['name', 'config'],
};

export const EnvironmentSlice = persistReducer(persistConfig, environmentSlice.reducer);
export const { setEnvironment, setEnvironmentLoading } = environmentSlice.actions;
