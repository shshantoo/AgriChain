import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { StatCard } from '../../components/SharedUI';

const FarmerDashboard = () => {
  const [stats, setStats] = useState({ sowings: 0, batches: 0, inputs: 0 });

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:3001/api/farmer/sowing'),
      axios.get('http://localhost:3001/api/farmer/harvest'),
      axios.get('http://localhost:3001/api/farmer/input-supply'),
    ]).then(([s, h, i]) => setStats({ sowings: s.data.length, batches: h.data.length, inputs: i.data.length })).catch(() => {});
  }, []);

  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>👨‍🌾 Farmer Dashboard</h2>
        <p>Overview of your farming activities — Season 2025/26</p>
      </div>
      <div className="stat-grid">
        <StatCard label="Sowing Logs" value={stats.sowings} sub="Seeds planted" badgeText="Active" badgeColor="green" />
        <StatCard label="Harvest Batches" value={stats.batches} sub="Batches recorded" badgeText="Tracked" badgeColor="blue" />
        <StatCard label="Input Supplies" value={stats.inputs} sub="Deliveries received" badgeText="Supply" badgeColor="amber" />
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <div className="section-header"><h3>🚀 Quick Actions</h3></div>
        <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
          <a className="btn btn-primary" href="/farmer/sowing">+ Add Sowing Log</a>
          <a className="btn btn-outline" href="/farmer/harvest">+ New Harvest Batch</a>
          <a className="btn btn-outline" href="/farmer/inputs">View Input Supplies</a>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
