import { useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { RoleContext } from './context/RoleContext';
import PageTransition from './components/PageTransition';

import Home from './pages/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Layout from './components/Layout';

// Farmer
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import SowingLog from './pages/farmer/SowingLog';
import HarvestBatch from './pages/farmer/HarvestBatch';
import InputSupplyReceived from './pages/farmer/InputSupplyReceived';

// Supplier
import SupplierDashboard from './pages/supplier/SupplierDashboard';
import InputSupplyManagement from './pages/supplier/InputSupplyManagement';

// Warehouse
import WarehouseDashboard from './pages/warehouse/WarehouseDashboard';
import WarehouseList from './pages/warehouse/WarehouseList';
import InventoryManagement from './pages/warehouse/InventoryManagement';
import StockMovement from './pages/warehouse/StockMovement';
import SensorMonitor from './pages/warehouse/SensorMonitor';

// Processing
import ProcessingDashboard from './pages/processing/ProcessingDashboard';
import ProcessingPlants from './pages/processing/ProcessingPlants';
import BatchManagement from './pages/processing/BatchManagement';

// Quality Inspector
import QualityDashboard from './pages/quality/QualityDashboard';
import QualityReports from './pages/quality/QualityReports';

// Logistics Manager
import LogisticsDashboard from './pages/logistics/LogisticsDashboard';
import DeliveryManagement from './pages/logistics/DeliveryManagement';

// Market Operator
import MarketDashboard from './pages/market/MarketDashboard';
import MarketList from './pages/market/MarketList';
import SalesManagement from './pages/market/SalesManagement';

// Admin
import SystemOverview from './pages/admin/SystemOverview';
import PredictiveAnalytics from './pages/admin/PredictiveAnalytics';
import UserManagement from './pages/admin/UserManagement';
import SystemAlerts from './pages/admin/SystemAlerts';
import FarmerDataAdmin from './pages/admin/FarmerDataAdmin';
import WarehouseDataAdmin from './pages/admin/WarehouseDataAdmin';
import ProcessingDataAdmin from './pages/admin/ProcessingDataAdmin';
import SupplierDataAdmin from './pages/admin/SupplierDataAdmin';
import QualityDataAdmin from './pages/admin/QualityDataAdmin';
import DeliveryDataAdmin from './pages/admin/DeliveryDataAdmin';
import MarketDataAdmin from './pages/admin/MarketDataAdmin';
import BatchTraceability from './pages/admin/BatchTraceability';

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
          <Route path="/" element={<Navigate to={currentRole.defaultPage} replace />} />

          {/* Farmer (F) */}
          {currentRole.key === 'F' && (<>
            <Route path="/farmer" element={<PageTransition><FarmerDashboard /></PageTransition>} />
            <Route path="/farmer/sowing" element={<PageTransition><SowingLog /></PageTransition>} />
            <Route path="/farmer/harvest" element={<PageTransition><HarvestBatch /></PageTransition>} />
            <Route path="/farmer/inputs" element={<PageTransition><InputSupplyReceived /></PageTransition>} />
          </>)}

          {/* Supplier (S) */}
          {currentRole.key === 'S' && (<>
            <Route path="/supplier" element={<PageTransition><SupplierDashboard /></PageTransition>} />
            <Route path="/supplier/inputs" element={<PageTransition><InputSupplyManagement /></PageTransition>} />
          </>)}

          {/* Warehouse Manager (WM) */}
          {currentRole.key === 'WM' && (<>
            <Route path="/warehouse" element={<PageTransition><WarehouseDashboard /></PageTransition>} />
            <Route path="/warehouse/warehouses" element={<PageTransition><WarehouseList /></PageTransition>} />
            <Route path="/warehouse/inventory" element={<PageTransition><InventoryManagement /></PageTransition>} />
            <Route path="/warehouse/stock-movement" element={<PageTransition><StockMovement /></PageTransition>} />
            <Route path="/warehouse/sensors" element={<PageTransition><SensorMonitor /></PageTransition>} />
          </>)}

          {/* Processing Manager (PM) */}
          {currentRole.key === 'PM' && (<>
            <Route path="/processing" element={<PageTransition><ProcessingDashboard /></PageTransition>} />
            <Route path="/processing/plants" element={<PageTransition><ProcessingPlants /></PageTransition>} />
            <Route path="/processing/batches" element={<PageTransition><BatchManagement /></PageTransition>} />
          </>)}

          {/* Quality Inspector (QI) */}
          {currentRole.key === 'QI' && (<>
            <Route path="/quality" element={<PageTransition><QualityDashboard /></PageTransition>} />
            <Route path="/quality/reports" element={<PageTransition><QualityReports /></PageTransition>} />
          </>)}

          {/* Logistics Manager (LM) */}
          {currentRole.key === 'LM' && (<>
            <Route path="/logistics" element={<PageTransition><LogisticsDashboard /></PageTransition>} />
            <Route path="/logistics/delivery" element={<PageTransition><DeliveryManagement /></PageTransition>} />
          </>)}

          {/* Market Operator (MO) */}
          {currentRole.key === 'MO' && (<>
            <Route path="/market" element={<PageTransition><MarketDashboard /></PageTransition>} />
            <Route path="/market/markets" element={<PageTransition><MarketList /></PageTransition>} />
            <Route path="/market/sales" element={<PageTransition><SalesManagement /></PageTransition>} />
          </>)}

          {/* Admin (A) */}
          {currentRole.key === 'A' && (<>
            <Route path="/admin" element={<PageTransition><SystemOverview /></PageTransition>} />
            <Route path="/admin/analytics" element={<PageTransition><PredictiveAnalytics /></PageTransition>} />
            <Route path="/admin/users" element={<PageTransition><UserManagement /></PageTransition>} />
            <Route path="/admin/alerts" element={<PageTransition><SystemAlerts /></PageTransition>} />
            <Route path="/admin/farmer-data" element={<PageTransition><FarmerDataAdmin /></PageTransition>} />
            <Route path="/admin/warehouse-data" element={<PageTransition><WarehouseDataAdmin /></PageTransition>} />
            <Route path="/admin/processing-data" element={<PageTransition><ProcessingDataAdmin /></PageTransition>} />
            <Route path="/admin/supplier-data" element={<PageTransition><SupplierDataAdmin /></PageTransition>} />
            <Route path="/admin/quality-data" element={<PageTransition><QualityDataAdmin /></PageTransition>} />
            <Route path="/admin/delivery-data" element={<PageTransition><DeliveryDataAdmin /></PageTransition>} />
            <Route path="/admin/market-data" element={<PageTransition><MarketDataAdmin /></PageTransition>} />
            <Route path="/admin/batch-trace" element={<PageTransition><BatchTraceability /></PageTransition>} />
          </>)}

          <Route path="*" element={<Navigate to={currentRole.defaultPage} replace />} />
        </Routes>
      </AnimatePresence>
    </Layout>
  );
}

export default App;
