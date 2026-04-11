import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Badge } from '../../components/SharedUI';

const BASE = 'http://localhost:3001/api/supplier';
const FARMER_URL = 'http://localhost:3001/api/farmer/farmers-list';
const SUPPLIER_URL = 'http://localhost:3001/api/supplier/suppliers-list';

const emptyForm = {
  farmer_id: '', supplier_id: '', input_type: '', quantity: '',
  supply_date: '', cost: '', procurement_schedule: '',
  current_stock_level: '', usage_rate: ''
};

const InputSupplyManagement = () => {
  const [records, setRecords] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const [r, f, s] = await Promise.all([
        axios.get(`${BASE}/input-supply`),
        axios.get(FARMER_URL),
        axios.get(SUPPLIER_URL)
      ]);
      setRecords(r.data); setFarmers(f.data); setSuppliers(s.data);
    } catch { setRecords([]); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };
  const openEdit = rec => {
    setForm({
      ...rec,
      supply_date: rec.supply_date?.split('T')[0] || '',
      procurement_schedule: rec.procurement_schedule?.split('T')[0] || ''
    });
    setEditingId(rec.supply_id); setShowForm(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editingId) await axios.put(`${BASE}/input-supply/${editingId}`, form);
      else await axios.post(`${BASE}/input-supply`, form);
      setShowForm(false); setEditingId(null); setForm(emptyForm); load();
    } catch (err) { alert(err.response?.data?.error || 'Failed to save'); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this supply record?')) return;
    try { await axios.delete(`${BASE}/input-supply/${id}`); load(); }
    catch { alert('Delete failed'); }
  };

  const fi = k => e => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>📦 Input Supply Management</h2>
        <p>Record and manage all input supply deliveries to farmers</p>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20, border: '1px solid var(--primary)' }}>
          <div className="section-header">
            <h3>{editingId ? '✏️ Edit Supply Record' : '➕ New Supply Record'}</h3>
            <button className="btn btn-outline btn-sm" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="three-col">
              <div className="form-group">
                <label>Supplier</label>
                <select className="form-control" value={form.supplier_id} onChange={fi('supplier_id')} required>
                  <option value="">— Select Supplier —</option>
                  {suppliers.map(s => <option key={s.user_id} value={s.user_id}>{s.name} {s.company_name ? `(${s.company_name})` : ''}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Farmer (Recipient)</label>
                <select className="form-control" value={form.farmer_id} onChange={fi('farmer_id')} required>
                  <option value="">— Select Farmer —</option>
                  {farmers.map(fa => <option key={fa.user_id} value={fa.user_id}>{fa.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Input Type</label>
                <input className="form-control" value={form.input_type} onChange={fi('input_type')} placeholder="e.g. Fertiliser, Seeds" required />
              </div>
            </div>
            <div className="three-col">
              <div className="form-group">
                <label>Quantity</label>
                <input type="number" step="0.01" className="form-control" value={form.quantity} onChange={fi('quantity')} required />
              </div>
              <div className="form-group">
                <label>Supply Date</label>
                <input type="date" className="form-control" value={form.supply_date} onChange={fi('supply_date')} required />
              </div>
              <div className="form-group">
                <label>Cost (৳)</label>
                <input type="number" step="0.01" className="form-control" value={form.cost} onChange={fi('cost')} />
              </div>
            </div>
            <div className="three-col">
              <div className="form-group">
                <label>Procurement Schedule</label>
                <input type="date" className="form-control" value={form.procurement_schedule} onChange={fi('procurement_schedule')} />
              </div>
              <div className="form-group">
                <label>Current Stock Level</label>
                <input type="number" step="0.01" className="form-control" value={form.current_stock_level} onChange={fi('current_stock_level')} />
              </div>
              <div className="form-group">
                <label>Usage Rate (per day)</label>
                <input type="number" step="0.01" className="form-control" value={form.usage_rate} onChange={fi('usage_rate')} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">{editingId ? '💾 Save Changes' : '✅ Create Record'}</button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="section-header">
          <h3>📋 All Input Supply Records</h3>
          {!showForm && <button className="btn btn-primary" onClick={openCreate}>+ Add Record</button>}
        </div>
        <table>
          <thead><tr><th>#</th><th>Supplier</th><th>Farmer</th><th>Input Type</th><th>Qty</th><th>Supply Date</th><th>Cost</th><th>Actions</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan="8" style={{ textAlign: 'center' }}>Loading…</td></tr>}
            {!loading && records.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center' }}>No records found.</td></tr>}
            {records.map(r => (
              <tr key={r.supply_id}>
                <td><strong>#{r.supply_id}</strong></td>
                <td>{r.supplier_name}</td>
                <td>{r.farmer_name}</td>
                <td>{r.input_type}</td>
                <td>{r.quantity}</td>
                <td>{r.supply_date ? new Date(r.supply_date).toLocaleDateString() : '—'}</td>
                <td>{r.cost ? `৳ ${parseFloat(r.cost).toLocaleString()}` : '—'}</td>
                <td>
                  <button className="btn btn-outline btn-sm" style={{ marginRight: 6 }} onClick={() => openEdit(r)}>Edit</button>
                  <button className="btn btn-amber btn-sm" onClick={() => handleDelete(r.supply_id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InputSupplyManagement;
