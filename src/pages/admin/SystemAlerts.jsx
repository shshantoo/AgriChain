import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Badge, AlertBox } from '../../components/SharedUI';

const SystemAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/admin/alerts');
      setAlerts(res.data);
    } catch (err) {
      console.error('API Error:', err);
      // Fallback
      setAlerts([
        { id: 1, type: 'danger', message: 'Wheat stock below critical threshold at Warehouse KL', source: 'Auto-generated', created_at: new Date() },
        { id: 2, type: 'warning', message: 'Temperature spike in Zone B — Warehouse North', source: 'Sensor alert', created_at: new Date() },
        { id: 3, type: 'warning', message: 'Sensor #S-088 offline on Plot D4', source: 'IoT Gateway', created_at: new Date() },
        { id: 4, type: 'success', message: 'Batch BP-003 processing completed successfully', source: 'Auto-generated', created_at: new Date() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>System Alerts & Notifications</h2>
        <p>Configure auto-alerts, thresholds and notification rules</p>
      </div>
      <div className="two-col">
        <div className="card">
          <div className="section-header"><h3>🔔 Active Alerts</h3></div>
          {alerts.map(a => (
            <div key={a.id} className="notif-item">
              <div className={`notif-icon ${a.type === 'danger' ? 'red' : a.type === 'warning' ? 'amber' : 'green'}`}>
                {a.type === 'danger' ? '🔴' : a.type === 'warning' ? '⚠️' : '✅'}
              </div>
              <div>
                <div className="notif-text">{a.message}</div>
                <div className="notif-time">{a.source} · {new Date(a.created_at).toLocaleTimeString()}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="section-header">
            <h3>⚙️ Alert Rules</h3> 
            <button className="btn btn-primary btn-sm">+ New Rule</button>
          </div>
          <table>
            <thead><tr><th>Trigger</th><th>Threshold</th><th>Channel</th><th>Status</th></tr></thead>
            <tbody>
              <tr><td>Low stock</td><td>&lt; 10% capacity</td><td>Email + SMS</td><td><Badge text="On" color="green" /></td></tr>
              <tr><td>Temp out of range</td><td>&gt; 25°C</td><td>SMS</td><td><Badge text="On" color="green" /></td></tr>
              <tr><td>Sensor offline</td><td>&gt; 10 min</td><td>Dashboard</td><td><Badge text="On" color="green" /></td></tr>
              <tr><td>Batch completion</td><td>100%</td><td>Email</td><td><Badge text="On" color="green" /></td></tr>
              <tr><td>Delivery delay</td><td>&gt; 2 hrs</td><td>Email + SMS</td><td><Badge text="Off" color="amber" /></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SystemAlerts;
