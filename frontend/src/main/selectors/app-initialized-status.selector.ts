import { RootState } from '../store/main.store';

export const selectAppInitializedStatus = (state: RootState) => state.appLifecycle.isAppInitialized;
