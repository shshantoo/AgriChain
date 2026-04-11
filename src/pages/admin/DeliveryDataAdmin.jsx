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
const DEL = 'http://localhost:3001/api/delivery';
const empty = { batch_id:'', market_id:'', logistics_manager_id:'', source_area:'', source_district:'', destination_area:'', destination_district:'', status:'Pending', transport_date:'' };

const DeliveryDataAdmin = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [batches, setBatches] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [lms, setLms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const [d, b, m, l] = await Promise.all([
        axios.get(DEL),
        axios.get('http://localhost:3001/api/admin/batches-list'),
        axios.get('http://localhost:3001/api/market/markets-list'),
        axios.get(`${DEL}/logistics-managers-list`),
      ]);
      setDeliveries(d.data); setBatches(b.data); setMarkets(m.data); setLms(l.data);
    } catch { } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm({...empty}); setEditingId(null); setShowForm(true); };
  const openEdit = (row) => {
    setEditingId(row.delivery_id);
    setForm({ batch_id:row.batch_id, market_id:row.market_id, logistics_manager_id:row.logistics_manager_id, source_area:row.source_area||'', source_district:row.source_district||'', destination_area:row.destination_area||'', destination_district:row.destination_district||'', status:row.status||'Pending', transport_date:row.transport_date?.split('T')[0]||row.transport_date });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditingId(null); };
  const handleSubmit = async e => {
    e.preventDefault();
    try { if (editingId) await axios.put(`${DEL}/${editingId}`, form); else await axios.post(DEL, form); closeForm(); load(); }
    catch (err) { alert(err.response?.data?.error||'Save failed'); }
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this delivery record?')) return;
    try { await axios.delete(`${DEL}/${id}`); load(); } catch { alert('Delete failed'); }
  };
  const fi = k => e => setForm({ ...form, [k]: e.target.value });

  // Charts
  const statusD = Object.entries(deliveries.reduce((acc,d)=>{ acc[d.status]=(acc[d.status]||0)+1; return acc; },{})).map(([name,value])=>({ name, value }));
  const by市场 = Object.entries(deliveries.reduce((acc,d)=>{ const k=d.market_city||'Unknown'; acc[k]=(acc[k]||0)+1; return acc; },{})).map(([name,value])=>({ name, value }));
  const byMgr = Object.entries(deliveries.reduce((acc,d)=>{ const k=d.logistics_manager_name||'Unknown'; acc[k]=(acc[k]||0)+1; return acc; },{})).map(([name,value])=>({ name, value }));

  const q = search.toLowerCase();
  const filtered = deliveries.filter(d=>`${d.product_name} ${d.market_city} ${d.market_zone} ${d.logistics_manager_name} ${d.status}`.toLowerCase().includes(q));
  const statusColor = s => s==='Delivered'?'green':s==='In Transit'?'blue':s==='Pending'?'amber':'red';

  return (
    <div className="page-body active">
      <div className="page-header"><h2>🚚 Delivery Data — Admin View</h2><p>Full CRUD for delivery records and logistics tracking</p></div>
      <div className="stat-grid" style={{ marginBottom:20 }}>
        <StatCard label="Total" value={deliveries.length} sub="All records" badgeText="All" badgeColor="blue" />
        <StatCard label="Delivered" value={deliveries.filter(d=>d.status==='Delivered').length} badgeText="Done" badgeColor="green" />
        <StatCard label="In Transit" value={deliveries.filter(d=>d.status==='In Transit').length} badgeText="Moving" badgeColor="blue" />
        <StatCard label="Pending" value={deliveries.filter(d=>d.status==='Pending').length} badgeText="Wait" badgeColor="amber" />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, marginBottom:20 }}>
        <ChartCard title="📊 Status Distribution">
          <ResponsiveContainer width="100%" height={180}><PieChart><Pie data={statusD} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={({ name,percent })=>`${name.split(' ')[0]} ${(percent*100).toFixed(0)}%`}>
            {statusD.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
          </Pie><Tooltip {...TS} /><Legend /></PieChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="🏪 By Market City">
          <ResponsiveContainer width="100%" height={180}><BarChart data={by市场} margin={{ top:5,right:10,left:-10,bottom:5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="name" tick={CT} /><YAxis tick={CT} allowDecimals={false} /><Tooltip {...TS} />
            <Bar dataKey="value" name="Deliveries" fill="#60a5fa" radius={[4,4,0,0]} />
          </BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="🚛 By Logistics Manager">
          <ResponsiveContainer width="100%" height={180}><BarChart data={byMgr} margin={{ top:5,right:10,left:-10,bottom:5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="name" tick={CT} /><YAxis tick={CT} allowDecimals={false} /><Tooltip {...TS} />
            <Bar dataKey="value" name="Deliveries" fill="#f59e0b" radius={[4,4,0,0]} />
          </BarChart></ResponsiveContainer>
        </ChartCard>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom:16, border:'2px solid var(--primary)' }}>
          <div className="section-header">
            <h3>{editingId?'✏️ Edit':'➕ Add'} Delivery Record</h3>
            <button className="btn btn-outline btn-sm" onClick={closeForm}>✕ Cancel</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="three-col">
              <div className="form-group"><label>Harvest Batch</label>
                <select className="form-control" value={form.batch_id} onChange={fi('batch_id')} required>
                  <option value="">— Select Batch —</option>
                  {batches.map(b=><option key={b.batch_id} value={b.batch_id}>#{b.batch_id} — {b.product_name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Market</label>
                <select className="form-control" value={form.market_id} onChange={fi('market_id')} required>
                  <option value="">— Select Market —</option>
                  {markets.map(m=><option key={m.market_id} value={m.market_id}>{m.city}, {m.zone}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Logistics Manager</label>
                <select className="form-control" value={form.logistics_manager_id} onChange={fi('logistics_manager_id')} required>
                  <option value="">— Select Manager —</option>
                  {lms.map(l=><option key={l.user_id} value={l.user_id}>{l.name}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:12 }}>
              <div className="form-group"><label>Source Area</label><input className="form-control" value={form.source_area} onChange={fi('source_area')} /></div>
              <div className="form-group"><label>Source District</label><input className="form-control" value={form.source_district} onChange={fi('source_district')} /></div>
              <div className="form-group"><label>Destination Area</label><input className="form-control" value={form.destination_area} onChange={fi('destination_area')} /></div>
              <div className="form-group"><label>Destination District</label><input className="form-control" value={form.destination_district} onChange={fi('destination_district')} /></div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div className="form-group"><label>Transport Date</label><input type="date" className="form-control" value={form.transport_date} onChange={fi('transport_date')} /></div>
              <div className="form-group"><label>Status</label>
                <select className="form-control" value={form.status} onChange={fi('status')}>
                  <option>Pending</option><option>In Transit</option><option>Delivered</option><option>Cancelled</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">{editingId?'💾 Save Changes':'✅ Create Record'}</button>
          </form>
        </div>
      )}

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, gap:8, flexWrap:'wrap' }}>
        <div style={{ display:'flex', gap:8 }}>
          <input className="form-control" placeholder="🔍 Search product, market, status…" value={search} onChange={e=>setSearch(e.target.value)} style={{ width:280 }} />
          {search && <button className="btn btn-outline btn-sm" onClick={()=>setSearch('')}>✕</button>}
        </div>
      </div>

      <div className="card">
        <div className="section-header"><h3>🚚 All Deliveries ({filtered.length})</h3>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Add Delivery</button>
        </div>
        <table>
          <thead><tr><th>#</th><th>Product</th><th>Market</th><th>Manager</th><th>Route</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan="8" style={{ textAlign:'center' }}>Loading…</td></tr>}
            {!loading && filtered.length===0 && <tr><td colSpan="8" style={{ textAlign:'center' }}>No results.</td></tr>}
            {filtered.map(d=>(
              <tr key={d.delivery_id}>
                <td><strong>#{d.delivery_id}</strong></td><td>{d.product_name}</td>
                <td>{d.market_city}, {d.market_zone}</td><td>{d.logistics_manager_name}</td>
                <td style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{d.source_district} → {d.destination_district}</td>
                <td>{d.transport_date?new Date(d.transport_date).toLocaleDateString():'—'}</td>
                <td><Badge text={d.status} color={statusColor(d.status)} /></td>
                <td>
                  <button className="btn btn-outline btn-sm" style={{ marginRight:6 }} onClick={()=>openEdit(d)}>✏️</button>
                  <button className="btn btn-amber btn-sm" onClick={()=>handleDelete(d.delivery_id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeliveryDataAdmin;
