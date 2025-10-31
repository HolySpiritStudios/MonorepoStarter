import { ExampleSharedTypeB } from '../types/example-shared.type.ts';

/**
 * If props no need to be exported, we can just put it without any specific file identifier.
 */
interface Props {
  anythingIfNeed: string;
}

export const mapExampleData = (_props: Props): ExampleSharedTypeB => {
  return { exampleB: 'example' };
};
