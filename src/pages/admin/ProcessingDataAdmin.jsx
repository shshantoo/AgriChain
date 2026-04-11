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
const PROC = 'http://localhost:3001/api/processing';
const emptyB = { batch_id:'', plant_id:'', processing_date:'' };
const emptyP = { manager_id:'', area:'', district:'', process_plants_type:'' };

const ProcessingDataAdmin = () => {
  const [batches, setBatches] = useState([]);
  const [plants, setPlants] = useState([]);
  const [harvestBatches, setHarvestBatches] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('batches');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('batches');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const [b, p, hb, mgr] = await Promise.all([
        axios.get(`${PROC}/batches`), axios.get(`${PROC}/plants`),
        axios.get('http://localhost:3001/api/admin/batches-list'),
        axios.get(`${PROC}/processing-managers-list`),
      ]);
      setBatches(b.data); setPlants(p.data); setHarvestBatches(hb.data); setManagers(mgr.data);
    } catch { } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const plantsList = plants.map(p=>({ plant_id:p.plant_id, label:`${p.area}, ${p.district} (${p.process_plants_type||'General'})` }));

  const openAdd = (type) => { setFormType(type); setEditingId(null); setShowForm(true); setTab(type); setForm(type==='batches'?{...emptyB}:{...emptyP}); };
  const openEdit = (type, row) => {
    setFormType(type); setShowForm(true); setTab(type);
    if (type==='batches') { setEditingId(row.processing_id); setForm({ batch_id:row.batch_id, plant_id:row.plant_id, processing_date:row.processing_date?.split('T')[0]||row.processing_date }); }
    else { setEditingId(row.plant_id); setForm({ manager_id:row.manager_id, area:row.area, district:row.district, process_plants_type:row.process_plants_type||'' }); }
  };
  const closeForm = () => { setShowForm(false); setEditingId(null); };
  const handleSubmit = async e => {
    e.preventDefault();
    const url = formType==='batches'?`${PROC}/batches`:`${PROC}/plants`;
    try { if (editingId) await axios.put(`${url}/${editingId}`, form); else await axios.post(url, form); closeForm(); load(); }
    catch (err) { alert(err.response?.data?.error||'Save failed'); }
  };
  const handleDelete = async (type, id) => {
    if (!window.confirm('Delete this record?')) return;
    try { await axios.delete(`${type==='batches'?`${PROC}/batches`:`${PROC}/plants`}/${id}`); load(); }
    catch { alert('Delete failed — may have dependent records'); }
  };
  const fi = k => e => setForm({ ...form, [k]: e.target.value });

  // Charts
  const byPlantType = Object.entries(batches.reduce((acc,b)=>{ const t=b.process_plants_type||'General'; acc[t]=(acc[t]||0)+1; return acc; },{})).map(([name,value])=>({ name, value }));
  const byPlant = Object.entries(batches.reduce((acc,b)=>{ const k=`${b.plant_area}, ${b.plant_district}`; acc[k]=(acc[k]||0)+1; return acc; },{})).map(([name,value])=>({ name:name.slice(0,22), value }));
  const byProduct = Object.entries(batches.reduce((acc,b)=>{ acc[b.product_name]=(acc[b.product_name]||0)+1; return acc; },{})).map(([name,value])=>({ name, value }));

  const q = search.toLowerCase();
  const filtB = batches.filter(b=>`${b.product_name} ${b.plant_area} ${b.plant_district} ${b.process_plants_type}`.toLowerCase().includes(q));
  const filtP = plants.filter(p=>`${p.area} ${p.district} ${p.process_plants_type} ${p.manager_name}`.toLowerCase().includes(q));

  return (
    <div className="page-body active">
      <div className="page-header"><h2>⚙️ Processing Data — Admin View</h2><p>Full CRUD for processing batches and processing plants</p></div>
      <div className="stat-grid" style={{ marginBottom:20 }}>
        <StatCard label="Processing Plants" value={plants.length} sub="Facilities" badgeText="Active" badgeColor="green" />
        <StatCard label="Processing Batches" value={batches.length} sub="Total processed" badgeText="Tracked" badgeColor="blue" />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, marginBottom:20 }}>
        <ChartCard title="🏭 Batches by Plant Type">
          <ResponsiveContainer width="100%" height={180}><PieChart><Pie data={byPlantType} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={({ name,percent })=>`${name} ${(percent*100).toFixed(0)}%`}>
            {byPlantType.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
          </Pie><Tooltip {...TS} /><Legend /></PieChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="🏗️ Batches per Plant">
          <ResponsiveContainer width="100%" height={180}><BarChart data={byPlant} margin={{ top:5,right:10,left:-10,bottom:5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="name" tick={CT} /><YAxis tick={CT} allowDecimals={false} /><Tooltip {...TS} />
            <Bar dataKey="value" name="Batches" fill="#60a5fa" radius={[4,4,0,0]} />
          </BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="📦 Batches by Product">
          <ResponsiveContainer width="100%" height={180}><BarChart data={byProduct} margin={{ top:5,right:10,left:-10,bottom:5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="name" tick={CT} /><YAxis tick={CT} allowDecimals={false} /><Tooltip {...TS} />
            <Bar dataKey="value" name="Batches" fill="#4ade80" radius={[4,4,0,0]} />
          </BarChart></ResponsiveContainer>
        </ChartCard>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom:16, border:'2px solid var(--primary)' }}>
          <div className="section-header">
            <h3>{editingId?'✏️ Edit':'➕ Add'} {formType==='batches'?'Processing Batch':'Processing Plant'}</h3>
            <button className="btn btn-outline btn-sm" onClick={closeForm}>✕ Cancel</button>
          </div>
          <form onSubmit={handleSubmit}>
            {formType === 'batches' ? (
              <div className="three-col">
                <div className="form-group"><label>Harvest Batch</label>
                  <select className="form-control" value={form.batch_id} onChange={fi('batch_id')} required>
                    <option value="">— Select Batch —</option>
                    {harvestBatches.map(b=><option key={b.batch_id} value={b.batch_id}>#{b.batch_id} — {b.product_name}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Processing Plant</label>
                  <select className="form-control" value={form.plant_id} onChange={fi('plant_id')} required>
                    <option value="">— Select Plant —</option>
                    {plantsList.map(p=><option key={p.plant_id} value={p.plant_id}>{p.label}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Processing Date</label>
                  <input type="date" className="form-control" value={form.processing_date} onChange={fi('processing_date')} required />
                </div>
              </div>
            ) : (
              <>
                <div className="three-col">
                  <div className="form-group"><label>Manager</label>
                    <select className="form-control" value={form.manager_id} onChange={fi('manager_id')} required>
                      <option value="">— Select Manager —</option>
                      {managers.map(m=><option key={m.user_id} value={m.user_id}>{m.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Area</label><input className="form-control" value={form.area} onChange={fi('area')} required /></div>
                  <div className="form-group"><label>District</label><input className="form-control" value={form.district} onChange={fi('district')} required /></div>
                </div>
                <div className="form-group" style={{ maxWidth:250 }}><label>Plant Type</label>
                  <select className="form-control" value={form.process_plants_type} onChange={fi('process_plants_type')}>
                    <option value="">— Select —</option><option>Milling</option><option>Packaging</option><option>Drying</option><option>Sorting</option><option>Cold Storage</option>
                  </select>
                </div>
              </>
            )}
            <button type="submit" className="btn btn-primary">{editingId?'💾 Save Changes':'✅ Create Record'}</button>
          </form>
        </div>
      )}

      <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:14, flexWrap:'wrap' }}>
        {[['batches','📋 Batches',filtB.length],['plants','🏭 Plants',filtP.length]].map(([t,l,cnt])=>(
          <button key={t} className={`btn btn-sm ${tab===t?'btn-primary':'btn-outline'}`} onClick={()=>setTab(t)}>{l} ({cnt})</button>
        ))}
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          <input className="form-control" placeholder="🔍 Search…" value={search} onChange={e=>setSearch(e.target.value)} style={{ width:220 }} />
          {search && <button className="btn btn-outline btn-sm" onClick={()=>setSearch('')}>✕</button>}
        </div>
      </div>

      {tab === 'batches' && (
        <div className="card">
          <div className="section-header"><h3>📋 Processing Batches ({filtB.length})</h3>
            <button className="btn btn-primary btn-sm" onClick={()=>openAdd('batches')}>+ Add Batch</button>
          </div>
          <table><thead><tr><th>#</th><th>Product</th><th>Plant</th><th>Plant Type</th><th>Processing Date</th><th>Actions</th></tr></thead>
            <tbody>
              {loading && <tr><td colSpan="6" style={{ textAlign:'center' }}>Loading…</td></tr>}
              {!loading && filtB.length===0 && <tr><td colSpan="6" style={{ textAlign:'center' }}>No results.</td></tr>}
              {filtB.map(b=>(
                <tr key={b.processing_id}>
                  <td><strong>#{b.processing_id}</strong></td><td>{b.product_name}</td>
                  <td>{b.plant_area}, {b.plant_district}</td>
                  <td><Badge text={b.process_plants_type||'—'} color="blue" /></td>
                  <td>{b.processing_date?new Date(b.processing_date).toLocaleDateString():'—'}</td>
                  <td><button className="btn btn-outline btn-sm" style={{ marginRight:6 }} onClick={()=>openEdit('batches',b)}>✏️</button>
                    <button className="btn btn-amber btn-sm" onClick={()=>handleDelete('batches',b.processing_id)}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'plants' && (
        <div className="card">
          <div className="section-header"><h3>🏭 Processing Plants ({filtP.length})</h3>
            <button className="btn btn-primary btn-sm" onClick={()=>openAdd('plants')}>+ Add Plant</button>
          </div>
          <table><thead><tr><th>#</th><th>Manager</th><th>Area</th><th>District</th><th>Type</th><th>Actions</th></tr></thead>
            <tbody>
              {!loading && filtP.length===0 && <tr><td colSpan="6" style={{ textAlign:'center' }}>No results.</td></tr>}
              {filtP.map(p=>(
                <tr key={p.plant_id}>
                  <td><strong>#{p.plant_id}</strong></td><td>{p.manager_name}</td><td>{p.area}</td><td>{p.district}</td>
                  <td><Badge text={p.process_plants_type||'—'} color="blue" /></td>
                  <td><button className="btn btn-outline btn-sm" style={{ marginRight:6 }} onClick={()=>openEdit('plants',p)}>✏️</button>
                    <button className="btn btn-amber btn-sm" onClick={()=>handleDelete('plants',p.plant_id)}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProcessingDataAdmin;
