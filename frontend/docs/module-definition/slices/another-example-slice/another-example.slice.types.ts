import { PayloadAction } from '@reduxjs/toolkit';

export const ANOTHER_EXAMPLE_SLICE_NAME = 'example';

export interface AnotherExampleSliceState {
  anotherValueExample: string;
  objectExample: {
    keyA: string;
    keyB: number;
  };
}

export type SetAnotherObjectExamplePayload = PayloadAction<{
  keyA: string;
  keyB: number;
}>;
