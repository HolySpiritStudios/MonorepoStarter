import { FC } from 'react';

interface Props {
  // Describe the props for this component
  exampleProp: string;
}

export const ExampleComponent: FC<Props> = ({ exampleProp }) => {
  // Use the selector to get the data
  // const someData = useAppSelector((state) => state.someData);

  // Use dispatch to call the action
  // const dispatch = useAppDispatch();

  // Prefix the method with handle if it is an event handler
  // const handleDoSomething = (): void => {
  //   Implement the method
  //   dispatch(someAction());
  // }

  return (
    <div>
      {/* Render the component */}
      <h1>{exampleProp}</h1>
    </div>
  );
};
