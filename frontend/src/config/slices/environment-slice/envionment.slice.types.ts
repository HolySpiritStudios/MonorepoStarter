import { EnvironmentType } from '../../../main/types/environment.type';

export const ENVIRONMENT_SLICE_NAME = 'environment';

export interface EnvironmentSliceState {
  name?: string;
  config?: EnvironmentType;
  isLoading: boolean;
}

export interface SetEnvironmentPayload {
  name: string;
  config: EnvironmentType;
}
