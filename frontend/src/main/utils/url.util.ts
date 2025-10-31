import { createBrowserRouter } from 'react-router';

import { UrlEnum } from '../constants/url.constant';
import { RemoveUrlQueryParamsType } from '../types/url.type.ts';

type BrowserRouterType = ReturnType<typeof createBrowserRouter>;

export class UrlUtil {
  private static _instance: UrlUtil;
  private browserRouter: BrowserRouterType | undefined;

  static get instance(): UrlUtil {
    if (!UrlUtil._instance) {
      UrlUtil._instance = new UrlUtil();
    }

    return UrlUtil._instance;
  }

  setBrowserRouter(browserRouter: BrowserRouterType): void {
    this.browserRouter = browserRouter;
  }

  getQueryParams(url: string): Record<string, string> {
    const urlObject = new URL(url);

    const params = {} as Record<string, string>;
    for (const [key, value] of urlObject.searchParams.entries()) {
      params[key] = value;
    }

    return params;
  }

  removeQueryParams(url: string, params: string[]): RemoveUrlQueryParamsType {
    const urlObject = new URL(url);
    let isQueryParamsRemoved = false;

    for (const param of params) {
      if (urlObject.searchParams.has(param)) {
        isQueryParamsRemoved = true;
      }

      urlObject.searchParams.delete(param);
    }

    return { isRemoved: isQueryParamsRemoved, url: urlObject.toString() };
  }

  replaceUrlState(url: string): void {
    window.history.replaceState(null, '', url);
  }

  isProductionUrl(): boolean {
    return window.location.hostname === UrlEnum.PRODUCTION_APP_HOST.toString();
  }

  isLocalhostUrl(): boolean {
    return window.location.hostname === UrlEnum.LOCAL_APP_HOST.toString();
  }

  isStagingUrl(): boolean {
    return window.location.hostname === UrlEnum.STAGING_APP_HOST.toString();
  }

  addQueryParams(url: string, params: Record<string, string>, push = false): void {
    const urlObject = new URL(url);

    for (const key in params) {
      urlObject.searchParams.set(key, params[key]);
    }

    if (push) {
      window.history.pushState(null, '', urlObject.toString());
      return;
    }

    window.history.replaceState(null, '', urlObject.toString());
  }

  async navigateToUrl(url: string, replace = false): Promise<void> {
    if (this.browserRouter) {
      await this.browserRouter.navigate(url, { replace });
    }
  }

  getPathname(): string {
    return window.location.pathname;
  }
}

export const getUrlUtil = (): UrlUtil => UrlUtil.instance;
