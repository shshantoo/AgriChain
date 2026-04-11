import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Badge } from '../../components/SharedUI';

const WH_BASE = 'http://localhost:3001/api/warehouse';
const BATCHES_URL = 'http://localhost:3001/api/admin/batches-list';

const emptyWarehouse = { area: '', district: '', capacity: '' };
const emptyInventory = { batch_id: '', warehouse_id: '', quantity: '', shelf_life: '', remaining_shelf_life: '', packaging_details: '', reorder_level: '', max_stock_level: '', stock_status: 'In Stock' };

// ── Warehouses Tab ─────────────────────────────────────────────
const WarehousesTab = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyWarehouse);

  const load = async () => { setLoading(true); try { const r = await axios.get(`${WH_BASE}/warehouses`); setWarehouses(r.data); } catch { setWarehouses([]); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editingId) await axios.put(`${WH_BASE}/warehouses/${editingId}`, form);
      else await axios.post(`${WH_BASE}/warehouses`, form);
      setShowForm(false); setEditingId(null); setForm(emptyWarehouse); load();
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const fi = k => e => setForm({ ...form, [k]: e.target.value });

  return (
    <div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20, border: '1px solid var(--primary)' }}>
          <div className="section-header">
            <h3>{editingId ? '✏️ Edit Warehouse' : '➕ Add Warehouse'}</h3>
            <button className="btn btn-outline btn-sm" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="three-col">
              <div className="form-group"><label>Area</label><input className="form-control" value={form.area} onChange={fi('area')} required /></div>
              <div className="form-group"><label>District</label><input className="form-control" value={form.district} onChange={fi('district')} required /></div>
              <div className="form-group"><label>Capacity (tonnes)</label><input type="number" step="0.01" className="form-control" value={form.capacity} onChange={fi('capacity')} required /></div>
            </div>
            <button type="submit" className="btn btn-primary">{editingId ? '💾 Save' : '✅ Add Warehouse'}</button>
          </form>
        </div>
      )}
      <div className="card">
        <div className="section-header">
          <h3>🏗️ Warehouses</h3>
          {!showForm && <button className="btn btn-primary" onClick={() => { setForm(emptyWarehouse); setEditingId(null); setShowForm(true); }}>+ Add Warehouse</button>}
        </div>
        <table>
          <thead><tr><th>#</th><th>Area</th><th>District</th><th>Capacity (t)</th><th>Actions</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan="5" style={{ textAlign: 'center' }}>Loading…</td></tr>}
            {!loading && warehouses.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>No warehouses found.</td></tr>}
            {warehouses.map(w => (
              <tr key={w.warehouse_id}>
                <td><strong>#{w.warehouse_id}</strong></td><td>{w.area}</td><td>{w.district}</td><td>{w.capacity}</td>
                <td>
                  <button className="btn btn-outline btn-sm" style={{ marginRight: 6 }} onClick={() => { setForm(w); setEditingId(w.warehouse_id); setShowForm(true); }}>Edit</button>
                  <button className="btn btn-amber btn-sm" onClick={async () => { if (!window.confirm('Delete?')) return; await axios.delete(`${WH_BASE}/warehouses/${w.warehouse_id}`); load(); }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Inventory Tab ──────────────────────────────────────────────
const InventoryTab = () => {
  const [inventory, setInventory] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyInventory);

  const load = async () => {
    setLoading(true);
    try {
      const [r, w, b] = await Promise.all([axios.get(`${WH_BASE}/inventory`), axios.get(`${WH_BASE}/warehouses-list`), axios.get(BATCHES_URL)]);
      setInventory(r.data); setWarehouses(w.data); setBatches(b.data);
    } catch { setInventory([]); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editingId) await axios.put(`${WH_BASE}/inventory/${editingId}`, form);
      else await axios.post(`${WH_BASE}/inventory`, form);
      setShowForm(false); setEditingId(null); setForm(emptyInventory); load();
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const fi = k => e => setForm({ ...form, [k]: e.target.value });
  const statusColor = s => s === 'In Stock' ? 'green' : s === 'Low Stock' ? 'amber' : 'red';

  return (
    <div>
      {showForm && (
        <div className="card" style={{ marginBottom: 20, border: '1px solid var(--primary)' }}>
          <div className="section-header">
            <h3>{editingId ? '✏️ Edit Inventory' : '➕ Add Inventory Entry'}</h3>
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
                <label>Warehouse</label>
                <select className="form-control" value={form.warehouse_id} onChange={fi('warehouse_id')} required>
                  <option value="">— Select Warehouse —</option>
                  {warehouses.map(w => <option key={w.warehouse_id} value={w.warehouse_id}>{w.area}, {w.district} (Cap: {w.capacity}t)</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Quantity (tonnes)</label>
                <input type="number" step="0.01" min="0.01" className="form-control" value={form.quantity} onChange={fi('quantity')} required />
              </div>
            </div>
            <div className="three-col">
              <div className="form-group"><label>Shelf Life (days)</label><input type="number" className="form-control" value={form.shelf_life} onChange={fi('shelf_life')} /></div>
              <div className="form-group"><label>Remaining Shelf Life</label><input type="number" className="form-control" value={form.remaining_shelf_life} onChange={fi('remaining_shelf_life')} /></div>
              <div className="form-group"><label>Packaging Details</label><input className="form-control" value={form.packaging_details} onChange={fi('packaging_details')} /></div>
            </div>
            <div className="three-col">
              <div className="form-group"><label>Reorder Level (t)</label><input type="number" step="0.01" className="form-control" value={form.reorder_level} onChange={fi('reorder_level')} /></div>
              <div className="form-group"><label>Max Stock Level (t)</label><input type="number" step="0.01" className="form-control" value={form.max_stock_level} onChange={fi('max_stock_level')} /></div>
              <div className="form-group"><label>Stock Status</label>
                <select className="form-control" value={form.stock_status} onChange={fi('stock_status')}>
                  <option>In Stock</option><option>Low Stock</option><option>Critical</option><option>Out of Stock</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">{editingId ? '💾 Save' : '✅ Add Entry'}</button>
          </form>
        </div>
      )}
      <div className="card">
        <div className="section-header">
          <h3>📦 Inventory Register</h3>
          {!showForm && <button className="btn btn-primary" onClick={() => { setForm(emptyInventory); setEditingId(null); setShowForm(true); }}>+ Add Entry</button>}
        </div>
        <table>
          <thead><tr><th>#</th><th>Product</th><th>Warehouse</th><th>Qty (t)</th><th>Shelf Life</th><th>Reorder Level</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan="8" style={{ textAlign: 'center' }}>Loading…</td></tr>}
            {!loading && inventory.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center' }}>No inventory found.</td></tr>}
            {inventory.map(i => (
              <tr key={i.inventory_id}>
                <td><strong>#{i.inventory_id}</strong></td>
                <td>{i.product_name}</td>
                <td>{i.warehouse_area}, {i.warehouse_district}</td>
                <td>{i.quantity}</td>
                <td>{i.shelf_life ?? '—'} days</td>
                <td>{i.reorder_level ?? '—'} t</td>
                <td><Badge text={i.stock_status || 'In Stock'} color={statusColor(i.stock_status)} /></td>
                <td>
                  <button className="btn btn-outline btn-sm" style={{ marginRight: 6 }} onClick={() => { setForm(i); setEditingId(i.inventory_id); setShowForm(true); }}>Edit</button>
                  <button className="btn btn-amber btn-sm" onClick={async () => { if (!window.confirm('Delete?')) return; await axios.delete(`${WH_BASE}/inventory/${i.inventory_id}`); load(); }}>Delete</button>
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
const InventoryManagement = () => {
  const [tab, setTab] = useState('inventory');
  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>📦 Inventory Management</h2>
        <p>Manage warehouse locations and linked inventory stock</p>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[['inventory', '📦 Inventory'], ['warehouses', '🏗️ Warehouses']].map(([t, l]) => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab(t)}>{l}</button>
        ))}
      </div>
      {tab === 'inventory' ? <InventoryTab /> : <WarehousesTab />}
    </div>
  );
};

export default InventoryManagement;
