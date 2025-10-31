import { AppUser } from '../../models/user.model';

export const USER_MANAGEMENT_SLICE_NAME = 'userManagement';

export interface UserManagementSliceState {
  isLoading: boolean;
  user: AppUser | null;
}

export interface SetAppUserPayload {
  user: AppUser;
}
