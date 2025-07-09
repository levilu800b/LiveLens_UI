// src/hooks/useToast.ts
import { useDispatch } from 'react-redux';
import { uiActions } from '../store/reducers/uiReducers';

type ToastType = 'success' | 'error' | 'warning' | 'info';

export const useToast = () => {
  const dispatch = useDispatch();

  const showToast = (message: string, type: ToastType = 'info', duration?: number) => {
    dispatch(uiActions.addNotification({
      type,
      message,
      duration
    }));
  };

  const showSuccess = (message: string, duration?: number) => {
    showToast(message, 'success', duration);
  };

  const showError = (message: string, duration?: number) => {
    showToast(message, 'error', duration);
  };

  const showWarning = (message: string, duration?: number) => {
    showToast(message, 'warning', duration);
  };

  const showInfo = (message: string, duration?: number) => {
    showToast(message, 'info', duration);
  };

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};
