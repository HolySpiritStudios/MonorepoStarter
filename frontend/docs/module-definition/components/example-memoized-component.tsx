import { FC, memo } from 'react';

interface Props {
  // Describe the props for this component
  exampleProp: string;
}

export const ExampleMemoizedComponent: FC<Props> = memo<Props>(({ exampleProp }) => {
  return (
    <div>
      {/* Render the component */}
      <h1>{exampleProp}</h1>
    </div>
  );
});
ExampleMemoizedComponent.displayName = 'ExampleMemoizedComponent';
