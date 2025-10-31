// filename: ExamplePersistedSliceTypes.ts
import { PayloadAction } from '@reduxjs/toolkit';

export const EXAMPLE_PERSISTED_SLICE_NAME = 'examplePersisted';

export interface ExamplePersistedSliceState {
  persistedValueA: string;
  persistedValueB: number;
  nestedObject: {
    nestedKeyA: string;
    nestedKeyB: boolean;
  };
}

export type SetNestedObjectPayload = PayloadAction<{
  nestedKeyA: string;
  nestedKeyB: boolean;
}>;
