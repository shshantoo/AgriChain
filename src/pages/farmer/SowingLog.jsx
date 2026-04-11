import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Badge } from '../../components/SharedUI';

const BASE = 'http://localhost:3001/api/farmer';

const emptySowing = { farmer_id: '', sowing_date: '', expected_harvest_date: '', seed_type: '', used_quantity: '' };

const SowingLog = () => {
  const [records, setRecords] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptySowing);

  const load = async () => {
    setLoading(true);
    try {
      const [r, f] = await Promise.all([axios.get(`${BASE}/sowing`), axios.get(`${BASE}/farmers-list`)]);
      setRecords(r.data); setFarmers(f.data);
    } catch { setRecords([]); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptySowing); setEditingId(null); setShowForm(true); };
  const openEdit = rec => {
    setForm({
      ...rec,
      sowing_date: rec.sowing_date?.split('T')[0] || rec.sowing_date,
      expected_harvest_date: rec.expected_harvest_date?.split('T')[0] || rec.expected_harvest_date
    });
    setEditingId(rec.sowing_id); setShowForm(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editingId) await axios.put(`${BASE}/sowing/${editingId}`, form);
      else await axios.post(`${BASE}/sowing`, form);
      setShowForm(false); setEditingId(null); setForm(emptySowing); load();
    } catch (err) { alert(err.response?.data?.error || 'Failed to save'); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this sowing log?')) return;
    try { await axios.delete(`${BASE}/sowing/${id}`); load(); }
    catch { alert('Delete failed'); }
  };

  const f = k => e => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>🌱 Sowing Logs</h2>
        <p>Record and manage all sowing activities with seed type and expected harvest dates</p>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20, border: '1px solid var(--primary)' }}>
          <div className="section-header">
            <h3>{editingId ? '✏️ Edit Sowing Log' : '➕ New Sowing Log'}</h3>
            <button className="btn btn-outline btn-sm" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="three-col">
              <div className="form-group">
                <label>Farmer</label>
                <select className="form-control" value={form.farmer_id} onChange={f('farmer_id')} required>
                  <option value="">— Select Farmer —</option>
                  {farmers.map(fa => <option key={fa.user_id} value={fa.user_id}>{fa.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Seed Type</label>
                <input className="form-control" value={form.seed_type} onChange={f('seed_type')} placeholder="e.g. Hybrid Paddy BR-28" required />
              </div>
              <div className="form-group">
                <label>Used Quantity (kg)</label>
                <input type="number" step="0.01" className="form-control" value={form.used_quantity} onChange={f('used_quantity')} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Sowing Date</label>
                <input type="date" className="form-control" value={form.sowing_date} onChange={f('sowing_date')} required />
              </div>
              <div className="form-group">
                <label>Expected Harvest Date</label>
                <input type="date" className="form-control" value={form.expected_harvest_date} onChange={f('expected_harvest_date')} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">{editingId ? '💾 Save Changes' : '✅ Create Log'}</button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="section-header">
          <h3>📋 All Sowing Logs</h3>
          {!showForm && <button className="btn btn-primary" onClick={openCreate}>+ Add Log</button>}
        </div>
        <table>
          <thead><tr><th>#</th><th>Farmer</th><th>Seed Type</th><th>Qty (kg)</th><th>Sowing Date</th><th>Expected Harvest</th><th>Actions</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan="7" style={{ textAlign: 'center' }}>Loading…</td></tr>}
            {!loading && records.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center' }}>No sowing logs found.</td></tr>}
            {records.map(r => (
              <tr key={r.sowing_id}>
                <td><strong>#{r.sowing_id}</strong></td>
                <td>{r.farmer_name}</td>
                <td>{r.seed_type}</td>
                <td>{r.used_quantity ?? '—'}</td>
                <td>{r.sowing_date ? new Date(r.sowing_date).toLocaleDateString() : '—'}</td>
                <td>{r.expected_harvest_date ? new Date(r.expected_harvest_date).toLocaleDateString() : '—'}</td>
                <td>
                  <button className="btn btn-outline btn-sm" style={{ marginRight: 6 }} onClick={() => openEdit(r)}>Edit</button>
                  <button className="btn btn-amber btn-sm" onClick={() => handleDelete(r.sowing_id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SowingLog;
