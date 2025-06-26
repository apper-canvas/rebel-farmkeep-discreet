import { useState, useEffect } from 'react';
import ApperIcon from '@/components/ApperIcon';

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState(new Date());

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastSync(new Date());
    };
    
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
        isOnline 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          isOnline ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <span className="font-medium">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
      
      {isOnline && (
        <div className="hidden sm:flex items-center gap-1 text-gray-500">
          <ApperIcon name="RefreshCw" size={14} />
          <span>Synced {lastSync.toLocaleTimeString()}</span>
        </div>
      )}
    </div>
  );
};

export default OfflineIndicator;