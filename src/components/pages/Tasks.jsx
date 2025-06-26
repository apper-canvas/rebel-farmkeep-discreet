import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format, isToday, isPast } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import TaskItem from '@/components/molecules/TaskItem';
import Modal from '@/components/atoms/Modal';
import TaskForm from '@/components/organisms/TaskForm';
import taskService from '@/services/api/taskService';
import farmService from '@/services/api/farmService';
import cropService from '@/services/api/cropService';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedFarm, setSelectedFarm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [viewMode, setViewMode] = useState('list'); // list or calendar

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [tasksData, farmsData, cropsData] = await Promise.all([
        taskService.getAll(),
        farmService.getAll(),
        cropService.getAll()
      ]);
      
      // Add farm and crop names to tasks
const tasksWithDetails = tasksData.map(task => {
        const farm = farmsData.find(f => f.Id === task.farm_id);
        const crop = task.crop_id ? cropsData.find(c => c.Id === task.crop_id) : null;
        return {
          ...task, 
          farmName: farm?.name || 'Unknown Farm',
          cropName: crop ? `${crop.name} - ${crop.variety}` : null
        };
      });
      
      setTasks(tasksWithDetails);
      setFarms(farmsData);
      setCrops(cropsData);
    } catch (err) {
      setError(err.message || 'Failed to load tasks');
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

const handleSaveTask = (savedTask) => {
    const farm = farms.find(f => f.Id === savedTask.farm_id);
    const crop = savedTask.crop_id ? crops.find(c => c.Id === savedTask.crop_id) : null;
    const taskWithDetails = {
      ...savedTask, 
      farmName: farm?.name || 'Unknown Farm',
      cropName: crop ? `${crop.name} - ${crop.variety}` : null
    };
    
    if (editingTask) {
      setTasks(prev => prev.map(task => 
        task.Id === savedTask.Id ? taskWithDetails : task
      ));
    } else {
      setTasks(prev => [...prev, taskWithDetails]);
    }
    
    setShowForm(false);
    setEditingTask(null);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await taskService.delete(taskId);
      setTasks(prev => prev.filter(task => task.Id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleToggleComplete = async (taskId) => {
    try {
      const updatedTask = await taskService.toggleComplete(taskId);
const farm = farms.find(f => f.Id === updatedTask.farm_id);
      const crop = updatedTask.crop_id ? crops.find(c => c.Id === updatedTask.crop_id) : null;
      const taskWithDetails = { 
        ...updatedTask,
        farmName: farm?.name || 'Unknown Farm',
        cropName: crop ? `${crop.name} - ${crop.variety}` : null
      };
      
      setTasks(prev => prev.map(task => 
        task.Id === taskId ? taskWithDetails : task
      ));
      
      toast.success(updatedTask.completed ? 'Task completed!' : 'Task reopened');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  // Filter tasks based on selected filters
const filteredTasks = tasks.filter(task => {
    const farmMatch = !selectedFarm || task.farm_id === parseInt(selectedFarm, 10);
    const priorityMatch = !priorityFilter || task.priority === priorityFilter;
    
    let statusMatch = true;
    if (statusFilter === 'completed') {
      statusMatch = task.completed;
    } else if (statusFilter === 'pending') {
      statusMatch = !task.completed;
} else if (statusFilter === 'overdue') {
      statusMatch = !task.completed && isPast(new Date(task.due_date));
    } else if (statusFilter === 'today') {
      statusMatch = isToday(new Date(task.due_date));
    }
    
    return farmMatch && priorityMatch && statusMatch;
  });

  // Sort tasks by due date
const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Put overdue and today's tasks first
    const dateA = new Date(a.due_date);
    const dateB = new Date(b.due_date);
    
    const isOverdueA = !a.completed && isPast(dateA);
    const isOverdueB = !b.completed && isPast(dateB);
    const isTodayA = isToday(dateA);
    const isTodayB = isToday(dateB);
    
    if (isOverdueA && !isOverdueB) return -1;
    if (!isOverdueA && isOverdueB) return 1;
    if (isTodayA && !isTodayB) return -1;
    if (!isTodayA && isTodayB) return 1;
    
    return dateA - dateB;
  });

  const farmOptions = [
    { value: '', label: 'All Farms' },
    ...farms.map(farm => ({
      value: farm.Id,
      label: farm.name
    }))
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending Tasks' },
    { value: 'completed', label: 'Completed Tasks' },
    { value: 'overdue', label: 'Overdue Tasks' },
    { value: 'today', label: "Today's Tasks" },
    { value: '', label: 'All Tasks' }
  ];

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.05
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
          <div className="h-12 bg-surface-200 rounded w-48 animate-pulse" />
        </div>
        <SkeletonLoader count={5} type="list" />
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

  const todayCount = tasks.filter(task => !task.completed && isToday(new Date(task.dueDate))).length;
  const overdueCount = tasks.filter(task => !task.completed && isPast(new Date(task.dueDate))).length;
  const completedCount = tasks.filter(task => task.completed).length;

  return (
    <div className="p-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">
            Manage your farm activities and stay on schedule
          </p>
        </div>
        
<Button
          onClick={() => setShowForm(true)}
          icon="Plus"
          className="shadow-sm"
        >
          Add Task
        </Button>
      </div>

      {/* Quick Stats */}
      {tasks.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <ApperIcon name="AlertCircle" size={20} className="text-red-600" />
              <div className="text-red-900 font-medium">Overdue</div>
            </div>
            <div className="text-2xl font-bold text-red-600 mt-1">{overdueCount}</div>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <ApperIcon name="Clock" size={20} className="text-orange-600" />
              <div className="text-orange-900 font-medium">Due Today</div>
            </div>
            <div className="text-2xl font-bold text-orange-600 mt-1">{todayCount}</div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <ApperIcon name="CheckCircle" size={20} className="text-green-600" />
              <div className="text-green-900 font-medium">Completed</div>
            </div>
            <div className="text-2xl font-bold text-green-600 mt-1">{completedCount}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center mb-6">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <Select
            placeholder="Filter by farm"
            value={selectedFarm}
            onChange={(e) => setSelectedFarm(e.target.value)}
            options={farmOptions}
            className="min-w-[200px]"
          />
          
          <Select
            placeholder="Filter by priority"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            options={priorityOptions}
            className="min-w-[200px]"
          />
          
          <Select
            placeholder="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
            className="min-w-[200px]"
          />
        </div>

        {(selectedFarm || priorityFilter || statusFilter !== 'pending') && (
          <Button
            variant="outline"
            onClick={() => {
              setSelectedFarm('');
              setPriorityFilter('');
              setStatusFilter('pending');
            }}
            icon="X"
            size="small"
          >
            Clear Filters
          </Button>
        )}
      </div>

{/* Task Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={handleCancelForm}
        title={editingTask ? 'Edit Task' : 'Add New Task'}
        size="medium"
      >
        <TaskForm
          task={editingTask}
          onSave={handleSaveTask}
          onCancel={handleCancelForm}
        />
      </Modal>

      {/* Tasks List */}
      {sortedTasks.length === 0 ? (
        <EmptyState
          title={tasks.length === 0 ? "No tasks yet" : "No tasks match your filters"}
          description={tasks.length === 0 
            ? "Create your first task to start organizing your farm activities."
            : "Try adjusting your filters to see more tasks."
          }
          icon="CheckSquare"
          actionLabel={tasks.length === 0 ? "Add Your First Task" : "Clear Filters"}
          onAction={tasks.length === 0 ? () => setShowForm(true) : () => {
            setSelectedFarm('');
            setPriorityFilter('');
            setStatusFilter('pending');
          }}
        />
      ) : (
        <motion.div
          variants={staggerChildren}
          initial="initial"
          animate="animate"
          className="space-y-4"
        >
          {sortedTasks.map((task, index) => (
            <motion.div
              key={task.Id}
              variants={fadeInUp}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              <TaskItem
                task={task}
                onToggleComplete={handleToggleComplete}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                showFarm={!selectedFarm}
                showCrop={true}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default Tasks;