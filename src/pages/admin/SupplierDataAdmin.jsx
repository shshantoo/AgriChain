import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { StatCard, Badge } from '../../components/SharedUI';

const COLORS = ['#4ade80','#60a5fa','#f59e0b','#f87171','#a78bfa','#34d399'];
const CT = { fill:'var(--text-muted)', fontSize:11 };
const TS = { contentStyle:{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 } };
const ChartCard = ({ title, children }) => (
  <div className="card"><div style={{ fontWeight:600, marginBottom:12, fontSize:'0.9rem' }}>{title}</div>{children}</div>
);
const SUP = 'http://localhost:3001/api/supplier';
const empty = { farmer_id:'', supplier_id:'', input_type:'', quantity:'', supply_date:'', cost:'', procurement_schedule:'', current_stock_level:'', usage_rate:'' };

const SupplierDataAdmin = () => {
  const [supplies, setSupplies] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const [s, f, sup] = await Promise.all([
        axios.get(`${SUP}/input-supply`),
        axios.get('http://localhost:3001/api/farmer/farmers-list'),
        axios.get(`${SUP}/suppliers-list`),
      ]);
      setSupplies(s.data); setFarmers(f.data); setSuppliers(sup.data);
    } catch { } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm({...empty}); setEditingId(null); setShowForm(true); };
  const openEdit = (row) => {
    setEditingId(row.supply_id);
    setForm({ farmer_id:row.farmer_id, supplier_id:row.supplier_id, input_type:row.input_type, quantity:row.quantity, supply_date:row.supply_date?.split('T')[0]||row.supply_date, cost:row.cost||'', procurement_schedule:row.procurement_schedule||'', current_stock_level:row.current_stock_level||'', usage_rate:row.usage_rate||'' });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditingId(null); };
  const handleSubmit = async e => {
    e.preventDefault();
    try { if (editingId) await axios.put(`${SUP}/input-supply/${editingId}`, form); else await axios.post(`${SUP}/input-supply`, form); closeForm(); load(); }
    catch (err) { alert(err.response?.data?.error||'Save failed'); }
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try { await axios.delete(`${SUP}/input-supply/${id}`); load(); } catch { alert('Delete failed'); }
  };
  const fi = k => e => setForm({ ...form, [k]: e.target.value });

  // Charts
  const qtyByType = Object.entries(supplies.reduce((acc,s)=>{ acc[s.input_type]=(acc[s.input_type]||0)+parseFloat(s.quantity||0); return acc; },{})).map(([name,value])=>({ name:name.slice(0,16), value:+value.toFixed(1) }));
  const costByType = Object.entries(supplies.reduce((acc,s)=>{ acc[s.input_type]=(acc[s.input_type]||0)+parseFloat(s.cost||0); return acc; },{})).map(([name,value])=>({ name:name.slice(0,16), value:+value.toFixed(0) }));
  const typeDistrib = Object.entries(supplies.reduce((acc,s)=>{ acc[s.input_type]=(acc[s.input_type]||0)+1; return acc; },{})).map(([name,value])=>({ name:name.slice(0,18), value }));

  const q = search.toLowerCase();
  const filtered = supplies.filter(s=>`${s.input_type} ${s.farmer_name} ${s.supplier_name}`.toLowerCase().includes(q));
  const totalCost = supplies.reduce((a,s)=>a+parseFloat(s.cost||0),0);

  return (
    <div className="page-body active">
      <div className="page-header"><h2>🚚 Supplier Data — Admin View</h2><p>Full CRUD for input supply records</p></div>
      <div className="stat-grid" style={{ marginBottom:20 }}>
        <StatCard label="Supply Records" value={supplies.length} sub="All deliveries" badgeText="All" badgeColor="blue" />
        <StatCard label="Total Qty" value={supplies.reduce((a,s)=>a+parseFloat(s.quantity||0),0).toFixed(1)} sub="Units delivered" badgeText="Volume" badgeColor="green" />
        <StatCard label="Total Cost" value={`৳ ${(totalCost/1000).toFixed(1)}K`} sub="Procurement spend" badgeText="Finance" badgeColor="amber" />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, marginBottom:20 }}>
        <ChartCard title="📦 Quantity by Input Type">
          <ResponsiveContainer width="100%" height={180}><BarChart data={qtyByType} margin={{ top:5,right:10,left:-10,bottom:5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="name" tick={CT} /><YAxis tick={CT} /><Tooltip {...TS} />
            <Bar dataKey="value" name="Quantity" fill="#4ade80" radius={[4,4,0,0]} />
          </BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="💰 Cost by Input Type (৳)">
          <ResponsiveContainer width="100%" height={180}><BarChart data={costByType} margin={{ top:5,right:10,left:-10,bottom:5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="name" tick={CT} /><YAxis tick={CT} tickFormatter={v=>`${(v/1000).toFixed(0)}K`} /><Tooltip {...TS} formatter={v=>[`৳ ${v.toLocaleString()}`,'Cost']} />
            <Bar dataKey="value" name="Cost" fill="#f59e0b" radius={[4,4,0,0]} />
          </BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="🧪 Supply Type Distribution">
          <ResponsiveContainer width="100%" height={180}><PieChart>
            <Pie data={typeDistrib} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={({ percent })=>`${(percent*100).toFixed(0)}%`}>
              {typeDistrib.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
            </Pie><Tooltip {...TS} /><Legend />
          </PieChart></ResponsiveContainer>
        </ChartCard>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom:16, border:'2px solid var(--primary)' }}>
          <div className="section-header">
            <h3>{editingId?'✏️ Edit':'➕ Add'} Input Supply Record</h3>
            <button className="btn btn-outline btn-sm" onClick={closeForm}>✕ Cancel</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="three-col">
              <div className="form-group"><label>Farmer</label>
                <select className="form-control" value={form.farmer_id} onChange={fi('farmer_id')} required>
                  <option value="">— Select Farmer —</option>
                  {farmers.map(f=><option key={f.user_id} value={f.user_id}>{f.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Supplier</label>
                <select className="form-control" value={form.supplier_id} onChange={fi('supplier_id')} required>
                  <option value="">— Select Supplier —</option>
                  {suppliers.map(s=><option key={s.user_id} value={s.user_id}>{s.name} — {s.company_name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Input Type</label><input className="form-control" value={form.input_type} onChange={fi('input_type')} required placeholder="e.g. Urea Fertilizer" /></div>
            </div>
            <div className="three-col">
              <div className="form-group"><label>Quantity</label><input type="number" step="0.01" className="form-control" value={form.quantity} onChange={fi('quantity')} required /></div>
              <div className="form-group"><label>Supply Date</label><input type="date" className="form-control" value={form.supply_date} onChange={fi('supply_date')} required /></div>
              <div className="form-group"><label>Cost (৳)</label><input type="number" step="0.01" className="form-control" value={form.cost} onChange={fi('cost')} /></div>
            </div>
            <div className="three-col">
              <div className="form-group"><label>Procurement Schedule (days)</label><input type="number" className="form-control" value={form.procurement_schedule} onChange={fi('procurement_schedule')} /></div>
              <div className="form-group"><label>Current Stock Level</label><input type="number" step="0.01" className="form-control" value={form.current_stock_level} onChange={fi('current_stock_level')} /></div>
              <div className="form-group"><label>Usage Rate</label><input type="number" step="0.01" className="form-control" value={form.usage_rate} onChange={fi('usage_rate')} /></div>
            </div>
            <button type="submit" className="btn btn-primary">{editingId?'💾 Save Changes':'✅ Create Record'}</button>
          </form>
        </div>
      )}

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, flexWrap:'wrap', gap:8 }}>
        <div style={{ display:'flex', gap:8 }}>
          <input className="form-control" placeholder="🔍 Search by input type, farmer, supplier…" value={search} onChange={e=>setSearch(e.target.value)} style={{ width:300 }} />
          {search && <button className="btn btn-outline btn-sm" onClick={()=>setSearch('')}>✕</button>}
        </div>
      </div>

      <div className="card">
        <div className="section-header"><h3>🚚 Input Supply Records ({filtered.length})</h3>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Add Record</button>
        </div>
        <table>
          <thead><tr><th>#</th><th>Input Type</th><th>Farmer</th><th>Supplier</th><th>Qty</th><th>Cost</th><th>Supply Date</th><th>Actions</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan="8" style={{ textAlign:'center' }}>Loading…</td></tr>}
            {!loading && filtered.length===0 && <tr><td colSpan="8" style={{ textAlign:'center' }}>No results.</td></tr>}
            {filtered.map(s=>(
              <tr key={s.supply_id}>
                <td><strong>#{s.supply_id}</strong></td><td>{s.input_type}</td><td>{s.farmer_name}</td><td>{s.supplier_name}</td>
                <td>{s.quantity}</td><td>৳ {parseFloat(s.cost||0).toLocaleString()}</td>
                <td>{s.supply_date?new Date(s.supply_date).toLocaleDateString():'—'}</td>
                <td><button className="btn btn-outline btn-sm" style={{ marginRight:6 }} onClick={()=>openEdit(s)}>✏️</button>
                  <button className="btn btn-amber btn-sm" onClick={()=>handleDelete(s.supply_id)}>🗑️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupplierDataAdmin;
