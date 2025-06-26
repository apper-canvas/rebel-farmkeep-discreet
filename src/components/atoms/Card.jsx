import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  variant = 'default',
  hover = false,
  className = '',
  ...props 
}) => {
  const variants = {
    default: 'bg-white border border-surface-200 shadow-sm',
    elevated: 'bg-white border border-surface-200 shadow-md',
    outlined: 'bg-white border-2 border-surface-300',
    filled: 'bg-surface-100 border border-surface-200'
  };

  const hoverProps = hover ? {
    whileHover: { scale: 1.02, y: -2 },
    transition: { duration: 0.2 }
  } : {};

  return (
    <motion.div
      className={`rounded-lg p-6 transition-all ${variants[variant]} ${className}`}
      {...hoverProps}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;