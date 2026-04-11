import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { StatCard } from '../../components/SharedUI';

const MarketDashboard = () => {
  const [stats, setStats] = useState({ markets: 0, sales: 0, revenue: 0 });
  useEffect(() => {
    Promise.all([axios.get('http://localhost:3001/api/market/markets'), axios.get('http://localhost:3001/api/market/sales')])
      .then(([m, s]) => setStats({
        markets: m.data.length,
        sales: s.data.length,
        revenue: s.data.reduce((acc, x) => acc + parseFloat(x.sale_price || 0), 0).toFixed(2)
      })).catch(() => {});
  }, []);

  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>🏪 Market Dashboard</h2>
        <p>Market operations and sales performance overview</p>
      </div>
      <div className="stat-grid">
        <StatCard label="Markets" value={stats.markets} sub="Registered market locations" badgeText="Active" badgeColor="blue" />
        <StatCard label="Sales Records" value={stats.sales} sub="Total transactions" badgeText="Recorded" badgeColor="green" />
        <StatCard label="Total Revenue" value={`৳ ${parseFloat(stats.revenue).toLocaleString()}`} sub="Cumulative sales value" badgeText="Finance" badgeColor="green" />
      </div>
      <div className="card" style={{ marginTop: 20 }}>
        <div className="section-header"><h3>🚀 Quick Actions</h3></div>
        <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
          <a className="btn btn-primary" href="/market/sales">Record Sale</a>
          <a className="btn btn-outline" href="/market/markets">Manage Markets</a>
        </div>
      </div>
    </div>
  );
};

export default MarketDashboard;
