import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="mb-8"
        >
          <ApperIcon name="Sprout" size={80} className="text-surface-400 mx-auto" />
        </motion.div>
        
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">
          Field Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          Looks like this page got lost in the fields. Let's get you back to your farm operations.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => navigate('/')}
            icon="Home"
          >
            Back to Dashboard
          </Button>
          <Button
            onClick={() => navigate('/farms')}
            variant="outline"
            icon="Map"
          >
            View Farms
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;