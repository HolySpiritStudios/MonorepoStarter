import { useTranslation } from 'react-i18next';

import { CommonScreenContainer } from '../../common/components/common-screen-container';

export const NotFoundScreen = () => {
  const { t } = useTranslation('common');
  return (
    <CommonScreenContainer>
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <p className="text-lg font-medium">{t('not_found', { ns: 'errors' })}</p>
      </div>
    </CommonScreenContainer>
  );
};
