// src/components/Admin/DateRangePicker.tsx
import React, { useState } from 'react';
import { Calendar } from 'lucide-react';

interface DateRange {
  startDate: string;
  endDate: string;
}

interface DateRangePickerProps {
  onDateRangeChange: (range: DateRange) => void;
  initialRange?: DateRange;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ 
  onDateRangeChange, 
  initialRange 
}) => {
  const [startDate, setStartDate] = useState(
    initialRange?.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    initialRange?.endDate || new Date().toISOString().split('T')[0]
  );
  const [isOpen, setIsOpen] = useState(false);

  const handleApply = () => {
    onDateRangeChange({ startDate, endDate });
    setIsOpen(false);
  };

  const presetRanges = [
    {
      label: 'Last 7 days',
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    {
      label: 'Last 30 days',
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    {
      label: 'Last 90 days',
      start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      end: new Date()
    }
  ];

  const applyPreset = (preset: typeof presetRanges[0]) => {
    const start = preset.start.toISOString().split('T')[0];
    const end = preset.end.toISOString().split('T')[0];
    setStartDate(start);
    setEndDate(end);
    onDateRangeChange({ startDate: start, endDate: end });
    setIsOpen(false);
  };

  return (
    <div className="relative w-full sm:w-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto flex items-center justify-center sm:justify-start space-x-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm"
      >
        <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
        <span className="font-medium text-gray-700 truncate">
          <span className="hidden sm:inline">{startDate} to {endDate}</span>
          <span className="sm:hidden">Date Range</span>
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 left-0 right-0 sm:left-0 sm:right-auto bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-full sm:w-80 md:w-96">
          <div className="p-3 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Quick Select
              </label>
              <div className="grid grid-cols-1 gap-1">
                {presetRanges.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => applyPreset(preset)}
                    className="text-left px-2 sm:px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 pt-3 sm:pt-4 border-t border-gray-200">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
