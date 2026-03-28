import { useContext } from 'react';
import { RoleContext } from '../context/RoleContext';

const RoleSelector = () => {
  const { setCurrentRoleKey } = useContext(RoleContext);

  return (
    <div id="role-screen">
      <div className="logo">Agri<span>Chain</span></div>
      <div className="tagline">Smart Farm-to-Warehouse Management System</div>
      <div className="role-grid">
        <div className="role-card" onClick={() => setCurrentRoleKey('farmer')}>
          <span className="icon">🌾</span>
          <div className="role-name">Farmer</div>
          <div className="role-desc">Sowing logs, harvest tracking, IoT sensor data & crop predictions</div>
        </div>
        <div className="role-card" onClick={() => setCurrentRoleKey('warehouse')}>
          <span className="icon">🏭</span>
          <div className="role-name">Warehouse Manager</div>
          <div className="role-desc">Real-time inventory, stock visibility & incoming shipments</div>
        </div>
        <div className="role-card" onClick={() => setCurrentRoleKey('processing')}>
          <span className="icon">⚙️</span>
          <div className="role-name">Processing Unit</div>
          <div className="role-desc">RFID auto-tracking, batch management & quality control</div>
        </div>
        <div className="role-card" onClick={() => setCurrentRoleKey('supplier')}>
          <span className="icon">🚚</span>
          <div className="role-name">Supplier Portal</div>
          <div className="role-desc">Auto-orders, stock levels, delivery ETA & purchase orders</div>
        </div>
        <div className="role-card" onClick={() => setCurrentRoleKey('admin')}>
          <span className="icon">📊</span>
          <div className="role-name">Admin / Analytics</div>
          <div className="role-desc">Predictive analytics, custom dashboards & system alerts</div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
