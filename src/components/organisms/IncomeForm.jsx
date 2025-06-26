import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import FormField from '@/components/molecules/FormField';
import Button from '@/components/atoms/Button';
import farmService from '@/services/api/farmService';
import cropService from '@/services/api/cropService';

const IncomeForm = ({ income, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    source: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'sales',
    farmId: '',
    cropId: ''
  });
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (income) {
      setFormData({
        source: income.source || '',
        description: income.description || '',
        amount: income.amount?.toString() || '',
        date: income.date || new Date().toISOString().split('T')[0],
        category: income.category || 'sales',
        farmId: income.farmId?.toString() || '',
        cropId: income.cropId?.toString() || ''
      });
      setIsEditing(true);
    }
    loadFarms();
    loadCrops();
  }, [income]);

  const loadFarms = async () => {
    try {
      const farmData = await farmService.getAll();
      setFarms(farmData);
    } catch (error) {
      toast.error('Failed to load farms');
    }
  };

  const loadCrops = async () => {
    try {
      const cropData = await cropService.getAll();
      setCrops(cropData);
    } catch (error) {
      toast.error('Failed to load crops');
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.source.trim()) {
      toast.error('Income source is required');
      return;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Valid amount is required');
      return;
    }

    setLoading(true);
    
    try {
      const incomeData = {
        ...formData,
        amount: parseFloat(formData.amount),
        farmId: formData.farmId ? parseInt(formData.farmId) : null,
        cropId: formData.cropId ? parseInt(formData.cropId) : null
      };
      
      await onSave(incomeData);
      toast.success(isEditing ? 'Income updated successfully' : 'Income added successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to save income');
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = [
    { value: 'sales', label: 'Crop Sales' },
    { value: 'market', label: 'Farmers Market' },
    { value: 'contract', label: 'Contract Sales' },
    { value: 'direct', label: 'Direct Sales' },
    { value: 'wholesale', label: 'Wholesale' },
    { value: 'other', label: 'Other' }
  ];

  const farmOptions = farms.map(farm => ({
    value: farm.Id.toString(),
    label: farm.name
  }));

  const cropOptions = [
    { value: '', label: 'No specific crop' },
    ...crops.map(crop => ({
      value: crop.Id.toString(),
      label: `${crop.name} (${crop.variety})`
    }))
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Income Source"
          type="text"
          value={formData.source}
          onChange={(value) => handleChange('source', value)}
          placeholder="e.g., Crop Sales, Farmers Market"
          required
        />
        
        <FormField
          label="Amount"
          type="number"
          value={formData.amount}
          onChange={(value) => handleChange('amount', value)}
          placeholder="0.00"
          step="0.01"
          min="0"
          required
        />
      </div>

      <FormField
        label="Description"
        type="textarea"
        value={formData.description}
        onChange={(value) => handleChange('description', value)}
        placeholder="Describe the income source or transaction details..."
        rows={3}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FormField
          label="Date"
          type="date"
          value={formData.date}
          onChange={(value) => handleChange('date', value)}
          required
        />
        
        <FormField
          label="Category"
          type="select"
          value={formData.category}
          onChange={(value) => handleChange('category', value)}
          options={categoryOptions}
          required
        />
        
        <FormField
          label="Farm"
          type="select"
          value={formData.farmId}
          onChange={(value) => handleChange('farmId', value)}
          options={[{ value: '', label: 'Select Farm' }, ...farmOptions]}
        />
      </div>

      <FormField
        label="Related Crop (Optional)"
        type="select"
        value={formData.cropId}
        onChange={(value) => handleChange('cropId', value)}
        options={cropOptions}
      />

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={loading}
        >
          {isEditing ? 'Update Income' : 'Add Income'}
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
  );
};

export default IncomeForm;