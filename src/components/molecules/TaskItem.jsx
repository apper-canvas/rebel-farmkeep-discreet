import { motion } from 'framer-motion';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const TaskItem = ({ 
  task, 
  onToggleComplete, 
  onEdit, 
  onDelete,
  showFarm = false,
  showCrop = false 
}) => {
  const priorityColors = {
    low: 'bg-blue-100 text-blue-800 border-blue-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-red-100 text-red-800 border-red-200'
  };

  const priorityIcons = {
    low: 'ArrowDown',
    medium: 'Minus',
    high: 'ArrowUp'
  };

const isOverdue = new Date(task.due_date) < new Date() && !task.completed;
  const dueDate = new Date(task.due_date);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg border p-4 hover:shadow-md transition-all ${
        task.completed ? 'opacity-75' : ''
      } ${isOverdue ? 'border-red-200 bg-red-50' : 'border-surface-200'}`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggleComplete(task.Id)}
          className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-all mt-0.5 ${
            task.completed
              ? 'bg-primary border-primary text-white'
              : 'border-surface-300 hover:border-primary'
          }`}
        >
          {task.completed && (
            <ApperIcon name="Check" size={14} className="w-full h-full" />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title}
            </h3>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Priority Badge */}
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${priorityColors[task.priority]}`}>
                <ApperIcon name={priorityIcons[task.priority]} size={12} />
                {task.priority}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="small"
                  icon="Edit2"
                  onClick={() => onEdit(task)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
                <Button
                  variant="ghost"
                  size="small"
                  icon="Trash2"
                  onClick={() => onDelete(task.Id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700"
                />
              </div>
            </div>
          </div>

          {task.description && (
            <p className={`text-sm mb-2 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <ApperIcon name="Calendar" size={14} />
              <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                {format(dueDate, 'MMM d, yyyy')} at {format(dueDate, 'h:mm a')}
              </span>
              {isOverdue && (
                <span className="text-red-600 font-medium">(Overdue)</span>
              )}
            </div>

            {showFarm && task.farmName && (
              <div className="flex items-center gap-1">
                <ApperIcon name="Map" size={14} />
                <span>{task.farmName}</span>
              </div>
            )}

            {showCrop && task.cropName && (
              <div className="flex items-center gap-1">
                <ApperIcon name="Sprout" size={14} />
                <span>{task.cropName}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskItem;