import { forwardRef, useImperativeHandle } from 'react';

interface Props {
  // Describe the props for this component
  exampleProp: string;
}

export interface ExampleForwardedRefComponentRef {
  // Describe the ref methods for this component
  doSomething: () => void;
}

export const ExampleForwardedRefComponent = forwardRef<ExampleForwardedRefComponentRef, Props>(
  ({ exampleProp }, ref) => {
    useImperativeHandle(ref, () => ({
      doSomething: (): void => {
        // Implement the ref method
      },
    }));

    return (
      <div>
        {/* Render the component */}
        <h1>{exampleProp}</h1>
      </div>
    );
  },
);
ExampleForwardedRefComponent.displayName = 'ExampleForwardedRefComponent';
