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
    <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide mb-2">
            {title}
          </p>
          <p className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change && (
            <div className="mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${changeClasses[changeType]}`}>
                {changeType === 'positive' && '+'}
                {change}
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${getIconBgClass()} flex-shrink-0`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
