import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { StatCard, Badge, AlertBox } from '../../components/SharedUI';

const SystemOverview = () => {
  const [stats, setStats] = useState({
    totalFarmers: 127,
    totalWarehouses: 6,
    iotSensors: 284,
    monthlyVolume: 1240
  });

  useEffect(() => {
    axios.get('http://localhost:3001/api/admin/stats')
      .then(res => setStats(res.data))
      .catch(err => console.error('API Error, using fallback:', err));
  }, []);

  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>System Overview</h2>
        <p>Central DBMS — Full system health and operational analytics</p>
      </div>
      <div className="stat-grid">
        <StatCard label="Total Farmers" value={stats.totalFarmers} sub="Active users" badgeText="+8 this month" badgeColor="green" />
        <StatCard label="Total Warehouses" value={stats.totalWarehouses} sub="Across 3 regions" badgeText="All Online" badgeColor="blue" />
        <StatCard label="IoT Sensors" value={stats.iotSensors} sub="Active field sensors" badgeText="98% uptime" badgeColor="green" />
        <StatCard label="Monthly Volume" value={`${stats.monthlyVolume}t`} sub="Total processed" badgeText="+15%" badgeColor="green" />
      </div>
      <div className="two-thirds">
        <div className="card">
          <div className="section-header"><h3>📈 System-Wide Production (tonnes/month)</h3></div>
          <div className="bar-chart" style={{height:'160px'}}>
            <div className="bar" style={{height:'55%'}}></div>
            <div className="bar" style={{height:'70%'}}></div>
            <div className="bar" style={{height:'62%'}}></div>
            <div className="bar" style={{height:'85%'}}></div>
            <div className="bar" style={{height:'78%'}}></div>
            <div className="bar amber" style={{height:'100%'}}></div>
          </div>
          <div className="chart-labels">
            <span>Oct</span><span>Nov</span><span>Dec</span><span>Jan</span><span>Feb</span><span>Mar</span>
          </div>
        </div>
        <div>
          <div className="card">
            <div className="section-header"><h3>⚠️ System Alerts</h3></div>
            <AlertBox type="danger" message="🔴 Wheat stock critical at Warehouse KL" />
            <AlertBox type="warning" message="🟡 Sensor #S-088 offline — Plot D4" />
            <AlertBox type="success" message="🟢 All processing lines operational" />
          </div>
          <div className="card">
            <div className="section-header"><h3>🌐 System Status</h3></div>
            <div style={{display:'flex',flexDirection:'column',gap:'10px',fontSize:'0.85rem'}}>
              <div style={{display:'flex',justifyContent:'space-between'}}><span>Central DBMS</span><Badge text="Online" color="green"/></div>
              <div style={{display:'flex',justifyContent:'space-between'}}><span>IoT Gateway</span><Badge text="Online" color="green"/></div>
              <div style={{display:'flex',justifyContent:'space-between'}}><span>Mobile API</span><Badge text="Online" color="green"/></div>
              <div style={{display:'flex',justifyContent:'space-between'}}><span>RFID Network</span><Badge text="Degraded" color="amber"/></div>
              <div style={{display:'flex',justifyContent:'space-between'}}><span>Supplier Portal</span><Badge text="Online" color="green"/></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemOverview;
