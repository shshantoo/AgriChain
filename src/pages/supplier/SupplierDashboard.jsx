import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { StatCard } from '../../components/SharedUI';

const SupplierDashboard = () => {
  const [count, setCount] = useState(0);
  useEffect(() => { axios.get('http://localhost:3001/api/supplier/input-supply').then(r => setCount(r.data.length)).catch(() => {}); }, []);

  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>🚚 Supplier Dashboard</h2>
        <p>Manage all input supply deliveries to farmers</p>
      </div>
      <div className="stat-grid">
        <StatCard label="Input Supply Records" value={count} sub="Total deliveries logged" badgeText="Active" badgeColor="green" />
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <div className="section-header"><h3>🚀 Quick Actions</h3></div>
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <a className="btn btn-primary" href="/supplier/inputs">Manage Input Supplies</a>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;
