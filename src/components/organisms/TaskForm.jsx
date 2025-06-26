import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import FormField from '@/components/molecules/FormField';
import taskService from '@/services/api/taskService';
import farmService from '@/services/api/farmService';
import cropService from '@/services/api/cropService';

const TaskForm = ({ task = null, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
farmId: task?.farm_id || '',
    cropId: task?.crop_id || '',
    title: task?.title || '',
    description: task?.description || '',
    dueDate: task?.due_date ? format(new Date(task.due_date), "yyyy-MM-dd'T'HH:mm") : '',
    priority: task?.priority || 'medium'
  });
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' }
  ];

  useEffect(() => {
    loadFarms();
  }, []);

  useEffect(() => {
    if (formData.farmId) {
      loadCrops(formData.farmId);
    } else {
      setCrops([]);
      setFormData(prev => ({ ...prev, cropId: '' }));
    }
  }, [formData.farmId]);

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

  const loadCrops = async (farmId) => {
    try {
      const data = await cropService.getByFarmId(farmId);
      setCrops(data);
    } catch (error) {
      console.error('Failed to load crops:', error);
      setCrops([]);
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
    
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
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
      const taskData = {
        ...formData,
        farmId: parseInt(formData.farmId, 10),
        cropId: formData.cropId ? parseInt(formData.cropId, 10) : null,
        dueDate: new Date(formData.dueDate).toISOString()
      };

      let savedTask;
      if (task) {
        savedTask = await taskService.update(task.Id, taskData);
        toast.success('Task updated successfully');
      } else {
        savedTask = await taskService.create(taskData);
        toast.success('Task created successfully');
      }
      
      onSave(savedTask);
    } catch (error) {
      toast.error(error.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const farmOptions = farms.map(farm => ({
    value: farm.Id,
    label: `${farm.name} (${farm.location})`
  }));

  const cropOptions = [
    { value: '', label: 'No specific crop (General task)' },
    ...crops.map(crop => ({
      value: crop.Id,
      label: `${crop.name} - ${crop.variety} (${crop.fieldLocation})`
    }))
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg border border-surface-200 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {task ? 'Edit Task' : 'Add New Task'}
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

        <FormField
          type="select"
          label="Related Crop (Optional)"
          name="cropId"
          value={formData.cropId}
          onChange={handleChange}
          options={cropOptions}
          placeholder="Select a crop or leave blank for general tasks"
        />

        <FormField
          label="Task Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.title}
          placeholder="e.g., Water tomato plants, Apply fertilizer"
          required
          icon="CheckSquare"
        />

        <FormField
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Additional details about the task (optional)"
          type="textarea"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Due Date & Time"
            name="dueDate"
            type="datetime-local"
            value={formData.dueDate}
            onChange={handleChange}
            error={errors.dueDate}
            required
          />

          <FormField
            type="select"
            label="Priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            options={priorityOptions}
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
            {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
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

export default TaskForm;