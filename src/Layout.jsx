import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ApperIcon from '@/components/ApperIcon';
import { routeArray } from '@/config/routes';
import FarmSelector from '@/components/organisms/FarmSelector';
import OfflineIndicator from '@/components/molecules/OfflineIndicator';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' }
  };

  const overlayVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 h-16 bg-white border-b border-surface-200 px-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 hover:bg-surface-100 rounded-lg transition-colors"
          >
            <ApperIcon name="Menu" size={20} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <ApperIcon name="Sprout" size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-heading font-bold text-primary">FarmKeep</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <FarmSelector />
          <OfflineIndicator />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 bg-white border-r border-surface-200 flex-col z-40">
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {routeArray.map((route) => (
              <NavLink
                key={route.id}
                to={route.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-gray-700 hover:bg-surface-100 hover:text-primary'
                  }`
                }
              >
                <ApperIcon name={route.icon} size={20} />
                <span className="font-medium">{route.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={overlayVariants}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 bg-black/50 z-50 lg:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <motion.aside
                initial="closed"
                animate="open"
                exit="closed"
                variants={sidebarVariants}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-surface-200 z-50 lg:hidden flex flex-col"
              >
                <div className="h-16 flex items-center justify-between px-4 border-b border-surface-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <ApperIcon name="Sprout" size={20} className="text-white" />
                    </div>
                    <h2 className="text-lg font-heading font-bold text-primary">FarmKeep</h2>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 hover:bg-surface-100 rounded-lg transition-colors"
                  >
                    <ApperIcon name="X" size={20} />
                  </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                  {routeArray.map((route) => (
                    <NavLink
                      key={route.id}
                      to={route.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                          isActive
                            ? 'bg-primary text-white shadow-sm'
                            : 'text-gray-700 hover:bg-surface-100 hover:text-primary'
                        }`
                      }
                    >
                      <ApperIcon name={route.icon} size={20} />
                      <span className="font-medium">{route.label}</span>
                    </NavLink>
                  ))}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Quick Actions Bar */}
      <div className="lg:hidden flex-shrink-0 h-16 bg-white border-t border-surface-200 px-4 flex items-center justify-around">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
              isActive ? 'text-primary' : 'text-gray-500'
            }`
          }
        >
          <ApperIcon name="LayoutDashboard" size={20} />
          <span className="text-xs font-medium">Dashboard</span>
        </NavLink>
        
        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
              isActive ? 'text-primary' : 'text-gray-500'
            }`
          }
        >
          <ApperIcon name="CheckSquare" size={20} />
          <span className="text-xs font-medium">Tasks</span>
        </NavLink>
        
        <NavLink
          to="/crops"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
              isActive ? 'text-primary' : 'text-gray-500'
            }`
          }
        >
          <ApperIcon name="Sprout" size={20} />
          <span className="text-xs font-medium">Crops</span>
        </NavLink>
        
        <NavLink
          to="/weather"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
              isActive ? 'text-primary' : 'text-gray-500'
            }`
          }
        >
          <ApperIcon name="CloudSun" size={20} />
          <span className="text-xs font-medium">Weather</span>
        </NavLink>
      </div>
    </div>
  );
};

export default Layout;