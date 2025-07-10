// src/components/Common/ConfirmModal.tsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Modal from './Modal';
import { uiActions } from '../../store/reducers/uiReducers';
import type { RootState } from '../../types';

interface ConfirmModalProps {
  modalId: string;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  isDestructive?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  modalId,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = false
}) => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.ui.modals[modalId] || false);

  const handleConfirm = () => {
    onConfirm();
    dispatch(uiActions.closeModal(modalId));
  };

  const handleCancel = () => {
    onCancel?.();
    dispatch(uiActions.closeModal(modalId));
  };

  return (
    <Modal
      modalId={modalId}
      isOpen={isOpen}
      title={title}
      onClose={handleCancel}
    >
      <div className="mb-6">
        <p className="text-gray-700 dark:text-gray-300">{message}</p>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          onClick={handleCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          {cancelText}
        </button>
        <button
          onClick={handleConfirm}
          className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 ${
            isDestructive
              ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
          }`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
