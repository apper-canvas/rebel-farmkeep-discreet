import { motion } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const EmptyState = ({ 
  title, 
  description, 
  icon = 'Package',
  actionLabel = 'Get Started',
  onAction,
  className = ''
}) => {
  const emptyStateVariants = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 }
  };

  const iconVariants = {
    animate: { 
      y: [0, -10, 0],
      transition: { 
        repeat: Infinity, 
        duration: 3,
        ease: 'easeInOut'
      }
    }
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  };

  return (
    <motion.div
      variants={emptyStateVariants}
      initial="initial"
      animate="animate"
      className={`text-center py-12 ${className}`}
    >
      <motion.div
        variants={iconVariants}
        animate="animate"
        className="mb-4"
      >
        <div className="w-16 h-16 mx-auto text-surface-400">
          <ApperIcon name={icon} size={64} />
        </div>
      </motion.div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      
      {onAction && (
        <motion.div
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <Button onClick={onAction} icon="Plus">
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EmptyState;