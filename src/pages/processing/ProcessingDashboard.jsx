import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { StatCard } from '../../components/SharedUI';

const ProcessingDashboard = () => {
  const [stats, setStats] = useState({ plants: 0, batches: 0 });
  useEffect(() => {
    Promise.all([axios.get('http://localhost:3001/api/processing/plants'), axios.get('http://localhost:3001/api/processing/batches')])
      .then(([p, b]) => setStats({ plants: p.data.length, batches: b.data.length })).catch(() => {});
  }, []);

  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>⚙️ Processing Dashboard</h2>
        <p>Processing plant operations overview</p>
      </div>
      <div className="stat-grid">
        <StatCard label="Processing Plants" value={stats.plants} sub="Registered facilities" badgeText="Active" badgeColor="green" />
        <StatCard label="Processing Batches" value={stats.batches} sub="Total batches processed" badgeText="Tracked" badgeColor="blue" />
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <div className="section-header"><h3>🚀 Quick Actions</h3></div>
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <a className="btn btn-primary" href="/processing/batches">Manage Batches</a>
          <a className="btn btn-outline" href="/processing/plants">Manage Plants</a>
        </div>
      </div>
    </div>
  );
};

export default ProcessingDashboard;
