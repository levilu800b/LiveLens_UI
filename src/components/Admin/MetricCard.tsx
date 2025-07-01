// src/components/Admin/MetricCard.tsx
import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  color = 'blue'
}) => {
  const changeClasses = {
    positive: 'text-green-600 bg-green-50',
    negative: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50'
  };

  const getIconBgClass = () => {
    switch (color) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      case 'purple': return 'bg-purple-500';
      case 'indigo': return 'bg-indigo-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200 min-h-[120px] sm:min-h-[140px]">
      <div className="flex items-start justify-between h-full">
        <div className="flex-1 min-w-0 pr-2 sm:pr-4 flex flex-col justify-between">
          <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wide mb-1 sm:mb-2 leading-tight">
            {title}
          </p>
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {change && (
              <div className="mt-1 sm:mt-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${changeClasses[changeType]}`}>
                {changeType === 'positive' && '+'}
                {change}
              </span>
            </div>
          )}
          </div>
        </div>
        <div className={`p-2 sm:p-3 rounded-full ${getIconBgClass()} flex-shrink-0`}>
          <Icon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
