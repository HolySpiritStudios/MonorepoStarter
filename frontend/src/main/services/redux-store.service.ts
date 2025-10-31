import { MainStore, RootState } from '../store/main.store';

export class ReduxStoreService {
  getRootState(): RootState {
    return MainStore.getState();
  }
}
