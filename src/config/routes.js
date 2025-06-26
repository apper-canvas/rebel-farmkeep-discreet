import Dashboard from '@/components/pages/Dashboard';
import Farms from '@/components/pages/Farms';
import Crops from '@/components/pages/Crops';
import Tasks from '@/components/pages/Tasks';
import Expenses from '@/components/pages/Expenses';
import Income from '@/components/pages/Income';
import Weather from '@/components/pages/Weather';
export const routes = {
  dashboard: {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: 'LayoutDashboard',
    component: Dashboard
  },
  farms: {
    id: 'farms',
    label: 'Farms',
    path: '/farms',
    icon: 'Map',
    component: Farms
  },
  crops: {
    id: 'crops',
    label: 'Crops',
    path: '/crops',
    icon: 'Sprout',
    component: Crops
  },
  tasks: {
    id: 'tasks',
    label: 'Tasks',
    path: '/tasks',
    icon: 'CheckSquare',
    component: Tasks
  },
  expenses: {
    id: 'expenses',
    label: 'Expenses',
    path: '/expenses',
    icon: 'DollarSign',
    component: Expenses
  },
income: {
    id: 'income',
    label: 'Income',
    path: '/income',
    icon: 'TrendingUp',
    component: Income
  },
  weather: {
    id: 'weather',
    label: 'Weather',
    path: '/weather',
    icon: 'CloudSun',
    component: Weather
  }
};

export const routeArray = Object.values(routes);
export default routes;