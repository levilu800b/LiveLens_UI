// src/components/Admin/ExportButton.tsx
import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText, AlertCircle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { uiActions } from '../../store/reducers/uiReducers';

interface ExportButtonProps {
  data: Record<string, unknown>[];
  filename: string;
  headers?: string[];
}

const ExportButton: React.FC<ExportButtonProps> = ({ 
  data, 
  filename, 
  headers
}) => {
  const dispatch = useDispatch();
  const [isExporting, setIsExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const exportAsCSV = () => {
    try {
      setIsExporting(true);
      
      if (!data || data.length === 0) {
        dispatch(uiActions.addNotification({
          message: 'No data to export',
          type: 'warning'
        }));
        return;
      }

      // Generate headers from first object keys if not provided
      const csvHeaders = headers || Object.keys(data[0]);
      
      // Create CSV content
      const csvContent = [
        csvHeaders.join(','),
        ...data.map(row => 
          csvHeaders.map(header => {
            const value = row[header];
            // Handle values that contain commas or quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value || '';
          }).join(',')
        )
      ].join('\n');

      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export error:', error);
      dispatch(uiActions.addNotification({
        message: 'Failed to export data. Please try again.',
        type: 'error'
      }));
    } finally {
      setIsExporting(false);
      setShowDropdown(false);
    }
  };

  const exportAsJSON = () => {
    try {
      setIsExporting(true);
      
      if (!data || data.length === 0) {
        dispatch(uiActions.addNotification({
          message: 'No data to export',
          type: 'warning'
        }));
        return;
      }

      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export error:', error);
      dispatch(uiActions.addNotification({
        message: 'Failed to export data. Please try again.',
        type: 'error'
      }));
    } finally {
      setIsExporting(false);
      setShowDropdown(false);
    }
  };

  const exportOptions = [
    {
      label: 'Export as CSV',
      icon: FileSpreadsheet,
      onClick: exportAsCSV,
      description: 'Comma-separated values for spreadsheets'
    },
    {
      label: 'Export as JSON',
      icon: FileText,
      onClick: exportAsJSON,
      description: 'JSON format for data processing'
    }
  ];

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center space-x-2 px-2 sm:px-3 py-2 text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed text-sm">
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <span className="hidden sm:inline">No data to export</span>
        <span className="sm:hidden">No data</span>
      </div>
    );
  }

  return (
    <div className="relative w-full sm:w-auto">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isExporting}
        className="w-full sm:w-auto flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
      >
        <Download className={`h-4 w-4 flex-shrink-0 ${isExporting ? 'animate-bounce' : ''}`} />
        <span className="hidden sm:inline">{isExporting ? 'Exporting...' : 'Export Data'}</span>
        <span className="sm:hidden">{isExporting ? 'Exporting...' : 'Export'}</span>
      </button>

      {showDropdown && (
        <div className="absolute top-full mt-2 left-0 right-0 sm:left-auto sm:right-0 sm:w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="py-2">
            {exportOptions.map((option, index) => (
              <button
                key={index}
                onClick={option.onClick}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-gray-50 flex items-start space-x-2 sm:space-x-3 transition-colors"
              >
                <option.icon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-900 text-sm sm:text-base">{option.label}</div>
                  <div className="text-xs text-gray-500 hidden sm:block">{option.description}</div>
                </div>
              </button>
            ))}
          </div>
          <div className="border-t border-gray-200 px-3 sm:px-4 py-2">
            <div className="text-xs text-gray-500">
              {data.length} record{data.length !== 1 ? 's' : ''} available
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportButton;
