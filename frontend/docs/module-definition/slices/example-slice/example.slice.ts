import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { EXAMPLE_SLICE_NAME, ExampleSliceState } from './example.slice.types.ts';
import { doExampleThunkExtraReducers } from './thunks/do-example.thunk.ts';

/**
 * Define the initial state for the example slice.
 */
export const EXAMPLE_SLICE_INITIAL_STATE: ExampleSliceState = {
  valueA: 'example',
  valueB: 0,
};

/**
 * Create the example slice.
 */
const exampleSlice = createSlice({
  name: EXAMPLE_SLICE_NAME,
  initialState: EXAMPLE_SLICE_INITIAL_STATE,
  reducers: {
    resetExampleSlice: () => EXAMPLE_SLICE_INITIAL_STATE,

    setExampleValueA: (state, action: PayloadAction<string>) => {
      state.valueA = action.payload;
    },
    setExampleValueB: (state, action: PayloadAction<number>) => {
      state.valueB = action.payload;
    },
  },
  extraReducers: (builder) => {
    doExampleThunkExtraReducers(builder);
  },
});

export const { resetExampleSlice, setExampleValueA, setExampleValueB } = exampleSlice.actions;

export const ExampleSlice = exampleSlice.reducer;
