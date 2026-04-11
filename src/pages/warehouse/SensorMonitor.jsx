import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Badge } from '../../components/SharedUI';

const WH_BASE = 'http://localhost:3001/api/warehouse';

const SensorMonitor = () => {
  const [sensors, setSensors] = useState([]);
  const [sensorData, setSensorData] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddSensor, setShowAddSensor] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [sensorForm, setSensorForm] = useState({ warehouse_id: '', sensor_type: 'Temperature & Humidity' });
  const [logForm, setLogForm] = useState({ sensor_id: '', temperature: '', humidity: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [s, w] = await Promise.all([axios.get(`${WH_BASE}/sensors`), axios.get(`${WH_BASE}/warehouses-list`)]);
      setSensors(s.data); setWarehouses(w.data);
      const params = selectedSensor ? { sensor_id: selectedSensor } : {};
      const d = await axios.get(`${WH_BASE}/sensor-data`, { params });
      setSensorData(d.data);
    } catch { } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [selectedSensor]);

  const handleAddSensor = async e => {
    e.preventDefault();
    try { await axios.post(`${WH_BASE}/sensors`, sensorForm); setShowAddSensor(false); setSensorForm({ warehouse_id: '', sensor_type: 'Temperature & Humidity' }); load(); }
    catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const handleLogData = async e => {
    e.preventDefault();
    try { await axios.post(`${WH_BASE}/sensor-data`, logForm); setShowLogForm(false); setLogForm({ sensor_id: '', temperature: '', humidity: '' }); load(); }
    catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const tempColor = t => t == null ? 'blue' : t > 35 || t < 5 ? 'red' : t > 28 ? 'amber' : 'green';
  const humidColor = h => h == null ? 'blue' : h > 85 || h < 30 ? 'red' : h > 70 ? 'amber' : 'green';

  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>📡 Sensor Monitor</h2>
        <p>Real-time sensor data for all warehouse locations — temperature and humidity tracking</p>
      </div>

      {/* Sensor Cards */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        {sensors.map(s => {
          const latestData = sensorData.filter(d => d.sensor_id === s.sensor_id)[0];
          return (
            <div key={s.sensor_id} className="card" style={{ cursor: 'pointer', border: selectedSensor == s.sensor_id ? '2px solid var(--primary)' : '1px solid var(--border)' }}
              onClick={() => setSelectedSensor(prev => prev == s.sensor_id ? '' : s.sensor_id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <strong>📡 Sensor #{s.sensor_id}</strong>
                <Badge text={s.sensor_type} color="blue" />
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>{s.area}, {s.district}</div>
              {latestData ? (
                <div style={{ display: 'flex', gap: 12 }}>
                  <Badge text={`🌡️ ${latestData.temperature ?? '–'}°C`} color={tempColor(latestData.temperature)} />
                  <Badge text={`💧 ${latestData.humidity ?? '–'}%`} color={humidColor(latestData.humidity)} />
                </div>
              ) : <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No data yet</div>}
            </div>
          );
        })}
        {sensors.length === 0 && !loading && <div style={{ color: 'var(--text-muted)' }}>No sensors registered yet.</div>}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button className="btn btn-primary" onClick={() => setShowAddSensor(true)}>+ Add Sensor</button>
        <button className="btn btn-outline" onClick={() => setShowLogForm(true)}>+ Log Reading</button>
      </div>

      {showAddSensor && (
        <div className="card" style={{ marginBottom: 20, border: '1px solid var(--primary)' }}>
          <div className="section-header"><h3>➕ Register Sensor</h3><button className="btn btn-outline btn-sm" onClick={() => setShowAddSensor(false)}>Cancel</button></div>
          <form onSubmit={handleAddSensor}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group"><label>Warehouse</label>
                <select className="form-control" value={sensorForm.warehouse_id} onChange={e => setSensorForm({ ...sensorForm, warehouse_id: e.target.value })} required>
                  <option value="">— Select —</option>
                  {warehouses.map(w => <option key={w.warehouse_id} value={w.warehouse_id}>{w.area}, {w.district}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Sensor Type</label>
                <select className="form-control" value={sensorForm.sensor_type} onChange={e => setSensorForm({ ...sensorForm, sensor_type: e.target.value })}>
                  <option>Temperature & Humidity</option><option>Temperature Only</option><option>Humidity Only</option><option>CO2</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">✅ Register</button>
          </form>
        </div>
      )}

      {showLogForm && (
        <div className="card" style={{ marginBottom: 20, border: '1px solid var(--primary)' }}>
          <div className="section-header"><h3>📝 Log Sensor Reading</h3><button className="btn btn-outline btn-sm" onClick={() => setShowLogForm(false)}>Cancel</button></div>
          <form onSubmit={handleLogData}>
            <div className="three-col">
              <div className="form-group"><label>Sensor</label>
                <select className="form-control" value={logForm.sensor_id} onChange={e => setLogForm({ ...logForm, sensor_id: e.target.value })} required>
                  <option value="">— Select Sensor —</option>
                  {sensors.map(s => <option key={s.sensor_id} value={s.sensor_id}>Sensor #{s.sensor_id} — {s.area}, {s.district}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Temperature (°C)</label><input type="number" step="0.1" className="form-control" value={logForm.temperature} onChange={e => setLogForm({ ...logForm, temperature: e.target.value })} /></div>
              <div className="form-group"><label>Humidity (%)</label><input type="number" step="0.1" min="0" max="100" className="form-control" value={logForm.humidity} onChange={e => setLogForm({ ...logForm, humidity: e.target.value })} /></div>
            </div>
            <button type="submit" className="btn btn-primary">✅ Log Reading</button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="section-header">
          <h3>📊 Sensor Data Log {selectedSensor ? `— Sensor #${selectedSensor}` : '(All Sensors)'}</h3>
          {selectedSensor && <button className="btn btn-outline btn-sm" onClick={() => setSelectedSensor('')}>Show All</button>}
        </div>
        <table>
          <thead><tr><th>Sensor #</th><th>Timestamp</th><th>Temperature</th><th>Humidity</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan="4" style={{ textAlign: 'center' }}>Loading…</td></tr>}
            {!loading && sensorData.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center' }}>No sensor data found.</td></tr>}
            {sensorData.map(d => (
              <tr key={d.data_id}>
                <td><strong>#{d.sensor_id}</strong></td>
                <td>{new Date(d.timestamp).toLocaleString()}</td>
                <td><Badge text={d.temperature != null ? `${d.temperature}°C` : 'N/A'} color={tempColor(d.temperature)} /></td>
                <td><Badge text={d.humidity != null ? `${d.humidity}%` : 'N/A'} color={humidColor(d.humidity)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SensorMonitor;
