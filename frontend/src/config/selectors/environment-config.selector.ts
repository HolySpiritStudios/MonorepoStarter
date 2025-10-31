import { RootState } from '../../main/store/main.store';

export const selectEnvironmentConfig = (state: RootState) => {
  return state.environment.config;
};
