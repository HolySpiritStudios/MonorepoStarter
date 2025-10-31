import * as Sentry from '@sentry/react';

import { useEffect } from 'react';
import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType } from 'react-router';

import { AppUser } from '../../user-management/models/user.model';
import { AnalyticsProxyPath } from '../constants/analytics-proxy.constant';
import { isEphemeral } from '../constants/environment.constant';

import { EnvironmentService } from './environment.service';

export class SentryTrackerService {
  constructor(
    private readonly dsn: string,
    private readonly environmentService: EnvironmentService,
  ) {
    this.initClient();
  }

  private initClient(): void {
    if (!this.dsn) {
      return;
    }

    const environment = this.environmentService.getEnvironment();
    const sentryEnvironment = isEphemeral(environment) ? 'ephemeral' : environment;
    const isProduction = this.environmentService.isProduction();

    Sentry.init({
      dsn: this.dsn,
      tunnel: AnalyticsProxyPath.SENTRY,
      tracesSampleRate: isProduction ? 0.8 : 0.5,
      environment: sentryEnvironment,
      debug: environment === 'localhost',
      integrations: [
        Sentry.reactRouterV6BrowserTracingIntegration({
          useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes,
        }),
      ],
    });
  }

  trackError(
    error: Error,
    tags: Record<string, string | number | undefined>,
    extra?: Record<string, unknown>,
    user?: AppUser | null,
  ): void {
    if (user) {
      this.identifyUser(user);
    }

    const environmentContext = this.environmentService.getEnvironmentContext();

    const trackingData = {
      timestamp: new Date().toUTCString(),
      user_id: user?.id,
      ...environmentContext,
      ...extra,
    };

    Sentry.captureException(error, {
      tags: {
        ...tags,
        environment: environmentContext.environment,
      },
      extra: trackingData,
      level: 'error',
    });
  }

  setUser(user: AppUser): void {
    this.identifyUser(user);
  }

  resetUser(): void {
    Sentry.setUser(null);
  }

  private identifyUser(user: AppUser): void {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.name,
    });
  }

  debugTest(): void {
    // Test error tracking
    this.trackError(new Error('Sentry proxy test error'), {
      test: 'proxy_debug',
      timestamp: Date.now(),
    });

    // Test manual exception
    Sentry.captureException(new Error('Manual Sentry test via proxy'));
  }
}
