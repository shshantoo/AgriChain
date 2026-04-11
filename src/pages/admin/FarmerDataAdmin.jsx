import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { StatCard, Badge } from '../../components/SharedUI';

const COLORS = ['#4ade80','#60a5fa','#f59e0b','#f87171','#a78bfa','#34d399','#fb923c'];
const CT = { fill:'var(--text-muted)', fontSize:11 };
const TS = { contentStyle:{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 } };
const ChartCard = ({ title, children }) => (
  <div className="card"><div style={{ fontWeight:600, marginBottom:12, fontSize:'0.9rem' }}>{title}</div>{children}</div>
);

const emptyH = { farmer_id:'', product_id:'', harvest_date:'', quantity:'', quality_grade:'Grade A' };
const emptyS = { farmer_id:'', sowing_date:'', expected_harvest_date:'', seed_type:'', used_quantity:'' };

const BASE = 'http://localhost:3001/api/farmer';

const FarmerDataAdmin = () => {
  const [harvests, setHarvests] = useState([]);
  const [sowings, setSowings] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('harvest');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('harvest');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const [h, s, f, p] = await Promise.all([
        axios.get(`${BASE}/harvest`), axios.get(`${BASE}/sowing`),
        axios.get(`${BASE}/farmers-list`), axios.get('http://localhost:3001/api/product'),
      ]);
      setHarvests(h.data); setSowings(s.data); setFarmers(f.data); setProducts(p.data);
    } catch { } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openAdd = (type) => { setFormType(type); setForm(type==='harvest' ? {...emptyH} : {...emptyS}); setEditingId(null); setShowForm(true); setTab(type); };
  const openEdit = (type, row) => {
    setFormType(type); setShowForm(true); setTab(type);
    if (type === 'harvest') { setEditingId(row.batch_id); setForm({ farmer_id: row.farmer_id, product_id: row.product_id, harvest_date: row.harvest_date?.split('T')[0]||'', quantity: row.quantity, quality_grade: row.quality_grade }); }
    else { setEditingId(row.sowing_id); setForm({ farmer_id: row.farmer_id, sowing_date: row.sowing_date?.split('T')[0]||'', expected_harvest_date: row.expected_harvest_date?.split('T')[0]||'', seed_type: row.seed_type, used_quantity: row.used_quantity }); }
  };
  const closeForm = () => { setShowForm(false); setEditingId(null); };
  const handleSubmit = async e => {
    e.preventDefault();
    const url = formType === 'harvest' ? `${BASE}/harvest` : `${BASE}/sowing`;
    try { if (editingId) await axios.put(`${url}/${editingId}`, form); else await axios.post(url, form); closeForm(); load(); }
    catch (err) { alert(err.response?.data?.error || 'Save failed'); }
  };
  const handleDelete = async (type, id) => {
    if (!window.confirm('Delete this record?')) return;
    const url = type === 'harvest' ? `${BASE}/harvest/${id}` : `${BASE}/sowing/${id}`;
    try { await axios.delete(url); load(); } catch { alert('Delete failed — record may have dependent data'); }
  };
  const fi = k => e => setForm({ ...form, [k]: e.target.value });

  // Charts
  const qtyByProduct = Object.entries(harvests.reduce((acc,h)=>{ acc[h.product_name]=(acc[h.product_name]||0)+parseFloat(h.quantity||0); return acc; },{})).map(([name,value])=>({ name, value:+value.toFixed(1) }));
  const gradeDistrib = Object.entries(harvests.reduce((acc,h)=>{ const g=h.quality_grade||'N/A'; acc[g]=(acc[g]||0)+1; return acc; },{})).map(([name,value])=>({ name, value }));
  const sowingBySeed = Object.entries(sowings.reduce((acc,s)=>{ acc[s.seed_type]=(acc[s.seed_type]||0)+parseFloat(s.used_quantity||0); return acc; },{})).map(([name,value])=>({ name:name.slice(0,16), value:+value.toFixed(1) }));

  const q = search.toLowerCase();
  const filteredH = harvests.filter(h=>`${h.farmer_name} ${h.product_name} ${h.quality_grade}`.toLowerCase().includes(q));
  const filteredS = sowings.filter(s=>`${s.farmer_name} ${s.seed_type}`.toLowerCase().includes(q));
  const gradeColor = g => g==='Grade A'?'green':g==='Grade B'?'amber':'red';

  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>🌾 Farmer Data — Admin View</h2>
        <p>Full CRUD control over harvest batches and sowing logs</p>
      </div>

      <div className="stat-grid" style={{ marginBottom:20 }}>
        <StatCard label="Harvest Batches" value={harvests.length} sub="Total batches" badgeText="Production" badgeColor="green" />
        <StatCard label="Total Production" value={`${harvests.reduce((a,h)=>a+parseFloat(h.quantity||0),0).toFixed(1)} t`} sub="All time" badgeText="Volume" badgeColor="blue" />
        <StatCard label="Sowing Logs" value={sowings.length} sub="Tracked" badgeText="Sowing" badgeColor="amber" />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, marginBottom:20 }}>
        <ChartCard title="📦 Harvest Qty by Product (t)">
          <ResponsiveContainer width="100%" height={180}><BarChart data={qtyByProduct} margin={{ top:5,right:10,left:-10,bottom:5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="name" tick={CT} /><YAxis tick={CT} /><Tooltip {...TS} />
            <Bar dataKey="value" name="Qty (t)" fill="#4ade80" radius={[4,4,0,0]} />
          </BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="🎖️ Grade Distribution">
          <ResponsiveContainer width="100%" height={180}><PieChart>
            <Pie data={gradeDistrib} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={({ name,percent })=>`${name} ${(percent*100).toFixed(0)}%`}>
              {gradeDistrib.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
            </Pie><Tooltip {...TS} />
          </PieChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="🌱 Seed Usage by Type (kg)">
          <ResponsiveContainer width="100%" height={180}><BarChart data={sowingBySeed} margin={{ top:5,right:10,left:-10,bottom:5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="name" tick={CT} /><YAxis tick={CT} /><Tooltip {...TS} />
            <Bar dataKey="value" name="Used (kg)" fill="#60a5fa" radius={[4,4,0,0]} />
          </BarChart></ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Inline Form */}
      {showForm && (
        <div className="card" style={{ marginBottom:16, border:'2px solid var(--primary)' }}>
          <div className="section-header">
            <h3>{editingId?'✏️ Edit':'➕ Add'} {formType==='harvest'?'Harvest Batch':'Sowing Log'}</h3>
            <button className="btn btn-outline btn-sm" onClick={closeForm}>✕ Cancel</button>
          </div>
          <form onSubmit={handleSubmit}>
            {formType === 'harvest' ? (
              <>
                <div className="three-col">
                  <div className="form-group"><label>Farmer</label>
                    <select className="form-control" value={form.farmer_id} onChange={fi('farmer_id')} required>
                      <option value="">— Select Farmer —</option>
                      {farmers.map(f=><option key={f.user_id} value={f.user_id}>{f.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Product</label>
                    <select className="form-control" value={form.product_id} onChange={fi('product_id')} required>
                      <option value="">— Select Product —</option>
                      {products.map(p=><option key={p.product_id} value={p.product_id}>{p.product_name}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Harvest Date</label>
                    <input type="date" className="form-control" value={form.harvest_date} onChange={fi('harvest_date')} required />
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div className="form-group"><label>Quantity (t)</label>
                    <input type="number" step="0.01" min="0.01" className="form-control" value={form.quantity} onChange={fi('quantity')} required />
                  </div>
                  <div className="form-group"><label>Quality Grade</label>
                    <select className="form-control" value={form.quality_grade} onChange={fi('quality_grade')}>
                      <option>Grade A</option><option>Grade B</option><option>Grade C</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="three-col">
                  <div className="form-group"><label>Farmer</label>
                    <select className="form-control" value={form.farmer_id} onChange={fi('farmer_id')} required>
                      <option value="">— Select Farmer —</option>
                      {farmers.map(f=><option key={f.user_id} value={f.user_id}>{f.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Sowing Date</label>
                    <input type="date" className="form-control" value={form.sowing_date} onChange={fi('sowing_date')} required />
                  </div>
                  <div className="form-group"><label>Expected Harvest Date</label>
                    <input type="date" className="form-control" value={form.expected_harvest_date} onChange={fi('expected_harvest_date')} />
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div className="form-group"><label>Seed Type</label>
                    <input className="form-control" value={form.seed_type} onChange={fi('seed_type')} required />
                  </div>
                  <div className="form-group"><label>Used Quantity (kg)</label>
                    <input type="number" step="0.01" className="form-control" value={form.used_quantity} onChange={fi('used_quantity')} />
                  </div>
                </div>
              </>
            )}
            <button type="submit" className="btn btn-primary">{editingId?'💾 Save Changes':'✅ Create Record'}</button>
          </form>
        </div>
      )}

      {/* Tabs + Search */}
      <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:14, flexWrap:'wrap' }}>
        {[['harvest','🌾 Harvest Batches',filteredH.length],['sowing','🌱 Sowing Logs',filteredS.length]].map(([t,l,cnt])=>(
          <button key={t} className={`btn btn-sm ${tab===t?'btn-primary':'btn-outline'}`} onClick={()=>setTab(t)}>{l} ({cnt})</button>
        ))}
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          <input className="form-control" placeholder="🔍 Search…" value={search} onChange={e=>setSearch(e.target.value)} style={{ width:220 }} />
          {search && <button className="btn btn-outline btn-sm" onClick={()=>setSearch('')}>✕</button>}
        </div>
      </div>

      {tab === 'harvest' && (
        <div className="card">
          <div className="section-header"><h3>🌾 Harvest Batches ({filteredH.length})</h3>
            <button className="btn btn-primary btn-sm" onClick={()=>openAdd('harvest')}>+ Add Batch</button>
          </div>
          <table><thead><tr><th>#</th><th>Farmer</th><th>Product</th><th>Qty (t)</th><th>Grade</th><th>Harvest Date</th><th>Actions</th></tr></thead>
            <tbody>
              {loading && <tr><td colSpan="7" style={{ textAlign:'center' }}>Loading…</td></tr>}
              {!loading && filteredH.length===0 && <tr><td colSpan="7" style={{ textAlign:'center' }}>No results.</td></tr>}
              {filteredH.map(h=>(
                <tr key={h.batch_id}>
                  <td><strong>#{h.batch_id}</strong></td><td>{h.farmer_name}</td><td>{h.product_name}</td>
                  <td>{h.quantity} t</td><td><Badge text={h.quality_grade||'—'} color={gradeColor(h.quality_grade)} /></td>
                  <td>{h.harvest_date?new Date(h.harvest_date).toLocaleDateString():'—'}</td>
                  <td>
                    <button className="btn btn-outline btn-sm" style={{ marginRight:6 }} onClick={()=>openEdit('harvest',h)}>✏️ Edit</button>
                    <button className="btn btn-amber btn-sm" onClick={()=>handleDelete('harvest',h.batch_id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'sowing' && (
        <div className="card">
          <div className="section-header"><h3>🌱 Sowing Logs ({filteredS.length})</h3>
            <button className="btn btn-primary btn-sm" onClick={()=>openAdd('sowing')}>+ Add Log</button>
          </div>
          <table><thead><tr><th>#</th><th>Farmer</th><th>Seed Type</th><th>Used Qty (kg)</th><th>Sowing Date</th><th>Expected Harvest</th><th>Actions</th></tr></thead>
            <tbody>
              {loading && <tr><td colSpan="7" style={{ textAlign:'center' }}>Loading…</td></tr>}
              {!loading && filteredS.length===0 && <tr><td colSpan="7" style={{ textAlign:'center' }}>No results.</td></tr>}
              {filteredS.map(s=>(
                <tr key={s.sowing_id}>
                  <td><strong>#{s.sowing_id}</strong></td><td>{s.farmer_name}</td><td>{s.seed_type}</td>
                  <td>{s.used_quantity} kg</td>
                  <td>{s.sowing_date?new Date(s.sowing_date).toLocaleDateString():'—'}</td>
                  <td>{s.expected_harvest_date?new Date(s.expected_harvest_date).toLocaleDateString():'—'}</td>
                  <td>
                    <button className="btn btn-outline btn-sm" style={{ marginRight:6 }} onClick={()=>openEdit('sowing',s)}>✏️ Edit</button>
                    <button className="btn btn-amber btn-sm" onClick={()=>handleDelete('sowing',s.sowing_id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FarmerDataAdmin;
