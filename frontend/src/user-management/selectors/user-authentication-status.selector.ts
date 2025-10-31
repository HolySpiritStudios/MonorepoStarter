import { RootState } from '../../main/store/main.store';

export const selectUserAuthenticationStatus = (state: RootState) => {
  return state.userManagement.user !== null;
};

export const selectCurrentUser = (state: RootState) => {
  return state.userManagement.user;
};
