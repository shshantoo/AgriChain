// WarehouseList — re-exports the Warehouse management tab from InventoryManagement
// This is a dedicated page for warehouse CRUD accessible from the sidebar.
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WH_BASE = 'http://localhost:3001/api/warehouse';

const WarehouseList = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ area: '', district: '', capacity: '' });

  const load = async () => { setLoading(true); try { const r = await axios.get(`${WH_BASE}/warehouses`); setWarehouses(r.data); } catch { setWarehouses([]); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editingId) await axios.put(`${WH_BASE}/warehouses/${editingId}`, form);
      else await axios.post(`${WH_BASE}/warehouses`, form);
      setShowForm(false); setEditingId(null); setForm({ area: '', district: '', capacity: '' }); load();
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const fi = k => e => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>🏗️ Warehouses</h2>
        <p>Manage all warehouse locations and their capacity information</p>
      </div>
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
          <h3>🏗️ All Warehouses</h3>
          {!showForm && <button className="btn btn-primary" onClick={() => { setForm({ area: '', district: '', capacity: '' }); setEditingId(null); setShowForm(true); }}>+ Add Warehouse</button>}
        </div>
        <table>
          <thead><tr><th>#</th><th>Area</th><th>District</th><th>Capacity (t)</th><th>Actions</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan="5" style={{ textAlign: 'center' }}>Loading…</td></tr>}
            {!loading && warehouses.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>No warehouses found.</td></tr>}
            {warehouses.map(w => (
              <tr key={w.warehouse_id}>
                <td><strong>#{w.warehouse_id}</strong></td><td>{w.area}</td><td>{w.district}</td><td>{w.capacity} t</td>
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

export default WarehouseList;
