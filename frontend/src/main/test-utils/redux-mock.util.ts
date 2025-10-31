import { jest } from '@jest/globals';
import { AsyncThunk, configureStore, createAsyncThunk } from '@reduxjs/toolkit';

import { ReduxStoreService } from '../services/redux-store.service';
import { MainStoreType, RootState, rootReducer } from '../store/main.store';

export class ReduxMockUtil {
  private static _instance: ReduxMockUtil;

  static get instance(): ReduxMockUtil {
    if (!ReduxMockUtil._instance) {
      ReduxMockUtil._instance = new ReduxMockUtil();
    }
    return ReduxMockUtil._instance;
  }

  constructor(private readonly reduxStoreService = new ReduxStoreService()) {}

  createMockStore = (state: RootState = this.reduxStoreService.getRootState()): MainStoreType => {
    return configureStore({
      reducer: rootReducer,
      preloadedState: state,
    });
  };

  createMockThunk = (key: string, mockFn: jest.Mock): AsyncThunk<unknown, unknown, never> => {
    return createAsyncThunk<unknown, unknown, never>(key, (props) => mockFn(props) as never);
  };
}

export const getReduxMockUtil = (): ReduxMockUtil => ReduxMockUtil.instance;
