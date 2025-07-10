// src/components/Common/Modal.tsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { uiActions } from '../../store/reducers/uiReducers';

interface ModalProps {
  modalId: string;
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  modalId,
  isOpen,
  title,
  children,
  onClose,
  className = ''
}) => {
  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(uiActions.closeModal(modalId));
    onClose?.();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 ${className}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
