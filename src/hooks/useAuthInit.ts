// src/hooks/useAuthInit.ts - FIXED TO MATCH STORE
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { userActions } from '../store/reducers/userReducers';

import unifiedAuth from '../utils/unifiedAuth';

export const useAuthInit = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeAuth = () => {
      dispatch(userActions.setLoading(true));
      
      try {
        // Use the EXACT SAME method as your store
const user = unifiedAuth.user.getUser();
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

