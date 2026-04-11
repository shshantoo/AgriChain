import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE = 'http://localhost:3001/api/processing';
const BATCHES_URL = 'http://localhost:3001/api/admin/batches-list';

const emptyForm = { batch_id: '', plant_id: '', processing_date: '' };

const BatchManagement = () => {
  const [records, setRecords] = useState([]);
  const [plants, setPlants] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const [r, p, b] = await Promise.all([axios.get(`${BASE}/batches`), axios.get(`${BASE}/plants-list`), axios.get(BATCHES_URL)]);
      setRecords(r.data); setPlants(p.data); setBatches(b.data);
    } catch { setRecords([]); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editingId) await axios.put(`${BASE}/batches/${editingId}`, form);
      else await axios.post(`${BASE}/batches`, form);
      setShowForm(false); setEditingId(null); setForm(emptyForm); load();
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const fi = k => e => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>📋 Batch Management</h2>
        <p>Create and manage processing batches — link harvest batches to processing plants</p>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20, border: '1px solid var(--primary)' }}>
          <div className="section-header">
            <h3>{editingId ? '✏️ Edit Processing Batch' : '➕ New Processing Batch'}</h3>
            <button className="btn btn-outline btn-sm" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="three-col">
              <div className="form-group">
                <label>Harvest Batch</label>
                <select className="form-control" value={form.batch_id} onChange={fi('batch_id')} required>
                  <option value="">— Select Batch —</option>
                  {batches.map(b => <option key={b.batch_id} value={b.batch_id}>#{b.batch_id} — {b.product_name} ({b.farmer_name})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Processing Plant</label>
                <select className="form-control" value={form.plant_id} onChange={fi('plant_id')} required>
                  <option value="">— Select Plant —</option>
                  {plants.map(p => <option key={p.plant_id} value={p.plant_id}>{p.area}, {p.district} ({p.process_plants_type || 'General'})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Processing Date</label>
                <input type="date" className="form-control" value={form.processing_date} onChange={fi('processing_date')} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">{editingId ? '💾 Save Changes' : '✅ Create Batch'}</button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="section-header">
          <h3>📋 Processing Batches</h3>
          {!showForm && <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}>+ New Batch</button>}
        </div>
        <table>
          <thead><tr><th>#</th><th>Product</th><th>Plant Location</th><th>Plant Type</th><th>Processing Date</th><th>Actions</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan="6" style={{ textAlign: 'center' }}>Loading…</td></tr>}
            {!loading && records.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center' }}>No processing batches found.</td></tr>}
            {records.map(r => (
              <tr key={r.processing_id}>
                <td><strong>#{r.processing_id}</strong></td>
                <td>{r.product_name}</td>
                <td>{r.plant_area}, {r.plant_district}</td>
                <td>{r.process_plants_type || '—'}</td>
                <td>{r.processing_date ? new Date(r.processing_date).toLocaleDateString() : '—'}</td>
                <td>
                  <button className="btn btn-outline btn-sm" style={{ marginRight: 6 }} onClick={() => { setForm({ batch_id: r.batch_id, plant_id: r.plant_id, processing_date: r.processing_date?.split('T')[0] || r.processing_date }); setEditingId(r.processing_id); setShowForm(true); }}>Edit</button>
                  <button className="btn btn-amber btn-sm" onClick={async () => { if (!window.confirm('Delete?')) return; await axios.delete(`${BASE}/batches/${r.processing_id}`); load(); }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BatchManagement;
