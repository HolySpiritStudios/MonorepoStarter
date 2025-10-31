import { FC } from 'react';

/**
 * Define interface with no screen specific naming if no export needed
 */
interface Props {
  something: boolean;
}

/**
 * Screen-name to should reflect the file-name
 */
export const ExampleScreen: FC<Props> = (_props) => {
  return (
    <div>
      <p>Example</p>
    </div>
  );
};
