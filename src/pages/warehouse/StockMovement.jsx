import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Badge } from '../../components/SharedUI';

const WH_BASE = 'http://localhost:3001/api/warehouse';
const BATCHES_URL = 'http://localhost:3001/api/admin/batches-list';

const emptyForm = { batch_id: '', warehouse_id: '', movement_date: '', quantity_removed: '', from_location: '', to_location: '', movement_type: 'Transfer' };

const StockMovement = () => {
  const [records, setRecords] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const [r, w, b] = await Promise.all([
        axios.get(`${WH_BASE}/stock-movement`),
        axios.get(`${WH_BASE}/warehouses-list`),
        axios.get(BATCHES_URL)
      ]);
      setRecords(r.data); setWarehouses(w.data); setBatches(b.data);
    } catch { setRecords([]); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };
  const openEdit = rec => {
    setForm({ ...rec, movement_date: rec.movement_date?.split('T')[0] || '' });
    setEditingId(rec.movement_id); setShowForm(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editingId) await axios.put(`${WH_BASE}/stock-movement/${editingId}`, form);
      else await axios.post(`${WH_BASE}/stock-movement`, form);
      setShowForm(false); setEditingId(null); setForm(emptyForm); load();
    } catch (err) { alert(err.response?.data?.error || 'Failed to save'); }
  };

  const fi = k => e => setForm({ ...form, [k]: e.target.value });

  const typeColor = t => t === 'Transfer' ? 'blue' : t === 'Dispatch' ? 'green' : t === 'Return' ? 'amber' : 'green';

  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>🔄 Stock Movement</h2>
        <p>Track all stock movements between warehouses and dispatch locations</p>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20, border: '1px solid var(--primary)' }}>
          <div className="section-header">
            <h3>{editingId ? '✏️ Edit Movement' : '➕ New Movement'}</h3>
            <button className="btn btn-outline btn-sm" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="three-col">
              <div className="form-group">
                <label>Harvest Batch</label>
                <select className="form-control" value={form.batch_id} onChange={fi('batch_id')} required>
                  <option value="">— Select Batch —</option>
                  {batches.map(b => <option key={b.batch_id} value={b.batch_id}>#{b.batch_id} — {b.product_name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Warehouse</label>
                <select className="form-control" value={form.warehouse_id} onChange={fi('warehouse_id')} required>
                  <option value="">— Select Warehouse —</option>
                  {warehouses.map(w => <option key={w.warehouse_id} value={w.warehouse_id}>{w.area}, {w.district}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Movement Date</label>
                <input type="date" className="form-control" value={form.movement_date} onChange={fi('movement_date')} required />
              </div>
            </div>
            <div className="three-col">
              <div className="form-group">
                <label>Quantity Removed (t)</label>
                <input type="number" step="0.01" min="0.01" className="form-control" value={form.quantity_removed} onChange={fi('quantity_removed')} required />
              </div>
              <div className="form-group">
                <label>From Location</label>
                <input className="form-control" value={form.from_location} onChange={fi('from_location')} placeholder="e.g. Bay A" />
              </div>
              <div className="form-group">
                <label>To Location</label>
                <input className="form-control" value={form.to_location} onChange={fi('to_location')} placeholder="e.g. Market Gate 3" />
              </div>
            </div>
            <div className="form-group" style={{ maxWidth: 200 }}>
              <label>Movement Type</label>
              <select className="form-control" value={form.movement_type} onChange={fi('movement_type')}>
                <option>Transfer</option><option>Dispatch</option><option>Return</option><option>Loss</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">{editingId ? '💾 Save Changes' : '✅ Record Movement'}</button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="section-header">
          <h3>📋 Movement History</h3>
          {!showForm && <button className="btn btn-primary" onClick={openCreate}>+ Add Movement</button>}
        </div>
        <table>
          <thead><tr><th>#</th><th>Product</th><th>Warehouse</th><th>Qty Removed</th><th>From</th><th>To</th><th>Type</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan="9" style={{ textAlign: 'center' }}>Loading…</td></tr>}
            {!loading && records.length === 0 && <tr><td colSpan="9" style={{ textAlign: 'center' }}>No movements found.</td></tr>}
            {records.map(r => (
              <tr key={r.movement_id}>
                <td><strong>#{r.movement_id}</strong></td>
                <td>{r.product_name}</td>
                <td>{r.warehouse_area}, {r.warehouse_district}</td>
                <td>{r.quantity_removed} t</td>
                <td>{r.from_location || '—'}</td>
                <td>{r.to_location || '—'}</td>
                <td><Badge text={r.movement_type || '—'} color={typeColor(r.movement_type)} /></td>
                <td>{r.movement_date ? new Date(r.movement_date).toLocaleDateString() : '—'}</td>
                <td>
                  <button className="btn btn-outline btn-sm" style={{ marginRight: 6 }} onClick={() => openEdit(r)}>Edit</button>
                  <button className="btn btn-amber btn-sm" onClick={async () => { if (!window.confirm('Delete?')) return; await axios.delete(`${WH_BASE}/stock-movement/${r.movement_id}`); load(); }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockMovement;
