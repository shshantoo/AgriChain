import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { StatCard, Badge } from '../../components/SharedUI';

const LogisticsDashboard = () => {
  const [deliveries, setDeliveries] = useState([]);
  useEffect(() => { axios.get('http://localhost:3001/api/delivery').then(r => setDeliveries(r.data)).catch(() => {}); }, []);

  const pending = deliveries.filter(d => d.status === 'Pending').length;
  const inTransit = deliveries.filter(d => d.status === 'In Transit').length;
  const delivered = deliveries.filter(d => d.status === 'Delivered').length;

  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>🚛 Logistics Dashboard</h2>
        <p>Delivery operations overview — fleet and dispatch tracking</p>
      </div>
      <div className="stat-grid">
        <StatCard label="Total Deliveries" value={deliveries.length} sub="All records" badgeText="All" badgeColor="blue" />
        <StatCard label="Pending" value={pending} sub="Awaiting dispatch" badgeText="Pending" badgeColor="amber" />
        <StatCard label="In Transit" value={inTransit} sub="Currently en route" badgeText="Moving" badgeColor="blue" />
        <StatCard label="Delivered" value={delivered} sub="Successfully completed" badgeText="Done" badgeColor="green" />
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <div className="section-header"><h3>🚀 Quick Actions</h3></div>
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <a className="btn btn-primary" href="/logistics/delivery">Manage Deliveries</a>
        </div>
      </div>
    </div>
  );
};

export default LogisticsDashboard;
