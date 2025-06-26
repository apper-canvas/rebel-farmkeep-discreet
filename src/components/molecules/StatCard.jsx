import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';

const StatCard = ({ 
  title, 
  value, 
  icon, 
  color = 'primary',
  trend = null,
  subtitle = null,
  className = ''
}) => {
  const colorClasses = {
    primary: 'text-primary bg-primary/10',
    secondary: 'text-secondary bg-secondary/10',
    accent: 'text-accent bg-accent/10',
    success: 'text-green-600 bg-green-100',
    warning: 'text-yellow-600 bg-yellow-100',
    danger: 'text-red-600 bg-red-100'
  };

  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-500'
  };

  return (
    <Card hover className={className}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center gap-1 text-sm mt-2 ${trendColors[trend.direction]}`}>
              <ApperIcon 
                name={trend.direction === 'up' ? 'TrendingUp' : trend.direction === 'down' ? 'TrendingDown' : 'Minus'} 
                size={14} 
              />
              <span>{trend.value}</span>
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <ApperIcon name={icon} size={24} />
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatCard;