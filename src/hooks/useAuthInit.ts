// src/hooks/useAuthInit.ts - MINIMAL FIX (your exact logic + loading state)
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { secureAuth } from '../utils/secureAuth';
import { userActions } from '../store/reducers/userReducers';

export const useAuthInit = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Restore authentication state on app startup
    const initializeAuth = () => {
      // 🆕 ONLY ADDITION: Set loading to true at start
      dispatch(userActions.setLoading(true));
      
      try {
        // 👇 YOUR EXACT EXISTING LOGIC - NO CHANGES
        if (secureAuth.hasValidSession()) {
          const user = secureAuth.getUser();
          if (user) {
            // Restore user to Redux state
            dispatch(userActions.setUserInfo(user));
          }
        }
      } finally {
        // 🆕 ONLY ADDITION: Set loading to false when done
        dispatch(userActions.setLoading(false));
      }
    };

    initializeAuth();
  }, [dispatch]);
};