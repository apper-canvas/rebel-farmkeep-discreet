import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Modal from '@/components/atoms/Modal';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import IncomeForm from '@/components/organisms/IncomeForm';
import incomeService from '@/services/api/incomeService';
import farmService from '@/services/api/farmService';
import cropService from '@/services/api/cropService';

const Income = () => {
  const [income, setIncome] = useState([]);
  const [farms, setFarms] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [incomeData, farmData, cropData] = await Promise.all([
        incomeService.getAll(),
        farmService.getAll(),
        cropService.getAll()
      ]);
      
      setIncome(incomeData);
      setFarms(farmData);
      setCrops(cropData);
    } catch (err) {
      setError(err.message || 'Failed to load data');
      toast.error('Failed to load income data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveIncome = async (incomeData) => {
    try {
      let savedIncome;
      if (editingIncome) {
        savedIncome = await incomeService.update(editingIncome.Id, incomeData);
        setIncome(prev => prev.map(item => 
          item.Id === editingIncome.Id ? savedIncome : item
        ));
      } else {
        savedIncome = await incomeService.create(incomeData);
        setIncome(prev => [savedIncome, ...prev]);
      }
      
      setIsModalOpen(false);
      setEditingIncome(null);
    } catch (error) {
      throw error;
    }
  };

  const handleEditIncome = (incomeItem) => {
    setEditingIncome(incomeItem);
    setIsModalOpen(true);
  };

  const handleDeleteIncome = async (incomeId) => {
    if (!confirm('Are you sure you want to delete this income record?')) {
      return;
    }
    
    try {
      await incomeService.delete(incomeId);
      setIncome(prev => prev.filter(item => item.Id !== incomeId));
      toast.success('Income deleted successfully');
    } catch (error) {
      toast.error('Failed to delete income');
    }
  };

  const handleCancelForm = () => {
    setIsModalOpen(false);
    setEditingIncome(null);
  };

  const getFarmName = (farmId) => {
    const farm = farms.find(f => f.Id === farmId);
    return farm ? farm.name : 'Unknown Farm';
  };

  const getCropName = (cropId) => {
    const crop = crops.find(c => c.Id === cropId);
    return crop ? `${crop.name} (${crop.variety})` : null;
  };

  const filteredAndSortedIncome = income
    .filter(item => {
      const matchesSearch = item.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'date') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortBy === 'amount') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);

  const staggerChildren = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <SkeletonLoader type="text" className="h-8 w-32" />
          <SkeletonLoader type="text" className="h-10 w-24" />
        </div>
        <SkeletonLoader count={5} type="card" />
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

  return (
    <motion.div
      variants={staggerChildren}
      initial="initial"
      animate="animate"
      className="p-6 space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Income</h1>
          <p className="text-gray-600 mt-1">
            Track and manage your farm income • Total: ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <Button
          variant="primary"
          icon="Plus"
          onClick={() => setIsModalOpen(true)}
        >
          Add Income
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <ApperIcon name="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search income..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="all">All Categories</option>
          <option value="sales">Crop Sales</option>
          <option value="market">Farmers Market</option>
          <option value="contract">Contract Sales</option>
          <option value="direct">Direct Sales</option>
          <option value="wholesale">Wholesale</option>
          <option value="other">Other</option>
        </select>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="date">Sort by Date</option>
          <option value="amount">Sort by Amount</option>
          <option value="source">Sort by Source</option>
        </select>
        
        <Button
          variant="outline"
          icon={sortOrder === 'asc' ? 'ArrowUp' : 'ArrowDown'}
          onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        </Button>
      </motion.div>

      {/* Income List */}
      <motion.div variants={fadeInUp}>
        {filteredAndSortedIncome.length === 0 ? (
          <EmptyState
            title="No income records found"
            description={searchTerm || filterCategory !== 'all' ? 
              "No income matches your current filters. Try adjusting your search or filters." :
              "Start tracking your farm income to see records here."
            }
            icon="DollarSign"
            actionLabel="Add Income"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredAndSortedIncome.map((incomeItem, index) => (
                <motion.div
                  key={incomeItem.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card hover className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{incomeItem.source}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            incomeItem.category === 'sales' ? 'bg-green-100 text-green-800' :
                            incomeItem.category === 'market' ? 'bg-blue-100 text-blue-800' :
                            incomeItem.category === 'contract' ? 'bg-purple-100 text-purple-800' :
                            incomeItem.category === 'direct' ? 'bg-orange-100 text-orange-800' :
                            incomeItem.category === 'wholesale' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {incomeItem.category}
                          </span>
                        </div>
                        
                        {incomeItem.description && (
                          <p className="text-gray-600 mb-3">{incomeItem.description}</p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <ApperIcon name="Calendar" size={16} />
                            {format(new Date(incomeItem.date), 'MMM d, yyyy')}
                          </div>
                          
                          {incomeItem.farmId && (
                            <div className="flex items-center gap-1">
                              <ApperIcon name="Map" size={16} />
                              {getFarmName(incomeItem.farmId)}
                            </div>
                          )}
                          
                          {incomeItem.cropId && (
                            <div className="flex items-center gap-1">
                              <ApperIcon name="Sprout" size={16} />
                              {getCropName(incomeItem.cropId)}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className="text-2xl font-bold text-green-600 mb-2">
                          ${incomeItem.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="small"
                            icon="Edit"
                            onClick={() => handleEditIncome(incomeItem)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="small"
                            icon="Trash2"
                            onClick={() => handleDeleteIncome(incomeItem.Id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Income Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCancelForm}
        title={editingIncome ? 'Edit Income' : 'Add New Income'}
        size="large"
      >
        <IncomeForm
          income={editingIncome}
          onSave={handleSaveIncome}
          onCancel={handleCancelForm}
        />
      </Modal>
    </motion.div>
  );
};

export default Income;