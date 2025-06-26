import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import Card from '@/components/atoms/Card';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import Modal from '@/components/atoms/Modal';
import ExpenseForm from '@/components/organisms/ExpenseForm';
import expenseService from '@/services/api/expenseService';
import farmService from '@/services/api/farmService';
import Chart from 'react-apexcharts';
const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
const [selectedFarm, setSelectedFarm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categoryTotals, setCategoryTotals] = useState({});
  const [activeTab, setActiveTab] = useState('table');
  const [chartPeriod, setChartPeriod] = useState('monthly');
  const [trendData, setTrendData] = useState([]);
  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    calculateCategoryTotals();
  }, [expenses, selectedFarm]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [expensesData, farmsData] = await Promise.all([
        expenseService.getAll(),
        farmService.getAll()
      ]);
      
      // Add farm names to expenses
      const expensesWithFarms = expensesData.map(expense => {
        const farm = farmsData.find(f => f.Id === expense.farmId);
        return { ...expense, farmName: farm?.name || 'Unknown Farm' };
      });
      
      setExpenses(expensesWithFarms);
      setFarms(farmsData);
    } catch (err) {
      setError(err.message || 'Failed to load expenses');
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const calculateCategoryTotals = () => {
    const filteredExpenses = selectedFarm 
      ? expenses.filter(expense => expense.farmId === parseInt(selectedFarm, 10))
      : expenses;
    
    const totals = filteredExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});
    
    setCategoryTotals(totals);
  };

  const handleSaveExpense = (savedExpense) => {
    const farm = farms.find(f => f.Id === savedExpense.farmId);
    const expenseWithFarm = { ...savedExpense, farmName: farm?.name || 'Unknown Farm' };
    
    if (editingExpense) {
      setExpenses(prev => prev.map(expense => 
        expense.Id === savedExpense.Id ? expenseWithFarm : expense
      ));
    } else {
      setExpenses(prev => [...prev, expenseWithFarm]);
    }
    
    setShowForm(false);
    setEditingExpense(null);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!confirm('Are you sure you want to delete this expense record?')) {
      return;
    }

    try {
      await expenseService.delete(expenseId);
      setExpenses(prev => prev.filter(expense => expense.Id !== expenseId));
      toast.success('Expense deleted successfully');
    } catch (error) {
      toast.error('Failed to delete expense');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  // Filter expenses based on selected filters
  const filteredExpenses = expenses.filter(expense => {
    const farmMatch = !selectedFarm || expense.farmId === parseInt(selectedFarm, 10);
    const categoryMatch = !categoryFilter || expense.category === categoryFilter;
    return farmMatch && categoryMatch;
  });

  // Sort expenses by date (most recent first)
  const sortedExpenses = [...filteredExpenses].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  const farmOptions = [
    { value: '', label: 'All Farms' },
    ...farms.map(farm => ({
      value: farm.Id,
      label: farm.name
    }))
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
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

  const getCategoryIcon = (category) => {
    const icons = {
      seeds: 'Sprout',
      fertilizer: 'Droplets',
      equipment: 'Wrench',
      labor: 'Users',
      fuel: 'Fuel',
      supplies: 'Package',
      maintenance: 'Settings',
      insurance: 'Shield',
      utilities: 'Zap',
      other: 'MoreHorizontal'
    };
    return icons[category] || 'DollarSign';
  };

  const getCategoryColor = (category) => {
    const colors = {
      seeds: 'text-green-600 bg-green-100',
      fertilizer: 'text-blue-600 bg-blue-100',
      equipment: 'text-purple-600 bg-purple-100',
      labor: 'text-orange-600 bg-orange-100',
      fuel: 'text-red-600 bg-red-100',
      supplies: 'text-yellow-600 bg-yellow-100',
      maintenance: 'text-gray-600 bg-gray-100',
      insurance: 'text-indigo-600 bg-indigo-100',
      utilities: 'text-cyan-600 bg-cyan-100',
      other: 'text-pink-600 bg-pink-100'
    };
    return colors[category] || 'text-gray-600 bg-gray-100';
  };

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-3">
            <SkeletonLoader count={5} type="table" />
          </div>
          <div>
            <SkeletonLoader count={3} type="card" />
          </div>
        </div>
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
    <div className="p-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-heading font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-600 mt-1">Track and manage your farm-related expenses</p>
        </div>
        
<Button
          onClick={() => setShowForm(true)}
          icon="Plus"
          className="shadow-sm"
        >
          Record Expense
        </Button>
      </div>

      {/* Summary Card */}
      {expenses.length > 0 && (
        <Card className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Total Expenses</h3>
              <p className="text-sm text-gray-600">
                {selectedFarm ? farms.find(f => f.Id === parseInt(selectedFarm, 10))?.name : 'All farms'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary">${totalExpenses.toFixed(2)}</p>
              <p className="text-sm text-gray-600">{filteredExpenses.length} transactions</p>
            </div>
          </div>
        </Card>
      )}
{/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-surface-100 p-1 rounded-lg max-w-md">
        <button
          onClick={() => setActiveTab('table')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'table'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <ApperIcon name="Table" size={16} />
            Expenses
          </div>
        </button>
        <button
          onClick={() => setActiveTab('charts')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'charts'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <ApperIcon name="BarChart3" size={16} />
            Charts
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'table' && (
            <>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Select
                  placeholder="Filter by farm"
                  value={selectedFarm}
                  onChange={(e) => setSelectedFarm(e.target.value)}
                  options={farmOptions}
                  className="flex-1"
                />
                
                <Select
                  placeholder="Filter by category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  options={categoryOptions}
                  className="flex-1"
                />

                {(selectedFarm || categoryFilter) && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedFarm('');
                      setCategoryFilter('');
                    }}
                    icon="X"
                    size="small"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </>
          )}

          {activeTab === 'charts' && (
            <ExpenseCharts 
              expenses={expenses}
              farms={farms}
              selectedFarm={selectedFarm}
              onFarmChange={setSelectedFarm}
              chartPeriod={chartPeriod}
              onPeriodChange={setChartPeriod}
              categoryOptions={categoryOptions}
              getCategoryColor={getCategoryColor}
              getCategoryIcon={getCategoryIcon}
            />
          )}

{/* Expense Form Modal */}
{/* Expense Form Modal */}
          <Modal
            isOpen={showForm}
            onClose={handleCancelForm}
            title={editingExpense ? 'Edit Expense' : 'Record New Expense'}
            size="medium"
          >
            <ExpenseForm
              expense={editingExpense}
              onSave={handleSaveExpense}
              onCancel={handleCancelForm}
            />
          </Modal>
{activeTab === 'table' && (
            <>
              {/* Expenses Table */}
              {sortedExpenses.length === 0 ? (
                <EmptyState
                  title={expenses.length === 0 ? "No expenses recorded" : "No expenses match your filters"}
                  description={expenses.length === 0 
                    ? "Start tracking your farm expenses to monitor your spending."
                    : "Try adjusting your filters to see more expenses."
                  }
                  icon="DollarSign"
                  actionLabel={expenses.length === 0 ? "Record Your First Expense" : "Clear Filters"}
                  onAction={expenses.length === 0 ? () => setShowForm(true) : () => {
                    setSelectedFarm('');
                    setCategoryFilter('');
                  }}
                />
              ) : (
                <Card className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-surface-200">
                      <thead className="bg-surface-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          {!selectedFarm && (
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Farm
                            </th>
                          )}
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-surface-200">
                        <AnimatePresence>
                          {sortedExpenses.map((expense, index) => (
                            <motion.tr
                              key={expense.Id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ delay: index * 0.02 }}
                              className="hover:bg-surface-50 group"
                            >
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {format(new Date(expense.date), 'MMM d, yyyy')}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                <div className="max-w-xs truncate">{expense.description}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                                  <ApperIcon name={getCategoryIcon(expense.category)} size={12} />
                                  {categoryOptions.find(opt => opt.value === expense.category)?.label || expense.category}
                                </span>
                              </td>
                              {!selectedFarm && (
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                  {expense.farmName}
                                </td>
                              )}
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                                ${expense.amount.toFixed(2)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="small"
                                    icon="Edit2"
                                    onClick={() => handleEditExpense(expense)}
                                  />
                                  <Button
                                    variant="ghost"
                                    size="small"
                                    icon="Trash2"
                                    onClick={() => handleDeleteExpense(expense.Id)}
                                    className="text-red-600 hover:text-red-700"
                                  />
                                </div>
                              </td>
                            </motion.tr>
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>

        {/* Sidebar - Category Breakdown */}
        {expenses.length > 0 && (
          <div className="space-y-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h3>
              <div className="space-y-3">
                {Object.entries(categoryTotals).map(([category, total]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded ${getCategoryColor(category)}`}>
                        <ApperIcon name={getCategoryIcon(category)} size={14} />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {categoryOptions.find(opt => opt.value === category)?.label || category}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      ${total.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
)}
      </div>
    </div>
  );
};

// ExpenseCharts Component
const ExpenseCharts = ({ 
  expenses, 
  farms, 
  selectedFarm, 
  onFarmChange, 
  chartPeriod, 
  onPeriodChange,
  categoryOptions,
  getCategoryColor,
  getCategoryIcon 
}) => {
  const [activeChartTab, setActiveChartTab] = useState('category');
  const [trendData, setTrendData] = useState([]);
  const [farmComparison, setFarmComparison] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadChartData();
  }, [selectedFarm, chartPeriod, expenses]);

  const loadChartData = async () => {
    if (expenses.length === 0) return;
    
    setLoading(true);
    try {
      const [trends, farmComp] = await Promise.all([
        expenseService.getTrendData(chartPeriod, selectedFarm),
        expenseService.getFarmComparison()
      ]);
      
      setTrendData(trends);
      setFarmComparison(farmComp);
    } catch (error) {
      toast.error('Failed to load chart data');
    } finally {
      setLoading(false);
    }
  };

  // Filter expenses for current selection
  const filteredExpenses = selectedFarm 
    ? expenses.filter(expense => expense.farmId === parseInt(selectedFarm, 10))
    : expenses;

  // Calculate category data for pie chart
  const categoryData = filteredExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const categoryChartData = {
    series: Object.values(categoryData),
    options: {
      chart: {
        type: 'pie',
        height: 350
      },
      labels: Object.keys(categoryData).map(cat => 
        categoryOptions.find(opt => opt.value === cat)?.label || cat
      ),
      colors: [
        '#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', 
        '#EF4444', '#F59E0B', '#6B7280', '#6366F1', 
        '#06B6D4', '#EC4899'
      ],
      legend: {
        position: 'bottom'
      },
      dataLabels: {
        formatter: function(val, opts) {
          return `$${opts.w.globals.series[opts.seriesIndex].toFixed(0)}`;
        }
      },
      tooltip: {
        y: {
          formatter: function(val) {
            return `$${val.toFixed(2)}`;
          }
        }
      }
    }
  };

  // Trend chart data
  const trendChartData = {
    series: [{
      name: 'Total Expenses',
      data: trendData.map(item => item.total)
    }],
    options: {
      chart: {
        type: 'line',
        height: 350,
        zoom: {
          enabled: false
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth',
        width: 3
      },
      colors: ['#10B981'],
      xaxis: {
        categories: trendData.map(item => {
          if (chartPeriod === 'monthly') {
            const [year, month] = item.period.split('-');
            return `${new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short' })} ${year}`;
          }
          return item.period;
        })
      },
      yaxis: {
        labels: {
          formatter: function(val) {
            return `$${val.toFixed(0)}`;
          }
        }
      },
      tooltip: {
        y: {
          formatter: function(val) {
            return `$${val.toFixed(2)}`;
          }
        }
      }
    }
  };

  // Farm comparison chart
  const farmComparisonData = {
    series: [{
      name: 'Total Expenses',
      data: Object.entries(farmComparison).map(([farmId, data]) => data.total)
    }],
    options: {
      chart: {
        type: 'bar',
        height: 350
      },
      colors: ['#3B82F6'],
      xaxis: {
        categories: Object.keys(farmComparison).map(farmId => 
          farms.find(f => f.Id === parseInt(farmId))?.name || `Farm ${farmId}`
        )
      },
      yaxis: {
        labels: {
          formatter: function(val) {
            return `$${val.toFixed(0)}`;
          }
        }
      },
      tooltip: {
        y: {
          formatter: function(val) {
            return `$${val.toFixed(2)}`;
          }
        }
      },
      dataLabels: {
        enabled: false
      }
    }
  };

  const farmOptions = [
    { value: '', label: 'All Farms' },
    ...farms.map(farm => ({
      value: farm.Id,
      label: farm.name
    }))
  ];

  const periodOptions = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="h-10 bg-surface-200 rounded animate-pulse flex-1" />
          <div className="h-10 bg-surface-200 rounded animate-pulse w-32" />
        </div>
        <Card>
          <div className="h-80 bg-surface-200 rounded animate-pulse" />
        </Card>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <EmptyState
        title="No expense data available"
        description="Record some expenses to view charts and analytics."
        icon="BarChart3"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select
          placeholder="Filter by farm"
          value={selectedFarm}
          onChange={(e) => onFarmChange(e.target.value)}
          options={farmOptions}
          className="flex-1"
        />
        
        <Select
          placeholder="Time period"
          value={chartPeriod}
          onChange={(e) => onPeriodChange(e.target.value)}
          options={periodOptions}
          className="w-40"
        />
      </div>

      {/* Chart Tabs */}
      <div className="flex space-x-1 bg-surface-100 p-1 rounded-lg max-w-2xl">
        <button
          onClick={() => setActiveChartTab('category')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeChartTab === 'category'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <ApperIcon name="PieChart" size={16} />
            Category Breakdown
          </div>
        </button>
        <button
          onClick={() => setActiveChartTab('trends')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeChartTab === 'trends'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <ApperIcon name="TrendingUp" size={16} />
            Spending Trends
          </div>
        </button>
        <button
          onClick={() => setActiveChartTab('farms')}
          className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeChartTab === 'farms'
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <ApperIcon name="BarChart3" size={16} />
            Farm Comparison
          </div>
        </button>
      </div>

      {/* Chart Content */}
      <Card>
        {activeChartTab === 'category' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Expenses by Category
              {selectedFarm && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  - {farms.find(f => f.Id === parseInt(selectedFarm))?.name}
                </span>
              )}
            </h3>
            {Object.keys(categoryData).length > 0 ? (
              <Chart
                options={categoryChartData.options}
                series={categoryChartData.series}
                type="pie"
                height={400}
              />
            ) : (
              <div className="flex items-center justify-center h-80 text-gray-500">
                No expense data available for the selected filters
              </div>
            )}
          </div>
        )}

        {activeChartTab === 'trends' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Spending Trends ({chartPeriod === 'monthly' ? 'Monthly' : 'Yearly'})
              {selectedFarm && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  - {farms.find(f => f.Id === parseInt(selectedFarm))?.name}
                </span>
              )}
            </h3>
            {trendData.length > 0 ? (
              <Chart
                options={trendChartData.options}
                series={trendChartData.series}
                type="line"
                height={400}
              />
            ) : (
              <div className="flex items-center justify-center h-80 text-gray-500">
                Not enough data to show trends
              </div>
            )}
          </div>
        )}

        {activeChartTab === 'farms' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Expenses by Farm
            </h3>
            {Object.keys(farmComparison).length > 0 ? (
              <Chart
                options={farmComparisonData.options}
                series={farmComparisonData.series}
                type="bar"
                height={400}
              />
            ) : (
              <div className="flex items-center justify-center h-80 text-gray-500">
                No farm comparison data available
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Expenses;