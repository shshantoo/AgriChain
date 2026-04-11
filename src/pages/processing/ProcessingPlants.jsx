import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Badge } from '../../components/SharedUI';

const BASE = 'http://localhost:3001/api/processing';
const PM_URL = 'http://localhost:3001/api/processing/processing-managers-list';

const emptyForm = { manager_id: '', area: '', district: '', process_plants_type: '' };

const ProcessingPlants = () => {
  const [plants, setPlants] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const [p, m] = await Promise.all([axios.get(`${BASE}/plants`), axios.get(PM_URL)]);
      setPlants(p.data); setManagers(m.data);
    } catch { setPlants([]); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editingId) await axios.put(`${BASE}/plants/${editingId}`, form);
      else await axios.post(`${BASE}/plants`, form);
      setShowForm(false); setEditingId(null); setForm(emptyForm); load();
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const fi = k => e => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>🏭 Processing Plants</h2>
        <p>Manage processing facility locations and their assigned managers</p>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20, border: '1px solid var(--primary)' }}>
          <div className="section-header">
            <h3>{editingId ? '✏️ Edit Plant' : '➕ Add Processing Plant'}</h3>
            <button className="btn btn-outline btn-sm" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="three-col">
              <div className="form-group">
                <label>Manager</label>
                <select className="form-control" value={form.manager_id} onChange={fi('manager_id')} required>
                  <option value="">— Select Manager —</option>
                  {managers.map(m => <option key={m.user_id} value={m.user_id}>{m.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Area</label><input className="form-control" value={form.area} onChange={fi('area')} required /></div>
              <div className="form-group"><label>District</label><input className="form-control" value={form.district} onChange={fi('district')} required /></div>
            </div>
            <div className="form-group" style={{ maxWidth: 300 }}>
              <label>Plant Type</label>
              <select className="form-control" value={form.process_plants_type} onChange={fi('process_plants_type')}>
                <option value="">— Select —</option>
                <option>Milling</option><option>Packaging</option><option>Drying</option><option>Sorting</option><option>Cold Storage</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">{editingId ? '💾 Save' : '✅ Add Plant'}</button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="section-header">
          <h3>🏭 All Processing Plants</h3>
          {!showForm && <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}>+ Add Plant</button>}
        </div>
        <table>
          <thead><tr><th>#</th><th>Manager</th><th>Area</th><th>District</th><th>Plant Type</th><th>Actions</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan="6" style={{ textAlign: 'center' }}>Loading…</td></tr>}
            {!loading && plants.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center' }}>No plants found.</td></tr>}
            {plants.map(p => (
              <tr key={p.plant_id}>
                <td><strong>#{p.plant_id}</strong></td>
                <td>{p.manager_name}</td>
                <td>{p.area}</td>
                <td>{p.district}</td>
                <td><Badge text={p.process_plants_type || '—'} color="blue" /></td>
                <td>
                  <button className="btn btn-outline btn-sm" style={{ marginRight: 6 }} onClick={() => { setForm(p); setEditingId(p.plant_id); setShowForm(true); }}>Edit</button>
                  <button className="btn btn-amber btn-sm" onClick={async () => { if (!window.confirm('Delete?')) return; await axios.delete(`${BASE}/plants/${p.plant_id}`); load(); }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProcessingPlants;
