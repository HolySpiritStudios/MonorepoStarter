import i18next from 'i18next';

import { LocaleKey } from '../types/locale.type.ts';

export class LocaleUtil {
  private static _instance: LocaleUtil;

  static get instance(): LocaleUtil {
    if (!LocaleUtil._instance) {
      LocaleUtil._instance = new LocaleUtil();
    }

    return LocaleUtil._instance;
  }

  get select(): (key: LocaleKey, options?: Record<string, string | undefined>) => string {
    return i18next.t;
  }
}

export const getLocaleUtil = (): LocaleUtil => LocaleUtil.instance;
