import { FC } from 'react';

interface BackgroundElementsProps {
  variant?: 'default' | 'dense';
}

export const BackgroundElements: FC<BackgroundElementsProps> = ({ variant = 'default' }) => {
  if (variant === 'dense') {
    return <div />;
  } else {
    return <div />;
  }
};
