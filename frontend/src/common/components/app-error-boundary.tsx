import * as Sentry from '@sentry/react';

import React, { Component, ReactNode } from 'react';

import { ErrorTypeEnum } from '../../main/constants/error-type.constant';
import { getErrorTrackerUtil } from '../../main/utils/trackers/error-tracker.util';

import { CommonButton } from './common-button';

interface AppErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  hasAttemptedReload: boolean;
}

interface AppErrorBoundaryProps {
  children: ReactNode;
}

const RELOAD_QUERY_PARAM = 'forceReloadTs';
const RELOAD_COOLDOWN_MS = 5000;
const RELOAD_TIMESTAMP_KEY = 'app_error_boundary_last_reload';

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  private errorTrackerUtil = getErrorTrackerUtil();

  constructor(props: AppErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      hasAttemptedReload: false,
    };

    this.checkAndCleanupReloadParam();
  }

  private checkAndCleanupReloadParam(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const reloadTs = urlParams.get(RELOAD_QUERY_PARAM);

    if (reloadTs) {
      localStorage.setItem(RELOAD_TIMESTAMP_KEY, reloadTs);
      urlParams.delete(RELOAD_QUERY_PARAM);
      const cleanUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}${window.location.hash}`;
      window.history.replaceState({}, document.title, cleanUrl);

      this.setState({ hasAttemptedReload: true });
    }
  }

  static getDerivedStateFromError(error: Error): Partial<AppErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    if (this.shouldAttemptReload()) {
      this.attemptReload();
      return;
    }

    this.logFinalError(error, errorInfo);
  }

  private shouldAttemptReload(): boolean {
    try {
      const lastReloadTs = parseInt(localStorage.getItem(RELOAD_TIMESTAMP_KEY) || '0', 10);
      const now = Date.now();
      return now - lastReloadTs > RELOAD_COOLDOWN_MS;
    } catch {
      // If localStorage fails, assume we can reload
      return true;
    }
  }

  private attemptReload(): void {
    const now = Date.now();
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set(RELOAD_QUERY_PARAM, now.toString());

    const reloadUrl = `${window.location.pathname}?${urlParams.toString()}${window.location.hash}`;

    setTimeout(() => {
      window.location.href = reloadUrl;
    }, 100);
  }

  private logFinalError(error: Error, errorInfo: React.ErrorInfo): void {
    try {
      const managedError = new Error(`App Error Boundary: ${error.message}`);
      managedError.stack = error.stack;

      const lastReloadTs = localStorage.getItem(RELOAD_TIMESTAMP_KEY);

      this.errorTrackerUtil.trackAppBoundaryError(managedError, {
        input: {
          originalError: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          hasAttemptedReload: this.state.hasAttemptedReload,
          lastReloadTimestamp: lastReloadTs,
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        },
        note: 'Critical app-level error that persisted after reload attempt',
      });

      Sentry.withScope((scope) => {
        scope.setTag('errorType', ErrorTypeEnum.APP_ERROR_BOUNDARY);
        scope.setTag('errorBoundary', 'AppErrorBoundary');
        scope.setLevel('fatal');
        scope.setContext('errorInfo', {
          componentStack: errorInfo.componentStack,
          hasAttemptedReload: this.state.hasAttemptedReload,
          lastReloadTimestamp: lastReloadTs,
        });
        Sentry.captureException(error);
      });
    } catch (loggingError) {
      console.error('Failed to log error to Sentry:', loggingError);
      console.error('Original error:', error, errorInfo);
    }
  }

  private handleRetry = (): void => {
    window.location.href = window.location.pathname + window.location.hash;
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="bg-white rounded-3xl p-8 shadow-xl text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h1>

              <p className="text-gray-700 text-base mb-6 font-medium leading-relaxed">
                We encountered an unexpected error while loading the application. Please try again. If the problem
                persists, please help us fix this issue by reporting it.
              </p>
            </div>

            <div className="space-y-4">
              <CommonButton onClick={this.handleRetry} variant="primary" size="lg" fullWidth>
                Try Again
              </CommonButton>
            </div>
          </div>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details className="mt-6 text-left">
              <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900 font-medium">
                Error Details (Development Only)
              </summary>
              <pre className="mt-3 text-xs text-red-800 bg-red-50 p-4 rounded-xl border-2 border-red-200 overflow-auto max-h-40 font-mono">
                {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}
