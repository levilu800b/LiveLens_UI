// src/store/reducers/userReducers.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { User, UserState } from '../../types';

const userInitialState: UserState = {
  userInfo: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
};

const userSlice = createSlice({
  name: 'user',
  initialState: userInitialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setUserInfo: (state, action: PayloadAction<User>) => {
      state.userInfo = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    updateUserInfo: (state, action: PayloadAction<Partial<User>>) => {
      if (state.userInfo) {
        state.userInfo = { ...state.userInfo, ...action.payload };
      }
    },
    resetUserInfo: (state) => {
      state.userInfo = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setAuthenticationStatus: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
      if (!action.payload) {
        state.userInfo = null;
      }
    },
    // Action for when user verification status changes
    setVerificationStatus: (state, action: PayloadAction<boolean>) => {
      if (state.userInfo) {
        state.userInfo.isVerified = action.payload;
      }
    },
    // Action for updating admin status
    setAdminStatus: (state, action: PayloadAction<boolean>) => {
      if (state.userInfo) {
        state.userInfo.isAdmin = action.payload;
      }
    }
  }
});

export const userActions = userSlice.actions;
export const userReducer = userSlice.reducer;