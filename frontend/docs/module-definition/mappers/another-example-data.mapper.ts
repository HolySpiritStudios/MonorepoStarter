import { ExampleSharedTypeA } from '../types/example-shared.type.ts';

/**
 * If props need to be exported, we should put it with specific file identifier.
 */
export interface MapAnotherExampleDataProps {
  anythingIfNeed: string;
}

export const mapAnotherExampleData = (_props: MapAnotherExampleDataProps): ExampleSharedTypeA => {
  return { exampleA: 'example' };
};
