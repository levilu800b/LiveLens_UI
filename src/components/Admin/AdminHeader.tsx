// src/components/Admin/AdminHeader.tsx
import React from 'react';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title, subtitle, children }) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="py-4 sm:py-6">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <div className="min-w-0 flex-1 pt-12 lg:pt-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>
              {subtitle && (
                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">{subtitle}</p>
              )}
            </div>
            
            {children && (
              <div className="flex-shrink-0">
                {children}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
