// src/hooks/useAuthInit.ts - RESTORE ENCRYPTED AUTH STATE
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { secureAuth } from '../utils/secureAuth';
import { userActions } from '../store/reducers/userReducers';

export const useAuthInit = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Restore authentication state on app startup
    const initializeAuth = () => {
      if (secureAuth.hasValidSession()) {
        const user = secureAuth.getUser();
        if (user) {
          // Restore user to Redux state
          dispatch(userActions.setUserInfo(user));
        }
      }
    };

    initializeAuth();
  }, [dispatch]);
};