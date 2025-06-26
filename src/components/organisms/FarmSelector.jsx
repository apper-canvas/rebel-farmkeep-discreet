import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import farmService from '@/services/api/farmService';

const FarmSelector = () => {
  const [farms, setFarms] = useState([]);
  const [selectedFarm, setSelectedFarm] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
    setLoading(true);
    try {
      const data = await farmService.getAll();
      setFarms(data);
      if (data.length > 0 && !selectedFarm) {
        setSelectedFarm(data[0]);
      }
    } catch (error) {
      console.error('Failed to load farms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFarm = (farm) => {
    setSelectedFarm(farm);
    setIsOpen(false);
  };

  if (loading) {
    return (
      <div className="w-48 h-10 bg-surface-200 rounded-lg animate-pulse" />
    );
  }

  if (farms.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No farms available
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-surface-300 rounded-lg hover:border-primary transition-colors min-w-[200px] justify-between"
      >
        <div className="flex items-center gap-2">
          <ApperIcon name="Map" size={16} className="text-primary" />
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">
              {selectedFarm?.name || 'Select Farm'}
            </p>
            {selectedFarm && (
              <p className="text-xs text-gray-500">{selectedFarm.location}</p>
            )}
          </div>
        </div>
        <ApperIcon 
          name="ChevronDown" 
          size={16} 
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full mt-2 left-0 right-0 bg-white border border-surface-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
            >
              {farms.map((farm) => (
                <button
                  key={farm.Id}
                  onClick={() => handleSelectFarm(farm)}
                  className={`w-full px-3 py-2 text-left hover:bg-surface-50 transition-colors border-b border-surface-100 last:border-b-0 ${
                    selectedFarm?.Id === farm.Id ? 'bg-primary/5 text-primary' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ApperIcon name="Map" size={14} />
                    <div>
                      <p className="text-sm font-medium">{farm.name}</p>
                      <p className="text-xs text-gray-500">
                        {farm.location} • {farm.size} {farm.sizeUnit}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FarmSelector;