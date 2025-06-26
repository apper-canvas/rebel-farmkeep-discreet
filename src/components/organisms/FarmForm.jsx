import { useState } from 'react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import FormField from '@/components/molecules/FormField';
import farmService from '@/services/api/farmService';

const FarmForm = ({ farm = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: farm?.name || '',
    location: farm?.location || '',
    size: farm?.size || '',
    sizeUnit: farm?.sizeUnit || 'acres'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const sizeUnitOptions = [
    { value: 'acres', label: 'Acres' },
    { value: 'hectares', label: 'Hectares' },
    { value: 'sq-ft', label: 'Square Feet' },
    { value: 'sq-m', label: 'Square Meters' }
  ];

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
    
    if (!formData.name.trim()) {
      newErrors.name = 'Farm name is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.size || formData.size <= 0) {
      newErrors.size = 'Size must be greater than 0';
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
      const farmData = {
        ...formData,
        size: parseFloat(formData.size)
      };

      let savedFarm;
      if (farm) {
        savedFarm = await farmService.update(farm.Id, farmData);
        toast.success('Farm updated successfully');
      } else {
        savedFarm = await farmService.create(farmData);
        toast.success('Farm created successfully');
      }
      
      onSave(savedFarm);
    } catch (error) {
      toast.error(error.message || 'Failed to save farm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-surface-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {farm ? 'Edit Farm' : 'Add New Farm'}
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
          label="Farm Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Enter farm name"
          required
          icon="Map"
        />

        <FormField
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          error={errors.location}
          placeholder="Enter farm location"
          required
          icon="MapPin"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Size"
            name="size"
            type="number"
            value={formData.size}
            onChange={handleChange}
            error={errors.size}
            placeholder="Enter size"
            required
            min="0"
            step="0.1"
          />

          <FormField
            type="select"
            label="Unit"
            name="sizeUnit"
            value={formData.sizeUnit}
            onChange={handleChange}
            options={sizeUnitOptions}
            required
          />
        </div>

        <div className="flex items-center gap-3 pt-4">
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            {loading ? 'Saving...' : farm ? 'Update Farm' : 'Create Farm'}
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

export default FarmForm;