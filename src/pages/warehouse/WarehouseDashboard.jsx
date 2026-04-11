import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { StatCard } from '../../components/SharedUI';

const WarehouseDashboard = () => {
  const [stats, setStats] = useState({ warehouses: 0, inventory: 0, movements: 0, sensors: 0 });
  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:3001/api/warehouse/warehouses'),
      axios.get('http://localhost:3001/api/warehouse/inventory'),
      axios.get('http://localhost:3001/api/warehouse/stock-movement'),
      axios.get('http://localhost:3001/api/warehouse/sensors'),
    ]).then(([w, i, m, s]) => setStats({ warehouses: w.data.length, inventory: i.data.reduce((acc, x) => acc + parseFloat(x.quantity || 0), 0).toFixed(1), movements: m.data.length, sensors: s.data.length })).catch(() => {});
  }, []);

  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>🏭 Warehouse Dashboard</h2>
        <p>Central warehouse operations overview</p>
      </div>
      <div className="stat-grid">
        <StatCard label="Warehouses" value={stats.warehouses} sub="Total locations" badgeText="Managed" badgeColor="blue" />
        <StatCard label="Total Inventory" value={`${stats.inventory} t`} sub="Across all warehouses" badgeText="In Stock" badgeColor="green" />
        <StatCard label="Stock Movements" value={stats.movements} sub="All time" badgeText="Tracked" badgeColor="amber" />
        <StatCard label="Active Sensors" value={stats.sensors} sub="Monitoring warehouses" badgeText="IoT" badgeColor="green" />
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <div className="section-header"><h3>🚀 Quick Actions</h3></div>
        <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
          <a className="btn btn-primary" href="/warehouse/inventory">Manage Inventory</a>
          <a className="btn btn-outline" href="/warehouse/stock-movement">Record Movement</a>
          <a className="btn btn-outline" href="/warehouse/sensors">Sensor Monitor</a>
          <a className="btn btn-outline" href="/warehouse/warehouses">Manage Warehouses</a>
        </div>
      </div>
    </div>
  );
};

export default WarehouseDashboard;
