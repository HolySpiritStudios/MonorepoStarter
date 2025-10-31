import { nanoid } from '@reduxjs/toolkit';
import { QueryClient } from '@tanstack/react-query';

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import { AbortRequestEnum } from '../../constants/abort-request.constant';
import { ErrorTypeEnum } from '../../constants/error-type.constant';
import { getSentryEventService } from '../../services/service-container.service';
import { EnvironmentType } from '../../types/environment.type.ts';
import { getAwsAuthUtil } from '../aws/aws-auth.util';

export class RestClientUtil {
  private static _instance: RestClientUtil;
  private client?: QueryClient;
  private axiosInstance?: AxiosInstance;
  private readonly CLIENT_NAME = 'RestClientUtil';
  private abortControllers: Record<string, AbortController> = {};
  private readonly AUTHORIZATION_HEADER = 'Authorization';

  private constructor(
    private readonly authUtil = getAwsAuthUtil(),
    private readonly sentryEventService = getSentryEventService(),
  ) {}

  public static get instance(): RestClientUtil {
    if (!RestClientUtil._instance) {
      RestClientUtil._instance = new RestClientUtil();
    }
    return RestClientUtil._instance;
  }

  public abortAllRequests(reason: AbortRequestEnum): void {
    Object.keys(this.abortControllers).forEach((key) => {
      this.abortControllers[key].abort(reason);
      delete this.abortControllers[key];
    });
  }

  public initialize(env: EnvironmentType): void {
    this.client = new QueryClient();

    this.axiosInstance = axios.create({
      baseURL: env.apiUrl,
    });
  }

  private async getAuthHeaders(useAuth: boolean): Promise<Record<string, string>> {
    if (useAuth) {
      const idToken = await this.authUtil.getIdToken();
      return { [this.AUTHORIZATION_HEADER]: idToken || '' };
    }
    return {};
  }

  public async get<R, V extends object | undefined>(
    url: string,
    params: V,
    keys: string[],
    { bypassCache = false, useAuth = false }: { bypassCache?: boolean; useAuth?: boolean } = {},
  ): Promise<R> {
    if (!this.client) {
      throw new Error(ErrorTypeEnum.CLIENT_NOT_INITIALIZED);
    }

    if (bypassCache) {
      this.invalidate(keys);
    }

    return this.client.fetchQuery({
      queryKey: keys,
      queryFn: async () => this.request<R>({ method: 'GET', url, params, useAuth, keys }),
    });
  }

  public async post<R, V extends object | undefined>(url: string, data: V, options: { useAuth: boolean }): Promise<R> {
    return this.request<R>({ method: 'POST', url, data, ...options });
  }

  public async put<R, V extends object | undefined>(url: string, data: V, options: { useAuth: boolean }): Promise<R> {
    return this.request<R>({ method: 'PUT', url, data, ...options });
  }

  public async delete<R>(url: string, options: { useAuth: boolean }): Promise<R> {
    return this.request<R>({ method: 'DELETE', url, ...options });
  }

  private async request<R>(config: AxiosRequestConfig & { useAuth: boolean; keys?: string[] }): Promise<R> {
    if (!this.axiosInstance) {
      throw new Error(ErrorTypeEnum.CLIENT_NOT_INITIALIZED);
    }

    const { useAuth, keys = [], ...axiosConfig } = config;
    const uniqueRequestId = nanoid(12);
    const controller = new AbortController();
    this.abortControllers[uniqueRequestId] = controller;

    try {
      const headers = await this.getAuthHeaders(useAuth);
      const response = await this.axiosInstance.request<R>({
        ...axiosConfig,
        headers: { ...headers, ...axiosConfig.headers },
        signal: controller.signal,
      });
      delete this.abortControllers[uniqueRequestId];
      return response.data;
    } catch (error: unknown) {
      delete this.abortControllers[uniqueRequestId];
      if (axios.isCancel(error)) {
        console.log('Request canceled', error.message);
      } else {
        const errorName = (error as { name: string }).name;
        const errorMessage = (error as { message: string }).message;

        const enhancedError = new Error(errorMessage);
        enhancedError.name = `${ErrorTypeEnum.REST_NETWORK}: ${keys.join('.')}`;

        this.sentryEventService.trackError(
          enhancedError,
          {
            client: this.CLIENT_NAME,
            errorType: ErrorTypeEnum.REST_NETWORK,
          },
          {
            url: config.url,
            method: config.method,
            errorName,
          },
        );
      }
      throw error;
    }
  }

  public invalidate(keys: string[]): void {
    this.client?.invalidateQueries({ queryKey: keys });
  }
}

export const getRestClientUtil = (): RestClientUtil => RestClientUtil.instance;
