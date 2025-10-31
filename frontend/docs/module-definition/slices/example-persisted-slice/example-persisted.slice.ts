import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { PersistConfig, persistReducer } from 'redux-persist';

import { getReduxStorageUtil } from '../../../../src/main/utils/storage/redux-storage.util.ts';

import {
  EXAMPLE_PERSISTED_SLICE_NAME,
  ExamplePersistedSliceState,
  SetNestedObjectPayload,
} from './example-persisted.slice.types';

export const EXAMPLE_PERSISTED_SLICE_INITIAL_STATE: ExamplePersistedSliceState = {
  persistedValueA: 'initialValueA',
  persistedValueB: 0,
  nestedObject: {
    nestedKeyA: 'initialNestedKeyA',
    nestedKeyB: false,
  },
};

const persistConfig: PersistConfig<ExamplePersistedSliceState> = {
  key: EXAMPLE_PERSISTED_SLICE_NAME,
  storage: getReduxStorageUtil(),
  // Whitelist only the persisted values
  whitelist: ['persistedValueA', 'persistedValueB'],
};

const examplePersistedSlice = createSlice({
  name: EXAMPLE_PERSISTED_SLICE_NAME,
  initialState: EXAMPLE_PERSISTED_SLICE_INITIAL_STATE,
  reducers: {
    resetExamplePersistedSlice: () => EXAMPLE_PERSISTED_SLICE_INITIAL_STATE,

    setPersistedValueA: (state, action: PayloadAction<string>) => {
      state.persistedValueA = action.payload;
    },

    setPersistedValueB: (state, action: PayloadAction<number>) => {
      state.persistedValueB = action.payload;
    },

    /**
     * Define the action payload in `Types` file
     */
    setNestedObject: (state, action: SetNestedObjectPayload) => {
      state.nestedObject = action.payload;
    },
  },
});

export const { resetExamplePersistedSlice, setPersistedValueA, setPersistedValueB, setNestedObject } =
  examplePersistedSlice.actions;

export const ExamplePersistedSlice = persistReducer(persistConfig, examplePersistedSlice.reducer);
