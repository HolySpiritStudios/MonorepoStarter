import { localeResources } from './main/locale/setup';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'main';
    resources: (typeof localeResources)['en'];
  }
}
