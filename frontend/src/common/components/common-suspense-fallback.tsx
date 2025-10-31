import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { CommonScreenContainer } from './common-screen-container';
import { LoadingSpinner } from './loading-spinner';

export const CommonSuspenseFallback: FC = () => {
  const { t } = useTranslation('common');

  return (
    <CommonScreenContainer>
      <div className="flex flex-col items-center justify-center gap-2">
        <LoadingSpinner size="lg" />

        <h2 className="text-4xl font-bold tracking-tight text-black drop-shadow-lg">{t('loading')}</h2>
      </div>
    </CommonScreenContainer>
  );
};
