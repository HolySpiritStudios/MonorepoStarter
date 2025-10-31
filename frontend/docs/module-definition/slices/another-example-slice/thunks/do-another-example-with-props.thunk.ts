import { createAsyncThunk } from '@reduxjs/toolkit';

import { ANOTHER_EXAMPLE_SLICE_NAME } from '../another-example.slice.types';

/**
 * Define the props for the respective async thunk
 */
interface Props {
  example: string;
}

export const doAnotherExampleWithPropsThunk = createAsyncThunk(
  `${ANOTHER_EXAMPLE_SLICE_NAME}/doAnotherExample`,
  async (_props: Props) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Another example async thunk completed');
  },
);
