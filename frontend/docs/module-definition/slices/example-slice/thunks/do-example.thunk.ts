import { ActionReducerMapBuilder, createAsyncThunk } from '@reduxjs/toolkit';

import { ThunkApiConfigType } from '../../../../../src/main/store/main.store.ts';
import { doAnotherExampleWithPropsThunk } from '../../another-example-slice/thunks/do-another-example-with-props.thunk.ts';
import { EXAMPLE_SLICE_NAME, ExampleSliceState } from '../example.slice.types.ts';

export const doExampleThunk = createAsyncThunk<void, undefined, ThunkApiConfigType>(
  `${EXAMPLE_SLICE_NAME}/doExample`,
  async (_props, thunkAPI) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    await thunkAPI.dispatch(doAnotherExampleWithPropsThunk({ example: 'This is an example' })).unwrap();

    console.log('Example async thunk completed');
  },
);

/**
 * Define the extra reducers if we need to handle state changes based on the async thunk status
 */
export const doExampleThunkExtraReducers = (builder: ActionReducerMapBuilder<ExampleSliceState>): void => {
  builder.addCase(doExampleThunk.fulfilled, (state: ExampleSliceState) => {
    state.valueB += 1;
  });

  builder.addCase(doExampleThunk.rejected, (state: ExampleSliceState) => {
    state.valueB -= 1;
  });

  builder.addCase(doExampleThunk.pending, (state: ExampleSliceState) => {
    state.valueB = 0;
  });
};
