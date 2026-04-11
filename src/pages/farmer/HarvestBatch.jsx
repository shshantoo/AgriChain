import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Badge } from '../../components/SharedUI';

const BASE_F = 'http://localhost:3001/api/farmer';
const BASE_P = 'http://localhost:3001/api/product';

const emptyForm = { farmer_id: '', product_id: '', harvest_date: '', quantity: '', quality_grade: 'Grade A' };

const HarvestBatch = () => {
  const [records, setRecords] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const [r, f, p] = await Promise.all([
        axios.get(`${BASE_F}/harvest`),
        axios.get(`${BASE_F}/farmers-list`),
        axios.get(BASE_P)
      ]);
      setRecords(r.data); setFarmers(f.data); setProducts(p.data);
    } catch { setRecords([]); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };
  const openEdit = rec => {
    setForm({ ...rec, harvest_date: rec.harvest_date?.split('T')[0] || rec.harvest_date });
    setEditingId(rec.batch_id); setShowForm(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.quantity <= 0) return alert('Quantity must be positive');
    try {
      if (editingId) await axios.put(`${BASE_F}/harvest/${editingId}`, form);
      else await axios.post(`${BASE_F}/harvest`, form);
      setShowForm(false); setEditingId(null); setForm(emptyForm); load();
    } catch (err) { alert(err.response?.data?.error || 'Failed to save'); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this harvest batch?')) return;
    try { await axios.delete(`${BASE_F}/harvest/${id}`); load(); }
    catch { alert('Delete failed'); }
  };

  const f = k => e => setForm({ ...form, [k]: e.target.value });

  const gradeColor = g => g?.includes('A') ? 'green' : g?.includes('B') ? 'amber' : 'red';

  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>🌾 Harvest Batches</h2>
        <p>Create and manage harvest batches linked to farmers and product types</p>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20, border: '1px solid var(--primary)' }}>
          <div className="section-header">
            <h3>{editingId ? '✏️ Edit Harvest Batch' : '➕ New Harvest Batch'}</h3>
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
                <label>Product</label>
                <select className="form-control" value={form.product_id} onChange={f('product_id')} required>
                  <option value="">— Select Product —</option>
                  {products.map(p => <option key={p.product_id} value={p.product_id}>{p.product_name} ({p.category || 'N/A'})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Harvest Date</label>
                <input type="date" className="form-control" value={form.harvest_date} onChange={f('harvest_date')} required />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Quantity (tonnes)</label>
                <input type="number" step="0.01" min="0.01" className="form-control" value={form.quantity} onChange={f('quantity')} required />
              </div>
              <div className="form-group">
                <label>Quality Grade</label>
                <select className="form-control" value={form.quality_grade} onChange={f('quality_grade')}>
                  <option>Grade A</option><option>Grade B</option><option>Grade C</option><option>Reject</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">{editingId ? '💾 Save Changes' : '✅ Create Batch'}</button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="section-header">
          <h3>📋 All Harvest Batches</h3>
          {!showForm && <button className="btn btn-primary" onClick={openCreate}>+ New Batch</button>}
        </div>
        <table>
          <thead><tr><th>Batch #</th><th>Farmer</th><th>Product</th><th>Harvest Date</th><th>Qty (t)</th><th>Grade</th><th>Actions</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan="7" style={{ textAlign: 'center' }}>Loading…</td></tr>}
            {!loading && records.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center' }}>No harvest batches found.</td></tr>}
            {records.map(r => (
              <tr key={r.batch_id}>
                <td><strong>#{r.batch_id}</strong></td>
                <td>{r.farmer_name}</td>
                <td>{r.product_name}</td>
                <td>{r.harvest_date ? new Date(r.harvest_date).toLocaleDateString() : '—'}</td>
                <td>{r.quantity}</td>
                <td><Badge text={r.quality_grade || '—'} color={gradeColor(r.quality_grade)} /></td>
                <td>
                  <button className="btn btn-outline btn-sm" style={{ marginRight: 6 }} onClick={() => openEdit(r)}>Edit</button>
                  <button className="btn btn-amber btn-sm" onClick={() => handleDelete(r.batch_id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HarvestBatch;
