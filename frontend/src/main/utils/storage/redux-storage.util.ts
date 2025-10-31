import * as localforage from 'localforage';

export class ReduxStorageUtil {
  private static _instance: ReduxStorageUtil;

  static get instance(): ReduxStorageUtil {
    if (!ReduxStorageUtil._instance) {
      ReduxStorageUtil._instance = new ReduxStorageUtil();
    }

    return ReduxStorageUtil._instance;
  }

  async setItem(key: string, value: string): Promise<void> {
    await localforage.setItem(key, value).catch(() => null);
  }

  async getItem(key: string): Promise<string | null> {
    return await localforage.getItem<string>(key).catch(() => null);
  }

  async removeItem(key: string): Promise<void> {
    await localforage.removeItem(key).catch(() => null);
  }
}

export const getReduxStorageUtil = (): ReduxStorageUtil => ReduxStorageUtil.instance;
