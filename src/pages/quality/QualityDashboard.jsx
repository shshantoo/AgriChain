import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { StatCard } from '../../components/SharedUI';

const QualityDashboard = () => {
  const [count, setCount] = useState(0);
  useEffect(() => { axios.get('http://localhost:3001/api/quality/reports').then(r => setCount(r.data.length)).catch(() => {}); }, []);

  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>🔬 Quality Control Dashboard</h2>
        <p>Monitor quality inspection activities across all processing batches</p>
      </div>
      <div className="stat-grid">
        <StatCard label="Quality Reports" value={count} sub="Total reports submitted" badgeText="QC Lab" badgeColor="blue" />
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <div className="section-header"><h3>🚀 Quick Actions</h3></div>
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <a className="btn btn-primary" href="/quality/reports">View / Submit Reports</a>
        </div>
      </div>
    </div>
  );
};

export default QualityDashboard;
