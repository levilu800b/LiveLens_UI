import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

const RefreshWarning: React.FC = () => {
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Only show warning if user is authenticated
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        e.preventDefault();
        e.returnValue = 'You will be logged out if you refresh or close this tab.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Show info banner for first-time users
    const hasSeenWarning = sessionStorage.getItem('refresh_warning_seen');
    if (!hasSeenWarning) {
      setShowWarning(true);
      sessionStorage.setItem('refresh_warning_seen', 'true');
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  if (!showWarning) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-orange-500/90 backdrop-blur-sm border-b border-orange-400/50 p-2">
      <div className="max-w-4xl mx-auto flex items-center justify-between text-white text-sm">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4" />
          <span>For security, you'll be logged out if you refresh or close this tab.</span>
        </div>
        <button
          onClick={() => setShowWarning(false)}
          className="text-white hover:text-orange-200 font-medium"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default RefreshWarning;