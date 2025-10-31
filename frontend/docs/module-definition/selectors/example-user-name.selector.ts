import { ExampleRootState } from '../types/example-mock-store.type.ts';

/**
 * Define the props within the same folder.
 * If no export needed, just put it without any specific file identifier.
 */
interface Props {
  anythingIfNeed: string;
}

export const selectExampleUserName = (state: ExampleRootState, _props: Props): string => {
  return state.exampleUser.name;
};
