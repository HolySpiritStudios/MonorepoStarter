import { PayloadAction, createSlice } from '@reduxjs/toolkit';

import { AppUser } from '../../models/user.model';

import { USER_MANAGEMENT_SLICE_NAME, UserManagementSliceState } from './user-management.slice.types';

const INITIAL_STATE: UserManagementSliceState = {
  isLoading: false,
  user: null,
};

export const userManagementSlice = createSlice({
  name: USER_MANAGEMENT_SLICE_NAME,
  initialState: INITIAL_STATE,
  reducers: {
    setUserManagementLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAppUser: (state, action: PayloadAction<AppUser>) => {
      state.user = action.payload;
    },
    resetAppUser: (state) => {
      state.user = null;
    },
  },
});

export const { setUserManagementLoading, setAppUser, resetAppUser } = userManagementSlice.actions;

export const userManagementSliceReducer = userManagementSlice.reducer;
