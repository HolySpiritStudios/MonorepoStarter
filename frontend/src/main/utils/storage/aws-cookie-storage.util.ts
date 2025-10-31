import { CookieStorage } from 'aws-amplify/utils';

import { CookieStorageData } from '../../types/storage.type.ts';

export class AwsCookieStorageUtil extends CookieStorage {
  constructor(data: CookieStorageData | undefined = undefined) {
    super(data);
  }

  private extractKey(key: string): string {
    const splitKey = key.split('.');
    splitKey.splice(1, 1);

    return splitKey.join('.');
  }

  async setItem(key: string, value: string): Promise<void> {
    await super.setItem(this.extractKey(key), value);
  }

  async getItem(key: string): Promise<string | null> {
    const result = await super.getItem(this.extractKey(key));
    if (result) {
      return result;
    }

    return null;
  }

  async removeItem(key: string): Promise<void> {
    await super.removeItem(this.extractKey(key));
  }
}
