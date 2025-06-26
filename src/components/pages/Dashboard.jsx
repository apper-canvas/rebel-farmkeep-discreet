import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { format, isToday } from "date-fns";
import { toast } from "react-toastify";
import incomeService from "@/services/api/incomeService";
import expenseService from "@/services/api/expenseService";
import weatherService from "@/services/api/weatherService";
import cropService from "@/services/api/cropService";
import taskService from "@/services/api/taskService";
import ApperIcon from "@/components/ApperIcon";
import Crops from "@/components/pages/Crops";
import SkeletonLoader from "@/components/molecules/SkeletonLoader";
import TaskItem from "@/components/molecules/TaskItem";
import EmptyState from "@/components/molecules/EmptyState";
import CropCard from "@/components/molecules/CropCard";
import WeatherCard from "@/components/molecules/WeatherCard";
import ErrorState from "@/components/molecules/ErrorState";
import StatCard from "@/components/molecules/StatCard";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";

const Dashboard = () => {
  const [todaysTasks, setTodaysTasks] = useState([]);
  const [activeCrops, setActiveCrops] = useState([]);
  const [todaysWeather, setTodaysWeather] = useState(null);
const [monthlyExpenses, setMonthlyExpenses] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
const [tasks, crops, weather, expenses, income] = await Promise.all([
        taskService.getTodaysTasks(),
        cropService.getAll(),
        weatherService.getTodaysWeather(),
        expenseService.getAll(),
        incomeService.getAll()
      ]);

      setTodaysTasks(tasks);
      
      // Filter active crops
      const active = crops.filter(crop => 
        crop.status === 'growing' || crop.status === 'mature' || crop.status === 'ready'
      );
      setActiveCrops(active.slice(0, 4)); // Show first 4
      
      setTodaysWeather(weather);
      
// Calculate current month expenses and income
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyExpenseTotal = expenses
        .filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate.getMonth() === currentMonth && 
                 expenseDate.getFullYear() === currentYear;
        })
        .reduce((total, expense) => total + expense.amount, 0);
      
      const monthlyIncomeTotal = income
        .filter(incomeItem => {
          const incomeDate = new Date(incomeItem.date);
          return incomeDate.getMonth() === currentMonth && 
                 incomeDate.getFullYear() === currentYear;
        })
        .reduce((total, incomeItem) => total + incomeItem.amount, 0);
      
      setMonthlyExpenses(monthlyExpenseTotal);
      setMonthlyIncome(monthlyIncomeTotal);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (taskId) => {
    try {
      const updatedTask = await taskService.toggleComplete(taskId);
      setTodaysTasks(prev => 
        prev.map(task => 
          task.Id === taskId ? updatedTask : task
        )
      );
      toast.success(updatedTask.completed ? 'Task completed!' : 'Task reopened');
    } catch (error) {
      toast.error('Failed to update task');
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <SkeletonLoader count={4} type="card" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SkeletonLoader count={3} type="card" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState message={error} onRetry={loadDashboardData} />
      </div>
    );
  }

  const completedTasks = todaysTasks.filter(task => task.completed).length;
  const pendingTasks = todaysTasks.filter(task => !task.completed).length;

  return (
    <motion.div
      variants={staggerChildren}
      initial="initial"
      animate="animate"
      className="p-6 space-y-6 max-w-full overflow-hidden"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-gray-900 mb-2">
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}!
        </h1>
        <p className="text-gray-600">
          {format(new Date(), 'EEEE, MMMM d, yyyy')} • Here's what's happening on your farms today
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={fadeInUp}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard
          title="Today's Tasks"
          value={todaysTasks.length}
          subtitle={`${completedTasks} completed, ${pendingTasks} pending`}
          icon="CheckSquare"
          color="primary"
        />
        
        <StatCard
          title="Active Crops"
          value={activeCrops.length}
          subtitle="Currently growing"
          icon="Sprout"
          color="secondary"
        />
        
        <StatCard
          title="Today's Weather"
          value={todaysWeather ? `${todaysWeather.high}°F` : '--'}
          subtitle={todaysWeather ? todaysWeather.condition.replace('-', ' ') : 'Loading...'}
          icon="CloudSun"
          color="accent"
        />
        
<StatCard
          title="Month Income"
          value={`$${monthlyIncome.toFixed(2)}`}
          subtitle={format(new Date(), 'MMMM yyyy')}
          icon="TrendingUp"
          color="success"
        />
        
        <StatCard
          title="Month Expenses"
          value={`$${monthlyExpenses.toFixed(2)}`}
          subtitle={format(new Date(), 'MMMM yyyy')}
          icon="DollarSign"
          color="warning"
        />
      </motion.div>

      {/* Profit/Loss Summary */}
      <motion.div variants={fadeInUp}>
        <Card className={`p-6 ${monthlyIncome >= monthlyExpenses ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {format(new Date(), 'MMMM yyyy')} Summary
              </h3>
              <p className="text-gray-600">
                {monthlyIncome >= monthlyExpenses 
                  ? `Profit: $${(monthlyIncome - monthlyExpenses).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                  : `Loss: $${(monthlyExpenses - monthlyIncome).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                }
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="small"
                icon="TrendingUp"
                onClick={() => window.location.href = '/income'}
              >
                View Income
              </Button>
              <Button
                variant="outline"
                size="small"
                icon="BarChart3"
                onClick={() => window.location.href = '/reports'}
              >
                Full Report
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <motion.div variants={fadeInUp} className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-surface-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Today's Tasks</h2>
              <Button
                variant="outline"
                size="small"
                icon="Plus"
                onClick={() => window.location.href = '/tasks'}
              >
                Add Task
              </Button>
            </div>
            
            {todaysTasks.length === 0 ? (
              <EmptyState
                title="No tasks for today"
                description="You're all caught up! Add some tasks to stay organized."
                icon="CheckSquare"
                actionLabel="Add Task"
                onAction={() => window.location.href = '/tasks'}
              />
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {todaysTasks.map((task, index) => (
                  <motion.div
                    key={task.Id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <TaskItem
                      task={task}
                      onToggleComplete={handleToggleTask}
                      onEdit={() => {}}
                      onDelete={() => {}}
                      showFarm={true}
                      showCrop={true}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Weather & Quick Info */}
        <motion.div variants={fadeInUp} className="space-y-6">
          {/* Weather Card */}
          {todaysWeather && (
            <WeatherCard weather={todaysWeather} isToday={true} />
          )}

          {/* Active Crops */}
          <div className="bg-white rounded-lg border border-surface-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Crops</h3>
              <Button
                variant="ghost"
                size="small"
                icon="ExternalLink"
                onClick={() => window.location.href = '/crops'}
              >
                View All
              </Button>
            </div>
            
            {activeCrops.length === 0 ? (
              <EmptyState
                title="No active crops"
                description="Start tracking your crops to see them here."
                icon="Sprout"
                actionLabel="Add Crop"
                onAction={() => window.location.href = '/crops'}
              />
            ) : (
              <div className="space-y-4">
                {activeCrops.map((crop, index) => (
                  <motion.div
                    key={crop.Id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 border border-surface-200 rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{crop.name}</h4>
                        <p className="text-sm text-gray-600">{crop.variety} • {crop.fieldLocation}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        crop.status === 'ready' ? 'bg-orange-100 text-orange-800' :
                        crop.status === 'mature' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {crop.status}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;