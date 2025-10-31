export enum EnvironmentEnum {
  PRODUCTION = 'production',
  INTEGRATION = 'integration',
  LOCALHOST = 'localhost',
}

export const isEphemeral = (env: string): boolean => /pr\d{3,4}$/i.test(env);
