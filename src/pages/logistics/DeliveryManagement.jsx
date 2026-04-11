import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Badge } from '../../components/SharedUI';

const BASE = 'http://localhost:3001/api/delivery';
const BATCHES_URL = 'http://localhost:3001/api/admin/batches-list';
const MARKETS_URL = 'http://localhost:3001/api/market/markets-list';
const LM_URL = 'http://localhost:3001/api/delivery/logistics-managers-list';

const emptyForm = { batch_id: '', market_id: '', logistics_manager_id: '', source_area: '', source_district: '', destination_area: '', destination_district: '', status: 'Pending', transport_date: '' };

const DeliveryManagement = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [batches, setBatches] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [lms, setLms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const [d, b, m, l] = await Promise.all([axios.get(BASE), axios.get(BATCHES_URL), axios.get(MARKETS_URL), axios.get(LM_URL)]);
      setDeliveries(d.data); setBatches(b.data); setMarkets(m.data); setLms(l.data);
    } catch { setDeliveries([]); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editingId) await axios.put(`${BASE}/${editingId}`, form);
      else await axios.post(BASE, form);
      setShowForm(false); setEditingId(null); setForm(emptyForm); load();
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const openEdit = rec => {
    setForm({ ...rec, transport_date: rec.transport_date?.split('T')[0] || '' });
    setEditingId(rec.delivery_id); setShowForm(true);
  };

  const fi = k => e => setForm({ ...form, [k]: e.target.value });
  const statusColor = s => s === 'Delivered' ? 'green' : s === 'In Transit' ? 'blue' : s === 'Pending' ? 'amber' : 'red';

  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>🚚 Delivery Management</h2>
        <p>Track and manage all deliveries from warehouses to markets</p>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20, border: '1px solid var(--primary)' }}>
          <div className="section-header">
            <h3>{editingId ? '✏️ Edit Delivery' : '➕ New Delivery'}</h3>
            <button className="btn btn-outline btn-sm" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="three-col">
              <div className="form-group"><label>Harvest Batch</label>
                <select className="form-control" value={form.batch_id} onChange={fi('batch_id')} required>
                  <option value="">— Select Batch —</option>
                  {batches.map(b => <option key={b.batch_id} value={b.batch_id}>#{b.batch_id} — {b.product_name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Market</label>
                <select className="form-control" value={form.market_id} onChange={fi('market_id')} required>
                  <option value="">— Select Market —</option>
                  {markets.map(m => <option key={m.market_id} value={m.market_id}>{m.city}, {m.zone} ({m.market_type || 'Market'})</option>)}
                </select>
              </div>
              <div className="form-group"><label>Logistics Manager</label>
                <select className="form-control" value={form.logistics_manager_id} onChange={fi('logistics_manager_id')} required>
                  <option value="">— Select LM —</option>
                  {lms.map(l => <option key={l.user_id} value={l.user_id}>{l.name} {l.transport_unit ? `(${l.transport_unit})` : ''}</option>)}
                </select>
              </div>
            </div>
            <div className="three-col">
              <div className="form-group"><label>Source Area</label><input className="form-control" value={form.source_area} onChange={fi('source_area')} /></div>
              <div className="form-group"><label>Source District</label><input className="form-control" value={form.source_district} onChange={fi('source_district')} /></div>
              <div className="form-group"><label>Transport Date</label><input type="date" className="form-control" value={form.transport_date} onChange={fi('transport_date')} /></div>
            </div>
            <div className="three-col">
              <div className="form-group"><label>Destination Area</label><input className="form-control" value={form.destination_area} onChange={fi('destination_area')} /></div>
              <div className="form-group"><label>Destination District</label><input className="form-control" value={form.destination_district} onChange={fi('destination_district')} /></div>
              <div className="form-group"><label>Status</label>
                <select className="form-control" value={form.status} onChange={fi('status')}>
                  <option>Pending</option><option>In Transit</option><option>Delivered</option><option>Cancelled</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">{editingId ? '💾 Save Changes' : '✅ Create Delivery'}</button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="section-header">
          <h3>📋 All Deliveries</h3>
          {!showForm && <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}>+ New Delivery</button>}
        </div>
        <table>
          <thead><tr><th>#</th><th>Product</th><th>Market</th><th>LM</th><th>From</th><th>To</th><th>Transport Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan="9" style={{ textAlign: 'center' }}>Loading…</td></tr>}
            {!loading && deliveries.length === 0 && <tr><td colSpan="9" style={{ textAlign: 'center' }}>No deliveries found.</td></tr>}
            {deliveries.map(d => (
              <tr key={d.delivery_id}>
                <td><strong>#{d.delivery_id}</strong></td>
                <td>{d.product_name}</td>
                <td>{d.market_city}, {d.market_zone}</td>
                <td>{d.logistics_manager_name}</td>
                <td>{d.source_area}, {d.source_district}</td>
                <td>{d.destination_area}, {d.destination_district}</td>
                <td>{d.transport_date ? new Date(d.transport_date).toLocaleDateString() : '—'}</td>
                <td><Badge text={d.status} color={statusColor(d.status)} /></td>
                <td>
                  <button className="btn btn-outline btn-sm" style={{ marginRight: 6 }} onClick={() => openEdit(d)}>Edit</button>
                  <button className="btn btn-amber btn-sm" onClick={async () => { if (!window.confirm('Delete?')) return; await axios.delete(`${BASE}/${d.delivery_id}`); load(); }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeliveryManagement;
