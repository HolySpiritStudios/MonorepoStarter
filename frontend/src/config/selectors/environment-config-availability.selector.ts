import { RootState } from '../../main/store/main.store';

export const selectEnvironmentConfigAvailability = (state: RootState) => {
  const environment = state.environment.name;
  const config = state.environment.config;

  return environment && config;
};
