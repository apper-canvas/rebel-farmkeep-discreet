import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import FormField from '@/components/molecules/FormField';
import expenseService from '@/services/api/expenseService';
import farmService from '@/services/api/farmService';

const ExpenseForm = ({ expense = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
farmId: expense?.farm_id || '',
    amount: expense?.amount || '',
    category: expense?.category || '',
    description: expense?.description || '',
    date: expense?.date ? format(new Date(expense.date), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
  });
  const [farms, setFarms] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const categoryOptions = [
    { value: 'seeds', label: 'Seeds & Plants' },
    { value: 'fertilizer', label: 'Fertilizer & Nutrients' },
    { value: 'equipment', label: 'Equipment & Tools' },
    { value: 'labor', label: 'Labor & Services' },
    { value: 'fuel', label: 'Fuel & Energy' },
    { value: 'supplies', label: 'Supplies & Materials' },
    { value: 'maintenance', label: 'Maintenance & Repairs' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'other', label: 'Other Expenses' }
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
    
    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
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
      const expenseData = {
        ...formData,
        farmId: parseInt(formData.farmId, 10),
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString()
      };

      let savedExpense;
      if (expense) {
        savedExpense = await expenseService.update(expense.Id, expenseData);
        toast.success('Expense updated successfully');
      } else {
        savedExpense = await expenseService.create(expenseData);
        toast.success('Expense recorded successfully');
      }
      
      onSave(savedExpense);
    } catch (error) {
      toast.error(error.message || 'Failed to save expense');
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
          {expense ? 'Edit Expense' : 'Record New Expense'}
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
            label="Amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            error={errors.amount}
            placeholder="0.00"
            required
            min="0"
            step="0.01"
            icon="DollarSign"
          />

          <FormField
            type="select"
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            error={errors.category}
            options={categoryOptions}
            placeholder="Select category"
            required
          />
        </div>

        <FormField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          error={errors.description}
          placeholder="What was this expense for?"
          required
        />

        <FormField
          label="Date"
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          error={errors.date}
          required
        />

        <div className="flex items-center gap-3 pt-4">
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
            className="flex-1 sm:flex-none"
          >
            {loading ? 'Saving...' : expense ? 'Update Expense' : 'Record Expense'}
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

export default ExpenseForm;