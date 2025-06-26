import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import FormField from '@/components/molecules/FormField';
import cropService from '@/services/api/cropService';
import farmService from '@/services/api/farmService';

const CropForm = ({ crop = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    farmId: crop?.farmId || '',
    name: crop?.name || '',
    variety: crop?.variety || '',
fieldLocation: crop?.field_location || '',
    plantingDate: crop?.planting_date ? format(new Date(crop.planting_date), 'yyyy-MM-dd') : '',
    expectedHarvestDate: crop?.expected_harvest_date ? format(new Date(crop.expected_harvest_date), 'yyyy-MM-dd') : '',
    status: crop?.status || 'planted'
  });
  const [farms, setFarms] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const statusOptions = [
    { value: 'planted', label: 'Planted' },
    { value: 'growing', label: 'Growing' },
    { value: 'mature', label: 'Mature' },
    { value: 'ready', label: 'Ready to Harvest' },
    { value: 'harvested', label: 'Harvested' }
  ];

  useEffect(() => {
    loadFarms();
  }, []);

  const loadFarms = async () => {
    try {
      const data = await farmService.getAll();
      setFarms(data);
      if (data.length > 0 && !formData.farmId) {
        setFormData(prev => ({ ...prev, farmId: data[0].Id }));
      }
    } catch (error) {
      toast.error('Failed to load farms');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.farmId) {
      newErrors.farmId = 'Farm is required';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Crop name is required';
    }
    
    if (!formData.variety.trim()) {
      newErrors.variety = 'Variety is required';
    }
    
    if (!formData.fieldLocation.trim()) {
      newErrors.fieldLocation = 'Field location is required';
    }
    
    if (!formData.plantingDate) {
      newErrors.plantingDate = 'Planting date is required';
    }
    
    if (!formData.expectedHarvestDate) {
      newErrors.expectedHarvestDate = 'Expected harvest date is required';
    }
    
    if (formData.plantingDate && formData.expectedHarvestDate) {
      const plantingDate = new Date(formData.plantingDate);
      const harvestDate = new Date(formData.expectedHarvestDate);
      
      if (harvestDate <= plantingDate) {
        newErrors.expectedHarvestDate = 'Harvest date must be after planting date';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const cropData = {
        ...formData,
        farmId: parseInt(formData.farmId, 10),
        plantingDate: new Date(formData.plantingDate).toISOString(),
        expectedHarvestDate: new Date(formData.expectedHarvestDate).toISOString()
      };

      let savedCrop;
      if (crop) {
        savedCrop = await cropService.update(crop.Id, cropData);
        toast.success('Crop updated successfully');
      } else {
        savedCrop = await cropService.create(cropData);
        toast.success('Crop created successfully');
      }
      
      onSave(savedCrop);
    } catch (error) {
      toast.error(error.message || 'Failed to save crop');
    } finally {
      setLoading(false);
    }
  };

  const farmOptions = farms.map(farm => ({
    value: farm.Id,
    label: `${farm.name} (${farm.location})`
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-surface-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {crop ? 'Edit Crop' : 'Add New Crop'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
        >
          <ApperIcon name="X" size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          type="select"
          label="Farm"
          name="farmId"
          value={formData.farmId}
          onChange={handleChange}
          error={errors.farmId}
          options={farmOptions}
          placeholder="Select a farm"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Crop Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="e.g., Tomatoes, Corn, Apples"
            required
            icon="Sprout"
          />

          <FormField
            label="Variety"
            name="variety"
            value={formData.variety}
            onChange={handleChange}
            error={errors.variety}
            placeholder="e.g., Roma, Sweet Corn, Gala"
            required
          />
        </div>

        <FormField
          label="Field Location"
          name="fieldLocation"
          value={formData.fieldLocation}
          onChange={handleChange}
          error={errors.fieldLocation}
          placeholder="e.g., North Field A, Greenhouse 1"
          required
          icon="MapPin"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Planting Date"
            name="plantingDate"
            type="date"
            value={formData.plantingDate}
            onChange={handleChange}
            error={errors.plantingDate}
            required
          />

          <FormField
            label="Expected Harvest Date"
            name="expectedHarvestDate"
            type="date"
            value={formData.expectedHarvestDate}
            onChange={handleChange}
            error={errors.expectedHarvestDate}
            required
          />
        </div>

        <FormField
          type="select"
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          options={statusOptions}
          required
        />

        <div className="flex items-center gap-3 pt-4">
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            {loading ? 'Saving...' : crop ? 'Update Crop' : 'Create Crop'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default CropForm;