import { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { RoleContext } from './context/RoleContext';
import PageTransition from './components/PageTransition';

import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Layout from './components/Layout';

// Farmer Pages
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import SowingLog from './pages/farmer/SowingLog';
import HarvestTracking from './pages/farmer/HarvestTracking';
import CropPredictions from './pages/farmer/CropPredictions';

// Warehouse Pages
import WarehouseDashboard from './pages/warehouse/WarehouseDashboard';
import InventoryManagement from './pages/warehouse/InventoryManagement';
import WarehouseAnalytics from './pages/warehouse/WarehouseAnalytics';

// Processing Pages
import ProcessingDashboard from './pages/processing/ProcessingDashboard';
import BatchManagement from './pages/processing/BatchManagement';
import QualityControl from './pages/processing/QualityControl';

// Supplier Pages
import SupplierDashboard from './pages/supplier/SupplierDashboard';
import OrderManagement from './pages/supplier/OrderManagement';
import StockMonitor from './pages/supplier/StockMonitor';

// Admin Pages
import SystemOverview from './pages/admin/SystemOverview';
import PredictiveAnalytics from './pages/admin/PredictiveAnalytics';
import UserManagement from './pages/admin/UserManagement';
import SystemAlerts from './pages/admin/SystemAlerts';

function App() {
  const { currentRole, user } = useContext(RoleContext);
  const location = useLocation();

  if (!user) {
    return (
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Home /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    );
  }

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Redirect root to default page of current role */}
          <Route path="/" element={<Navigate to={currentRole.defaultPage} replace />} />

          {currentRole.key === 'farmer' && (
            <>
              <Route path="/farmer" element={<PageTransition><FarmerDashboard /></PageTransition>} />
              <Route path="/farmer/sowing" element={<PageTransition><SowingLog /></PageTransition>} />
              <Route path="/farmer/harvest" element={<PageTransition><HarvestTracking /></PageTransition>} />
              <Route path="/farmer/predictions" element={<PageTransition><CropPredictions /></PageTransition>} />
            </>
          )}

          {currentRole.key === 'warehouse' && (
            <>
              <Route path="/warehouse" element={<PageTransition><WarehouseDashboard /></PageTransition>} />
              <Route path="/warehouse/inventory" element={<PageTransition><InventoryManagement /></PageTransition>} />
              <Route path="/warehouse/analytics" element={<PageTransition><WarehouseAnalytics /></PageTransition>} />
            </>
          )}

          {currentRole.key === 'processing' && (
            <>
              <Route path="/processing" element={<PageTransition><ProcessingDashboard /></PageTransition>} />
              <Route path="/processing/batches" element={<PageTransition><BatchManagement /></PageTransition>} />
              <Route path="/processing/qc" element={<PageTransition><QualityControl /></PageTransition>} />
            </>
          )}

          {currentRole.key === 'supplier' && (
            <>
              <Route path="/supplier" element={<PageTransition><SupplierDashboard /></PageTransition>} />
              <Route path="/supplier/orders" element={<PageTransition><OrderManagement /></PageTransition>} />
              <Route path="/supplier/stock" element={<PageTransition><StockMonitor /></PageTransition>} />
            </>
          )}

          {currentRole.key === 'admin' && (
            <>
              <Route path="/admin" element={<PageTransition><SystemOverview /></PageTransition>} />
              <Route path="/admin/analytics" element={<PageTransition><PredictiveAnalytics /></PageTransition>} />
              <Route path="/admin/users" element={<PageTransition><UserManagement /></PageTransition>} />
              <Route path="/admin/alerts" element={<PageTransition><SystemAlerts /></PageTransition>} />
            </>
          )}

          <Route path="*" element={<Navigate to={currentRole.defaultPage} replace />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}

export default App;
