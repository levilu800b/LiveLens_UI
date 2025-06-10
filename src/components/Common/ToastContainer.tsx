// src/components/Common/ToastContainer.tsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { uiActions } from '../../store/reducers/uiReducers';
import Toast from './Toast';

const ToastContainer: React.FC = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state: RootState) => state.ui.notifications);

  const handleClose = (id: string) => {
    dispatch(uiActions.removeNotification(id));
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          {...notification}
          onClose={() => handleClose(notification.id)}
        />
      ))}
    </div>
  );
};

export default ToastContainer;