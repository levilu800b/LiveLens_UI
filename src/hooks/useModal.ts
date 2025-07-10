// src/hooks/useModal.ts
import { useDispatch } from 'react-redux';
import { uiActions } from '../store/reducers/uiReducers';

export const useModal = () => {
  const dispatch = useDispatch();

  const openModal = (modalId: string) => {
    dispatch(uiActions.openModal(modalId));
  };

  const closeModal = (modalId: string) => {
    dispatch(uiActions.closeModal(modalId));
  };

  const closeAllModals = () => {
    dispatch(uiActions.closeAllModals());
  };

  // Simple modal operations without promise-based approach
  // For promise-based dialogs, use the modal components directly with callbacks

  return {
    openModal,
    closeModal,
    closeAllModals
  };
};
