import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import farmService from "@/services/api/farmService";
import cropService from "@/services/api/cropService";
import FormField from "@/components/molecules/FormField";
import Button from "@/components/atoms/Button";

const IncomeForm = ({ income, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    amount: '',
    source: '',
    category: 'sales',
    description: '',
    date: new Date().toISOString().split('T')[0],
    farmId: '',
    cropId: ''
  });
  
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadFarms();
    loadCrops();
  }, []);

  useEffect(() => {
    if (income) {
      setFormData({
        amount: income.amount?.toString() || '',
        source: income.source || '',
        category: income.category || 'sales',
        description: income.description || '',
date: income.date ? income.date.split('T')[0] : new Date().toISOString().split('T')[0],
        farmId: income.farm_id || '',
        cropId: income.crop_id || ''
      });
    }
  }, [income]);

  const loadFarms = async () => {
    try {
      const farmData = await farmService.getAll();
      setFarms(farmData);
    } catch (error) {
      console.error('Error loading farms:', error);
    }
  };

  const loadCrops = async () => {
    try {
      const cropData = await cropService.getAll();
      setCrops(cropData);
    } catch (error) {
      console.error('Error loading crops:', error);
    }
  };

const handleChange = (field, value) => {
    // Extract value from event object if necessary
    const actualValue = value && typeof value === 'object' && value.target 
      ? value.target.value 
      : value;
    
    setFormData(prev => ({
      ...prev,
      [field]: actualValue
    }));
    
    // Clear error for this field if it exists
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }
    
    if (!formData.source?.trim()) {
      newErrors.source = 'Please enter an income source';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    
    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors before submitting');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const incomeData = {
        amount: parseFloat(formData.amount),
        source: formData.source.trim(),
        category: formData.category,
        description: formData.description?.trim() || '',
        date: formData.date,
        farmId: formData.farmId || null,
        cropId: formData.cropId || null
      };
      
      await onSave(incomeData);
      toast.success(income ? 'Income updated successfully' : 'Income added successfully');
      
      // Reset form if adding new income
      if (!income) {
        setFormData({
          amount: '',
          source: '',
          category: 'sales',
          description: '',
          date: new Date().toISOString().split('T')[0],
          farmId: '',
          cropId: ''
        });
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save income');
    } finally {
      setSubmitting(false);
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
    value: farm.Id,
    label: farm.name
  }));

  const cropOptions = [
    { value: '', label: 'No specific crop' },
    ...crops.map(crop => ({
      value: crop.Id,
      label: `${crop.name} (${crop.variety})`
    }))
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Amount"
          type="number"
          step="0.01"
          placeholder="Enter amount"
          value={formData.amount}
          onChange={(value) => handleChange('amount', value)}
          error={errors.amount}
          required
        />
        
        <FormField
          label="Source"
          type="text"
          placeholder="e.g., Tomato harvest, Market sale"
          value={formData.source}
          onChange={(value) => handleChange('source', value)}
          error={errors.source}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Category"
          type="select"
          options={categoryOptions}
          value={formData.category}
          onChange={(value) => handleChange('category', value)}
          error={errors.category}
          required
        />
        
        <FormField
          label="Date"
          type="date"
          value={formData.date}
          onChange={(value) => handleChange('date', value)}
          error={errors.date}
          required
        />
      </div>

      <FormField
        label="Description"
        type="textarea"
        placeholder="Additional details about this income..."
        value={formData.description}
        onChange={(value) => handleChange('description', value)}
        rows={3}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Farm (Optional)"
          type="select"
          options={[{ value: '', label: 'Select a farm' }, ...farmOptions]}
          value={formData.farmId}
          onChange={(value) => handleChange('farmId', value)}
        />
        
        <FormField
          label="Crop (Optional)"
          type="select"
          options={cropOptions}
          value={formData.cropId}
          onChange={(value) => handleChange('cropId', value)}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-surface-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={submitting}
          disabled={submitting}
        >
          {income ? 'Update Income' : 'Add Income'}
        </Button>
      </div>
    </form>
  );
};

export default IncomeForm;