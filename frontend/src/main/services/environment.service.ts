import { EnvironmentVariable } from '../constants/environment-variable.constant';

export class EnvironmentService {
  /**
   * Get the current environment name (e.g., 'production', 'integration', 'prxxxx')
   */
  getEnvironment(): string {
    return EnvironmentVariable.ENVIRONMENT || import.meta.env.MODE || 'unknown';
  }

  /**
   * Check if the app is running in production
   */
  isProduction(): boolean {
    return this.getEnvironment() === 'production';
  }

  /**
   * Check if the app is running in development
   */
  isDevelopment(): boolean {
    return !this.isProduction();
  }

  /**
   * Get environment-specific metadata for analytics
   * Provides consistent environment data across all analytics events
   */
  getEnvironmentContext(): Record<string, string> {
    const environment = this.getEnvironment();

    return {
      environment,
    };
  }
}
