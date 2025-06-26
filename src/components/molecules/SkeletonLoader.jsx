import { motion } from 'framer-motion';

const SkeletonLoader = ({ count = 3, type = 'card', className = '' }) => {
  const skeletonVariants = {
    pulse: {
      opacity: [0.6, 1, 0.6],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  const renderCardSkeleton = (index) => (
    <motion.div
      key={index}
      variants={skeletonVariants}
      animate="pulse"
      className="bg-white rounded-lg border border-surface-200 p-6 space-y-4"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-surface-200 rounded w-3/4" />
          <div className="h-3 bg-surface-200 rounded w-1/2" />
        </div>
        <div className="w-10 h-10 bg-surface-200 rounded-lg" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-surface-200 rounded w-full" />
        <div className="h-3 bg-surface-200 rounded w-2/3" />
      </div>
    </motion.div>
  );

  const renderListSkeleton = (index) => (
    <motion.div
      key={index}
      variants={skeletonVariants}
      animate="pulse"
      className="bg-white rounded-lg border border-surface-200 p-4 space-y-3"
    >
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 bg-surface-200 rounded" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-surface-200 rounded w-3/4" />
          <div className="h-3 bg-surface-200 rounded w-1/2" />
        </div>
      </div>
    </motion.div>
  );

  const renderTableSkeleton = (index) => (
    <motion.tr
      key={index}
      variants={skeletonVariants}
      animate="pulse"
      className="border-b border-surface-200"
    >
      <td className="px-6 py-4">
        <div className="h-4 bg-surface-200 rounded w-24" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-surface-200 rounded w-32" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-surface-200 rounded w-20" />
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-surface-200 rounded w-16" />
      </td>
    </motion.tr>
  );

  const skeletonTypes = {
    card: renderCardSkeleton,
    list: renderListSkeleton,
    table: renderTableSkeleton
  };

  const renderSkeleton = skeletonTypes[type] || renderCardSkeleton;

  if (type === 'table') {
    return (
      <div className={`overflow-hidden ${className}`}>
        <table className="min-w-full divide-y divide-surface-200">
          <tbody className="bg-white divide-y divide-surface-200">
            {[...Array(count)].map((_, index) => renderSkeleton(index))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {[...Array(count)].map((_, index) => renderSkeleton(index))}
    </div>
  );
};

export default SkeletonLoader;