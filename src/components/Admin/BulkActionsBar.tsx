// src/components/Admin/BulkActionsBar.tsx
import React, { useState } from 'react';
import { CheckSquare } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { uiActions } from '../../store/reducers/uiReducers';
import ConfirmModal from '../Common/ConfirmModal';

interface BulkAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  destructive?: boolean;
  requiresConfirmation?: boolean;
}

interface BulkActionsBarProps {
  selectedItems: string[];
  totalItems: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkAction: (actionId: string, selectedItems: string[]) => Promise<void>;
  actions: BulkAction[];
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedItems,
  totalItems,
  onSelectAll,
  onClearSelection,
  onBulkAction,
  actions
}) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<BulkAction | null>(null);

  const handleBulkAction = async (action: BulkAction) => {
    if (selectedItems.length === 0) return;

    if (action.requiresConfirmation || action.destructive) {
      setConfirmAction(action);
      dispatch(uiActions.openModal('bulk-action-confirm'));
      return;
    }

    // Execute non-destructive actions directly
    await executeBulkAction(action);
  };

  const executeBulkAction = async (action: BulkAction) => {
    try {
      setIsLoading(action.id);
      await onBulkAction(action.id, selectedItems);
      onClearSelection();
    } catch (error) {
      console.error('Bulk action error:', error);
      dispatch(uiActions.addNotification({
        message: `Failed to ${action.label.toLowerCase()}. Please try again.`,
        type: 'error'
      }));
    } finally {
      setIsLoading(null);
    }
  };

  const handleConfirmAction = async () => {
    if (confirmAction) {
      await executeBulkAction(confirmAction);
      setConfirmAction(null);
      dispatch(uiActions.closeModal('bulk-action-confirm'));
    }
  };

  const handleCancelAction = () => {
    setConfirmAction(null);
    dispatch(uiActions.closeModal('bulk-action-confirm'));
  };

  if (selectedItems.length === 0) {
    return null;
  }

  const allSelected = selectedItems.length === totalItems;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <CheckSquare className="h-4 sm:h-5 w-4 sm:w-5 text-blue-600 flex-shrink-0" />
            <span className="font-medium text-blue-900 text-sm sm:text-base">
              {selectedItems.length} of {totalItems} item{selectedItems.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          
          <div className="flex items-center space-x-3 sm:space-x-2">
            {!allSelected && (
              <button
                onClick={onSelectAll}
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Select all {totalItems}
              </button>
            )}
            <button
              onClick={onClearSelection}
              className="text-xs sm:text-sm text-gray-600 hover:text-gray-800"
            >
              Clear selection
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleBulkAction(action)}
              disabled={isLoading !== null}
              className={`
                flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors
                ${action.destructive 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-300' 
                  : `${action.color} border border-gray-300`
                }
                ${isLoading === action.id ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <action.icon className={`h-3 sm:h-4 w-3 sm:w-4 flex-shrink-0 ${isLoading === action.id ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isLoading === action.id ? 'Processing...' : action.label}
              </span>
              <span className="sm:hidden">
                {isLoading === action.id ? '...' : action.label.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmAction && (
        <ConfirmModal
          modalId="bulk-action-confirm"
          title={`Confirm ${confirmAction.label}`}
          message={
            confirmAction.destructive 
              ? `Are you sure you want to ${confirmAction.label.toLowerCase()} ${selectedItems.length} item(s)? This action cannot be undone.`
              : `Are you sure you want to ${confirmAction.label.toLowerCase()} ${selectedItems.length} item(s)?`
          }
          confirmText={confirmAction.label}
          onConfirm={handleConfirmAction}
          onCancel={handleCancelAction}
          isDestructive={confirmAction.destructive}
        />
      )}
    </div>
  );
};

export default BulkActionsBar;
