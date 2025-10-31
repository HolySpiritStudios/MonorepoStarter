import { FC } from 'react';

/**
 * Define interface with specific screen naming if export needed
 */
export interface ExampleWithExportedPropsScreenProps {
  title: string;
}

export const ExampleWithExportedPropsScreen: FC<ExampleWithExportedPropsScreenProps> = (_props) => {
  return (
    <div>
      <p className="container text-xl">ExampleWithExportedPropsScreen</p>
    </div>
  );
};
