import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import StatCard from '@/components/molecules/StatCard';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import ErrorState from '@/components/molecules/ErrorState';
import incomeService from '@/services/api/incomeService';
import expenseService from '@/services/api/expenseService';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    profitLoss: 0,
    monthlyData: [],
    yearlyData: []
  });
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod, selectedDate]);

  const loadReportData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let startDate, endDate;
      
      if (selectedPeriod === 'month') {
        startDate = startOfMonth(selectedDate);
        endDate = endOfMonth(selectedDate);
      } else {
        startDate = startOfYear(selectedDate);
        endDate = endOfYear(selectedDate);
      }
      
      const [incomeData, expenseData] = await Promise.all([
        incomeService.getByDateRange(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]),
        expenseService.getByDateRange(startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0])
      ]);
      
      const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0);
      const totalExpenses = expenseData.reduce((sum, item) => sum + item.amount, 0);
      const profitLoss = totalIncome - totalExpenses;
      
      // Generate monthly breakdown for the selected period
      const monthlyData = [];
      if (selectedPeriod === 'year') {
        for (let i = 0; i < 12; i++) {
          const monthStart = new Date(selectedDate.getFullYear(), i, 1);
          const monthEnd = endOfMonth(monthStart);
          
          const monthIncome = incomeData.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= monthStart && itemDate <= monthEnd;
          }).reduce((sum, item) => sum + item.amount, 0);
          
          const monthExpenses = expenseData.filter(item => {
            const itemDate = new Date(item.date);
            return itemDate >= monthStart && itemDate <= monthEnd;
          }).reduce((sum, item) => sum + item.amount, 0);
          
          monthlyData.push({
            month: format(monthStart, 'MMM'),
            income: monthIncome,
            expenses: monthExpenses,
            profit: monthIncome - monthExpenses
          });
        }
      }
      
      setReportData({
        totalIncome,
        totalExpenses,
        profitLoss,
        monthlyData,
        incomeBreakdown: groupByCategory(incomeData, 'category'),
        expenseBreakdown: groupByCategory(expenseData, 'category')
      });
      
    } catch (err) {
      setError(err.message || 'Failed to load report data');
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const groupByCategory = (data, categoryField) => {
    const grouped = data.reduce((acc, item) => {
      const category = item[categoryField] || 'other';
      if (!acc[category]) {
        acc[category] = { total: 0, count: 0 };
      }
      acc[category].total += item.amount;
      acc[category].count += 1;
      return acc;
    }, {});
    
    return Object.entries(grouped).map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count
    })).sort((a, b) => b.total - a.total);
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const handleDateChange = (direction) => {
    if (selectedPeriod === 'month') {
      setSelectedDate(prev => direction === 'prev' ? subMonths(prev, 1) : new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    } else {
      setSelectedDate(prev => new Date(prev.getFullYear() + (direction === 'prev' ? -1 : 1), 0, 1));
    }
  };

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
          <SkeletonLoader type="text" className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonLoader count={3} type="card" />
        </div>
        <SkeletonLoader count={2} type="card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState message={error} onRetry={loadReportData} />
      </div>
    );
  }

  const isProfitable = reportData.profitLoss >= 0;
  const profitMargin = reportData.totalIncome > 0 ? (reportData.profitLoss / reportData.totalIncome * 100) : 0;

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
          <h1 className="text-3xl font-heading font-bold text-gray-900">Financial Reports</h1>
          <p className="text-gray-600 mt-1">
            Analyze your farm's profit and loss
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-surface-100 rounded-lg p-1">
            <Button
              variant={selectedPeriod === 'month' ? 'primary' : 'ghost'}
              size="small"
              onClick={() => handlePeriodChange('month')}
            >
              Monthly
            </Button>
            <Button
              variant={selectedPeriod === 'year' ? 'primary' : 'ghost'}
              size="small"
              onClick={() => handlePeriodChange('year')}
            >
              Yearly
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="small"
              icon="ChevronLeft"
              onClick={() => handleDateChange('prev')}
            />
            <span className="text-sm font-medium px-3">
              {selectedPeriod === 'month' 
                ? format(selectedDate, 'MMMM yyyy')
                : format(selectedDate, 'yyyy')
              }
            </span>
            <Button
              variant="outline"
              size="small"
              icon="ChevronRight"
              onClick={() => handleDateChange('next')}
            />
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        variants={fadeInUp}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <StatCard
          title="Total Income"
          value={`$${reportData.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle={`${selectedPeriod === 'month' ? 'This month' : 'This year'}`}
          icon="TrendingUp"
          color="success"
        />
        
        <StatCard
          title="Total Expenses"
          value={`$${reportData.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle={`${selectedPeriod === 'month' ? 'This month' : 'This year'}`}
          icon="TrendingDown"
          color="warning"
        />
        
        <StatCard
          title={isProfitable ? "Profit" : "Loss"}
          value={`${isProfitable ? '+' : '-'}$${Math.abs(reportData.profitLoss).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle={`${profitMargin >= 0 ? '+' : ''}${profitMargin.toFixed(1)}% margin`}
          icon={isProfitable ? "TrendingUp" : "TrendingDown"}
          color={isProfitable ? "success" : "danger"}
        />
      </motion.div>

      {/* Monthly Breakdown */}
      {selectedPeriod === 'year' && reportData.monthlyData.length > 0 && (
        <motion.div variants={fadeInUp}>
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {reportData.monthlyData.map((month, index) => (
                <div key={index} className="border border-surface-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{month.month}</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-600">Income:</span>
                      <span className="font-medium">${month.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-600">Expenses:</span>
                      <span className="font-medium">${month.expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1">
                      <span className={month.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {month.profit >= 0 ? 'Profit:' : 'Loss:'}
                      </span>
                      <span className={`font-medium ${month.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${Math.abs(month.profit).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Breakdown */}
        <motion.div variants={fadeInUp}>
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Income by Category</h3>
            {reportData.incomeBreakdown && reportData.incomeBreakdown.length > 0 ? (
              <div className="space-y-3">
                {reportData.incomeBreakdown.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900 capitalize">{category.category}</span>
                      <span className="text-sm text-gray-600 ml-2">({category.count} items)</span>
                    </div>
                    <span className="font-semibold text-green-600">
                      ${category.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No income data for this period</p>
            )}
          </Card>
        </motion.div>

        {/* Expense Breakdown */}
        <motion.div variants={fadeInUp}>
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
            {reportData.expenseBreakdown && reportData.expenseBreakdown.length > 0 ? (
              <div className="space-y-3">
                {reportData.expenseBreakdown.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-900 capitalize">{category.category}</span>
                      <span className="text-sm text-gray-600 ml-2">({category.count} items)</span>
                    </div>
                    <span className="font-semibold text-red-600">
                      ${category.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No expense data for this period</p>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Profit/Loss Summary */}
      <motion.div variants={fadeInUp}>
        <Card className={`p-6 ${isProfitable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {selectedPeriod === 'month' ? 'Monthly' : 'Yearly'} Summary
              </h3>
              <p className="text-gray-600">
                {isProfitable 
                  ? `Great job! Your farm generated a profit of $${reportData.profitLoss.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${selectedPeriod === 'month' ? 'this month' : 'this year'}.`
                  : `Your farm had a loss of $${Math.abs(reportData.profitLoss).toLocaleString('en-US', { minimumFractionDigits: 2 })} ${selectedPeriod === 'month' ? 'this month' : 'this year'}. Consider reviewing expenses and income strategies.`
                }
              </p>
            </div>
            <div className={`p-3 rounded-full ${isProfitable ? 'bg-green-100' : 'bg-red-100'}`}>
              <ApperIcon 
                name={isProfitable ? "TrendingUp" : "TrendingDown"} 
                className={isProfitable ? 'text-green-600' : 'text-red-600'} 
                size={24} 
              />
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Reports;