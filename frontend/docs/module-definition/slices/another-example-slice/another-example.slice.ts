import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import {
  ANOTHER_EXAMPLE_SLICE_NAME,
  AnotherExampleSliceState,
  SetAnotherObjectExamplePayload,
} from './another-example.slice.types';

export const ANOTHER_EXAMPLE_SLICE_INITIAL_STATE: AnotherExampleSliceState = {
  anotherValueExample: 'example',
  objectExample: {
    keyA: 'example',
    keyB: 0,
  },
};

const anotherExampleSlice = createSlice({
  name: ANOTHER_EXAMPLE_SLICE_NAME,
  initialState: ANOTHER_EXAMPLE_SLICE_INITIAL_STATE,
  reducers: {
    resetAnotherExampleSlice: () => ANOTHER_EXAMPLE_SLICE_INITIAL_STATE,

    setAnotherValueExample: (state, action: PayloadAction<string>) => {
      state.anotherValueExample = action.payload;
    },

    /**
     * Define the action payload in `Types` file
     */
    setAnotherObjectExample: (state, action: SetAnotherObjectExamplePayload) => {
      state.objectExample = action.payload;
    },
  },
});

export const { resetAnotherExampleSlice, setAnotherValueExample } = anotherExampleSlice.actions;

export const ExampleSlice = anotherExampleSlice.reducer;
