import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Badge } from '../../components/SharedUI';

const MKT_BASE = 'http://localhost:3001/api/market';
const BATCHES_URL = 'http://localhost:3001/api/admin/batches-list';
const PRODUCTS_URL = 'http://localhost:3001/api/product';

// ── Markets Tab ────────────────────────────────────────────────
const MarketsTab = () => {
  const [markets, setMarkets] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ operator_id: '', city: '', zone: '', market_type: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [m, o] = await Promise.all([axios.get(`${MKT_BASE}/markets`), axios.get(`${MKT_BASE}/market-operators-list`)]);
      setMarkets(m.data); setOperators(o.data);
    } catch { setMarkets([]); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editingId) await axios.put(`${MKT_BASE}/markets/${editingId}`, form);
      else await axios.post(`${MKT_BASE}/markets`, form);
      setShowForm(false); setEditingId(null); setForm({ operator_id: '', city: '', zone: '', market_type: '' }); load();
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const fi = k => e => setForm({ ...form, [k]: e.target.value });

  return (
    <div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20, border: '1px solid var(--primary)' }}>
          <div className="section-header"><h3>{editingId ? '✏️ Edit Market' : '➕ Add Market'}</h3>
            <button className="btn btn-outline btn-sm" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</button></div>
          <form onSubmit={handleSubmit}>
            <div className="three-col">
              <div className="form-group"><label>Operator</label>
                <select className="form-control" value={form.operator_id} onChange={fi('operator_id')} required>
                  <option value="">— Select —</option>
                  {operators.map(o => <option key={o.user_id} value={o.user_id}>{o.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>City</label><input className="form-control" value={form.city} onChange={fi('city')} required /></div>
              <div className="form-group"><label>Zone</label><input className="form-control" value={form.zone} onChange={fi('zone')} /></div>
            </div>
            <div className="form-group" style={{ maxWidth: 250 }}><label>Market Type</label>
              <select className="form-control" value={form.market_type} onChange={fi('market_type')}>
                <option value="">— Select —</option><option>Wholesale</option><option>Retail</option><option>Export</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">{editingId ? '💾 Save' : '✅ Add Market'}</button>
          </form>
        </div>
      )}
      <div className="card">
        <div className="section-header"><h3>🏪 Markets</h3>
          {!showForm && <button className="btn btn-primary" onClick={() => { setForm({ operator_id: '', city: '', zone: '', market_type: '' }); setEditingId(null); setShowForm(true); }}>+ Add Market</button>}
        </div>
        <table>
          <thead><tr><th>#</th><th>Operator</th><th>City</th><th>Zone</th><th>Type</th><th>Actions</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan="6" style={{ textAlign: 'center' }}>Loading…</td></tr>}
            {!loading && markets.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center' }}>No markets.</td></tr>}
            {markets.map(m => (
              <tr key={m.market_id}>
                <td><strong>#{m.market_id}</strong></td><td>{m.operator_name}</td><td>{m.city}</td><td>{m.zone || '—'}</td>
                <td><Badge text={m.market_type || '—'} color="blue" /></td>
                <td>
                  <button className="btn btn-outline btn-sm" style={{ marginRight: 6 }} onClick={() => { setForm(m); setEditingId(m.market_id); setShowForm(true); }}>Edit</button>
                  <button className="btn btn-amber btn-sm" onClick={async () => { if (!window.confirm('Delete?')) return; await axios.delete(`${MKT_BASE}/markets/${m.market_id}`); load(); }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Sales Tab ──────────────────────────────────────────────────
const SalesTab = () => {
  const [sales, setSales] = useState([]);
  const [batches, setBatches] = useState([]);
  const [products, setProducts] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ batch_id: '', product_id: '', market_id: '', sale_date: '', sale_price: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [s, b, p, m] = await Promise.all([axios.get(`${MKT_BASE}/sales`), axios.get(BATCHES_URL), axios.get(PRODUCTS_URL), axios.get(`${MKT_BASE}/markets-list`)]);
      setSales(s.data); setBatches(b.data); setProducts(p.data); setMarkets(m.data);
    } catch { setSales([]); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.sale_price || form.sale_price <= 0) return alert('Sale price must be positive');
    try {
      if (editingId) await axios.put(`${MKT_BASE}/sales/${editingId}`, form);
      else await axios.post(`${MKT_BASE}/sales`, form);
      setShowForm(false); setEditingId(null); setForm({ batch_id: '', product_id: '', market_id: '', sale_date: '', sale_price: '' }); load();
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const fi = k => e => setForm({ ...form, [k]: e.target.value });

  return (
    <div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20, border: '1px solid var(--primary)' }}>
          <div className="section-header"><h3>{editingId ? '✏️ Edit Sale' : '➕ Record Sale'}</h3>
            <button className="btn btn-outline btn-sm" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</button></div>
          <form onSubmit={handleSubmit}>
            <div className="three-col">
              <div className="form-group"><label>Harvest Batch</label>
                <select className="form-control" value={form.batch_id} onChange={fi('batch_id')} required>
                  <option value="">— Select Batch —</option>
                  {batches.map(b => <option key={b.batch_id} value={b.batch_id}>#{b.batch_id} — {b.product_name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Product</label>
                <select className="form-control" value={form.product_id} onChange={fi('product_id')} required>
                  <option value="">— Select Product —</option>
                  {products.map(p => <option key={p.product_id} value={p.product_id}>{p.product_name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Market</label>
                <select className="form-control" value={form.market_id} onChange={fi('market_id')} required>
                  <option value="">— Select Market —</option>
                  {markets.map(m => <option key={m.market_id} value={m.market_id}>{m.city}, {m.zone}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group"><label>Sale Date</label><input type="date" className="form-control" value={form.sale_date} onChange={fi('sale_date')} required /></div>
              <div className="form-group"><label>Sale Price (৳)</label><input type="number" step="0.01" min="0.01" className="form-control" value={form.sale_price} onChange={fi('sale_price')} required /></div>
            </div>
            <button type="submit" className="btn btn-primary">{editingId ? '💾 Save' : '✅ Record Sale'}</button>
          </form>
        </div>
      )}
      <div className="card">
        <div className="section-header"><h3>💰 Sales Records</h3>
          {!showForm && <button className="btn btn-primary" onClick={() => { setForm({ batch_id: '', product_id: '', market_id: '', sale_date: '', sale_price: '' }); setEditingId(null); setShowForm(true); }}>+ Record Sale</button>}
        </div>
        <table>
          <thead><tr><th>#</th><th>Product</th><th>Market</th><th>Sale Date</th><th>Sale Price</th><th>Actions</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan="6" style={{ textAlign: 'center' }}>Loading…</td></tr>}
            {!loading && sales.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center' }}>No sales recorded.</td></tr>}
            {sales.map(s => (
              <tr key={s.sale_id}>
                <td><strong>#{s.sale_id}</strong></td><td>{s.product_name}</td>
                <td>{s.market_city}, {s.market_zone}</td>
                <td>{s.sale_date ? new Date(s.sale_date).toLocaleDateString() : '—'}</td>
                <td><strong>৳ {parseFloat(s.sale_price).toLocaleString()}</strong></td>
                <td>
                  <button className="btn btn-outline btn-sm" style={{ marginRight: 6 }} onClick={() => { setForm({ ...s, sale_date: s.sale_date?.split('T')[0] || s.sale_date }); setEditingId(s.sale_id); setShowForm(true); }}>Edit</button>
                  <button className="btn btn-amber btn-sm" onClick={async () => { if (!window.confirm('Delete?')) return; await axios.delete(`${MKT_BASE}/sales/${s.sale_id}`); load(); }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────
const SalesManagement = () => {
  const [tab, setTab] = useState('sales');
  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>💰 Market & Sales</h2>
        <p>Manage market locations and record all sales transactions</p>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['sales', '💰 Sales Records'], ['markets', '🏪 Markets']].map(([t, l]) => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab(t)}>{l}</button>
        ))}
      </div>
      {tab === 'sales' ? <SalesTab /> : <MarketsTab />}
    </div>
  );
};

export default SalesManagement;
