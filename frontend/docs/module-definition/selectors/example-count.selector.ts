import { ExampleRootState } from '../types/example-mock-store.type.ts';

export const selectExampleCount = (state: ExampleRootState): number => {
  return state.exampleCount.count;
};
