import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Modal from '@/components/atoms/Modal';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import FarmForm from '@/components/organisms/FarmForm';
import farmService from '@/services/api/farmService';

const Farms = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);

  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await farmService.getAll();
      setFarms(data);
    } catch (err) {
      setError(err.message || 'Failed to load farms');
      toast.error('Failed to load farms');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFarm = (savedFarm) => {
    if (editingFarm) {
      setFarms(prev => prev.map(farm => 
        farm.Id === savedFarm.Id ? savedFarm : farm
      ));
    } else {
      setFarms(prev => [...prev, savedFarm]);
    }
    
    setShowForm(false);
    setEditingFarm(null);
  };

  const handleEditFarm = (farm) => {
    setEditingFarm(farm);
    setShowForm(true);
  };

  const handleDeleteFarm = async (farmId) => {
    if (!confirm('Are you sure you want to delete this farm? This action cannot be undone.')) {
      return;
    }

    try {
      await farmService.delete(farmId);
      setFarms(prev => prev.filter(farm => farm.Id !== farmId));
      toast.success('Farm deleted successfully');
    } catch (error) {
      toast.error('Failed to delete farm');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingFarm(null);
  };

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 bg-surface-200 rounded w-48 animate-pulse" />
          <div className="h-10 bg-surface-200 rounded w-32 animate-pulse" />
        </div>
        <SkeletonLoader count={3} type="card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState message={error} onRetry={loadFarms} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Farms</h1>
          <p className="text-gray-600 mt-1">Manage your farm properties and locations</p>
        </div>
        
<Button
          onClick={() => setShowForm(true)}
          icon="Plus"
          className="shadow-sm"
        >
          Add Farm
        </Button>
      </div>

{/* Farm Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleCancelForm}
        title={editingFarm ? 'Edit Farm' : 'Add New Farm'}
        size="medium"
      >
        <FarmForm
          farm={editingFarm}
          onSave={handleSaveFarm}
          onCancel={handleCancelForm}
        />
      </Modal>

      {/* Farms List */}
      {farms.length === 0 ? (
        <EmptyState
          title="No farms yet"
          description="Create your first farm to start tracking your agricultural operations."
          icon="Map"
          actionLabel="Add Your First Farm"
          onAction={() => setShowForm(true)}
        />
      ) : (
        <motion.div
          variants={staggerChildren}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {farms.map((farm, index) => (
            <motion.div
              key={farm.Id}
              variants={fadeInUp}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover className="group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{farm.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <ApperIcon name="MapPin" size={14} />
                      <span className="truncate">{farm.location}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="small"
                      icon="Edit2"
                      onClick={() => handleEditFarm(farm)}
                    />
                    <Button
                      variant="ghost"
                      size="small"
                      icon="Trash2"
                      onClick={() => handleDeleteFarm(farm.Id)}
                      className="text-red-600 hover:text-red-700"
                    />
                  </div>
                </div>

                {/* Farm Stats */}
                <div className="space-y-3">
<div className="flex items-center justify-between p-3 bg-surface-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <ApperIcon name="Maximize" size={16} className="text-primary" />
                      <span className="text-sm font-medium text-gray-700">Size</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {farm.size} {farm.size_unit}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Created</span>
                    <span>{new Date(farm.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-4 pt-4 border-t border-surface-200">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="small"
                      icon="Sprout"
                      onClick={() => window.location.href = `/crops?farm=${farm.Id}`}
                      className="text-xs"
                    >
                      View Crops
                    </Button>
                    <Button
                      variant="outline"
                      size="small"
                      icon="CheckSquare"
                      onClick={() => window.location.href = `/tasks?farm=${farm.Id}`}
                      className="text-xs"
                    >
                      View Tasks
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Farms;