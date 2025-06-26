import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import CropCard from '@/components/molecules/CropCard';
import Modal from '@/components/atoms/Modal';
import CropForm from '@/components/organisms/CropForm';
import cropService from '@/services/api/cropService';
import farmService from '@/services/api/farmService';

const Crops = () => {
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [selectedFarm, setSelectedFarm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [cropsData, farmsData] = await Promise.all([
        cropService.getAll(),
        farmService.getAll()
      ]);
      
      // Add farm names to crops
      const cropsWithFarms = cropsData.map(crop => {
        const farm = farmsData.find(f => f.Id === crop.farmId);
        return { ...crop, farmName: farm?.name || 'Unknown Farm' };
      });
      
      setCrops(cropsWithFarms);
      setFarms(farmsData);
    } catch (err) {
      setError(err.message || 'Failed to load crops');
      toast.error('Failed to load crops');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCrop = (savedCrop) => {
    const farm = farms.find(f => f.Id === savedCrop.farmId);
    const cropWithFarm = { ...savedCrop, farmName: farm?.name || 'Unknown Farm' };
    
    if (editingCrop) {
      setCrops(prev => prev.map(crop => 
        crop.Id === savedCrop.Id ? cropWithFarm : crop
      ));
    } else {
      setCrops(prev => [...prev, cropWithFarm]);
    }
    
    setShowForm(false);
    setEditingCrop(null);
  };

  const handleEditCrop = (crop) => {
    setEditingCrop(crop);
    setShowForm(true);
  };

  const handleDeleteCrop = async (cropId) => {
    if (!confirm('Are you sure you want to delete this crop? This action cannot be undone.')) {
      return;
    }

    try {
      await cropService.delete(cropId);
      setCrops(prev => prev.filter(crop => crop.Id !== cropId));
      toast.success('Crop deleted successfully');
    } catch (error) {
      toast.error('Failed to delete crop');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCrop(null);
  };

  // Filter crops based on selected filters
  const filteredCrops = crops.filter(crop => {
    const farmMatch = !selectedFarm || crop.farmId === parseInt(selectedFarm, 10);
    const statusMatch = !statusFilter || crop.status === statusFilter;
    return farmMatch && statusMatch;
  });

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'planted', label: 'Planted' },
    { value: 'growing', label: 'Growing' },
    { value: 'mature', label: 'Mature' },
    { value: 'ready', label: 'Ready to Harvest' },
    { value: 'harvested', label: 'Harvested' }
  ];

  const farmOptions = [
    { value: '', label: 'All Farms' },
    ...farms.map(farm => ({
      value: farm.Id,
      label: farm.name
    }))
  ];

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
        <div className="flex gap-4 mb-6">
          <div className="h-12 bg-surface-200 rounded w-48 animate-pulse" />
          <div className="h-12 bg-surface-200 rounded w-48 animate-pulse" />
        </div>
        <SkeletonLoader count={6} type="card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Crops</h1>
          <p className="text-gray-600 mt-1">Track your planted crops and their growth progress</p>
        </div>
        
<Button
          onClick={() => setShowForm(true)}
          icon="Plus"
          className="shadow-sm"
        >
          Add Crop
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 max-w-xs">
          <Select
            placeholder="Filter by farm"
            value={selectedFarm}
            onChange={(e) => setSelectedFarm(e.target.value)}
            options={farmOptions}
          />
        </div>
        
        <div className="flex-1 max-w-xs">
          <Select
            placeholder="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
          />
        </div>

        {(selectedFarm || statusFilter) && (
          <Button
            variant="outline"
            onClick={() => {
              setSelectedFarm('');
              setStatusFilter('');
            }}
            icon="X"
            size="small"
          >
            Clear Filters
          </Button>
        )}
      </div>

{/* Crop Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleCancelForm}
        title={editingCrop ? 'Edit Crop' : 'Add New Crop'}
        size="medium"
      >
        <CropForm
          crop={editingCrop}
          onSave={handleSaveCrop}
          onCancel={handleCancelForm}
        />
      </Modal>

      {/* Crops Grid */}
      {filteredCrops.length === 0 ? (
        <EmptyState
          title={crops.length === 0 ? "No crops yet" : "No crops match your filters"}
          description={crops.length === 0 
            ? "Start tracking your crops to monitor their growth and harvest schedule."
            : "Try adjusting your filters to see more crops."
          }
          icon="Sprout"
          actionLabel={crops.length === 0 ? "Add Your First Crop" : "Clear Filters"}
          onAction={crops.length === 0 ? () => setShowForm(true) : () => {
            setSelectedFarm('');
            setStatusFilter('');
          }}
        />
      ) : (
        <motion.div
          variants={staggerChildren}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredCrops.map((crop, index) => (
            <motion.div
              key={crop.Id}
              variants={fadeInUp}
              transition={{ delay: index * 0.1 }}
            >
              <CropCard
                crop={crop}
                onEdit={handleEditCrop}
                onDelete={handleDeleteCrop}
                showFarm={!selectedFarm}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Summary Stats */}
      {crops.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 bg-white rounded-lg border border-surface-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Crop Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {statusOptions.slice(1).map(status => {
              const count = crops.filter(crop => crop.status === status.value).length;
              return (
                <div key={status.value} className="text-center">
                  <div className="text-2xl font-bold text-primary">{count}</div>
                  <div className="text-sm text-gray-600">{status.label}</div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Crops;