// src/components/Common/InputModal.tsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Modal from './Modal';
import { uiActions } from '../../store/reducers/uiReducers';
import type { RootState } from '../../types';

interface InputModalProps {
  modalId: string;
  title: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (value: string) => void;
  onCancel?: () => void;
  isRequired?: boolean;
  inputType?: 'text' | 'number' | 'textarea';
  validation?: (value: string) => string | null; // Return error message or null if valid
}

const InputModal: React.FC<InputModalProps> = ({
  modalId,
  title,
  message,
  placeholder = '',
  defaultValue = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isRequired = false,
  inputType = 'text',
  validation
}) => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state: RootState) => state.ui.modals[modalId] || false);
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      setError(null);
    }
  }, [isOpen, defaultValue]);

  const handleConfirm = () => {
    if (isRequired && !value.trim()) {
      setError('This field is required');
      return;
    }

    if (validation) {
      const validationError = validation(value);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    onConfirm(value);
    dispatch(uiActions.closeModal(modalId));
  };

  const handleCancel = () => {
    onCancel?.();
    dispatch(uiActions.closeModal(modalId));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputType !== 'textarea') {
      handleConfirm();
    }
  };

  return (
    <Modal
      modalId={modalId}
      isOpen={isOpen}
      title={title}
      onClose={handleCancel}
    >
      <div className="mb-4">
        <p className="text-gray-700 dark:text-gray-300 mb-4">{message}</p>
        
        {inputType === 'textarea' ? (
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-vertical ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            rows={4}
            autoFocus
          />
        ) : (
          <input
            type={inputType}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              error ? 'border-red-500' : 'border-gray-300'
            }`}
            autoFocus
          />
        )}
        
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
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
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default InputModal;
