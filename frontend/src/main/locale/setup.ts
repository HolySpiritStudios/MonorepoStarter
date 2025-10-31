import * as i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { COMMON_EN_LOCALE } from '../../common/locale/common.en.locale';
import { ERRORS_EN_LOCALE } from '../../common/locale/errors.en.locale';
import { USER_MANAGEMENT_EN_LOCALE } from '../../user-management/locale/user-management.en.locale';
import { getAppBuildUtil } from '../utils/app-build.util';

import { MAIN_EN_LOCALE } from './main.en.locale';

export const localeResources = {
  en: {
    main: MAIN_EN_LOCALE,
    common: COMMON_EN_LOCALE,
    errors: ERRORS_EN_LOCALE,
    userManagement: USER_MANAGEMENT_EN_LOCALE,
  },
} as const;

void i18n.use(initReactI18next).init({
  debug: !getAppBuildUtil().isProductionBuild(),
  fallbackLng: 'en',
  defaultNS: 'main',
  interpolation: {
    escapeValue: false,
  },
  resources: localeResources,
});

// eslint-disable-next-line import/no-default-export
export default i18n;
