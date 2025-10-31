import { RootState } from '../../main/store/main.store';

export const selectUserManagementLoadingStatus = (state: RootState) => state.userManagement.isLoading;
