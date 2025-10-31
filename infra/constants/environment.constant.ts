export const INTEGRATION_ENV = 'integration';
export const PRODUCTION_ENV = 'production';

export const isProduction = (env = process.env.ENVIRONMENT ?? INTEGRATION_ENV): boolean =>
  env.toLowerCase() === PRODUCTION_ENV;
export const isEphemeral = (env = process.env.ENVIRONMENT ?? INTEGRATION_ENV): boolean => /pr\d{3,4}$/i.test(env);

export const CUSTOM_INTEGRATION_ENV_CONFIG = {} as const;
export const CUSTOM_PRODUCTION_ENV_CONFIG = {} as const;
