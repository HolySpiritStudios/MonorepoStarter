/**
 * Declare props for the hook as Props
 */
interface Props {
  something: boolean;
}

/**
 * Declare return type for the hook as ReturnType
 */
interface ReturnType {
  anotherThing: boolean;
}

export const useExampleWithReturnValue = (_props: Props): ReturnType => {
  return {
    anotherThing: true,
  };
};
