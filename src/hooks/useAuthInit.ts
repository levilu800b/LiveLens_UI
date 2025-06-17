// src/hooks/useAuthInit.ts - FIXED TO MATCH STORE
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { secureUserStorage } from '../utils/secureStorage'; // SAME import as store
import { userActions } from '../store/reducers/userReducers';

export const useAuthInit = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = () => {
      dispatch(userActions.setLoading(true));
      
      try {
        // Use the EXACT SAME method as your store
        const user = secureUserStorage.getUser();        
        if (user) {
          dispatch(userActions.setUserInfo(user));
        }
      } finally {
        dispatch(userActions.setLoading(false));
      }
    };

    initializeAuth();
  }, [dispatch]);
};

