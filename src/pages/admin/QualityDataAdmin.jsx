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
const QC = 'http://localhost:3001/api/quality';
const empty = { processing_id:'', inspector_id:'', moisture_content:'', purity:'', defect_level:'None', grading_status:'Pass', remarks:'' };

const QualityDataAdmin = () => {
  const [reports, setReports] = useState([]);
  const [pBatches, setPBatches] = useState([]);
  const [inspectors, setInspectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const [r, pb, insp] = await Promise.all([
        axios.get(`${QC}/reports`),
        axios.get(`${QC}/processing-batches-list`),
        axios.get(`${QC}/inspectors-list`),
      ]);
      setReports(r.data); setPBatches(pb.data); setInspectors(insp.data);
    } catch { } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm({...empty}); setEditingId(null); setShowForm(true); };
  const openEdit = (row) => {
    setEditingId(row.report_id);
    setForm({ processing_id:row.processing_id, inspector_id:row.inspector_id, moisture_content:row.moisture_content||'', purity:row.purity||'', defect_level:row.defect_level||'None', grading_status:row.grading_status||'Pass', remarks:row.remarks||'' });
    setShowForm(true);
  };
  const closeForm = () => { setShowForm(false); setEditingId(null); };
  const handleSubmit = async e => {
    e.preventDefault();
    try { if (editingId) await axios.put(`${QC}/reports/${editingId}`, form); else await axios.post(`${QC}/reports`, form); closeForm(); load(); }
    catch (err) { alert(err.response?.data?.error||'Save failed'); }
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this quality report?')) return;
    try { await axios.delete(`${QC}/reports/${id}`); load(); } catch { alert('Delete failed'); }
  };
  const fi = k => e => setForm({ ...form, [k]: e.target.value });

  // Charts
  const statusDistrib = Object.entries(reports.reduce((acc,r)=>{ const s=r.grading_status||'Unknown'; acc[s]=(acc[s]||0)+1; return acc; },{})).map(([name,value])=>({ name, value }));
  const moistureByProd = Object.entries(reports.reduce((acc,r)=>{ if (!acc[r.product_name]) acc[r.product_name]={t:0,c:0}; if (r.moisture_content!=null){acc[r.product_name].t+=parseFloat(r.moisture_content);acc[r.product_name].c++;} return acc; },{})).map(([name,v])=>({ name, moisture:v.c?+(v.t/v.c).toFixed(1):0 }));
  const defectDistrib = Object.entries(reports.reduce((acc,r)=>{ const d=r.defect_level||'None'; acc[d]=(acc[d]||0)+1; return acc; },{})).map(([name,value])=>({ name, value }));

  const q = search.toLowerCase();
  const filtered = reports.filter(r=>`${r.product_name} ${r.inspector_name} ${r.grading_status} ${r.defect_level}`.toLowerCase().includes(q));
  const gradeColor = s => s==='Pass'?'green':s?.includes('Conditions')?'amber':'red';

  return (
    <div className="page-body active">
      <div className="page-header"><h2>🔬 Quality Data — Admin View</h2><p>Full CRUD for quality inspection reports</p></div>
      <div className="stat-grid" style={{ marginBottom:20 }}>
        <StatCard label="Total Reports" value={reports.length} sub="All time" badgeText="QC" badgeColor="blue" />
        <StatCard label="Passed" value={reports.filter(r=>r.grading_status==='Pass').length} sub="Approved" badgeText="Pass" badgeColor="green" />
        <StatCard label="Failed" value={reports.filter(r=>r.grading_status==='Fail').length} sub="Rejected" badgeText="Fail" badgeColor="red" />
        <StatCard label="Avg Purity" value={`${reports.length?(reports.reduce((a,r)=>a+parseFloat(r.purity||0),0)/reports.length).toFixed(1):0}%`} badgeText="Quality" badgeColor="green" />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16, marginBottom:20 }}>
        <ChartCard title="✅ Grading Status">
          <ResponsiveContainer width="100%" height={180}><PieChart><Pie data={statusDistrib} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={({ name,percent })=>`${name.split(' ')[0]} ${(percent*100).toFixed(0)}%`}>
            {statusDistrib.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
          </Pie><Tooltip {...TS} /><Legend /></PieChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="💧 Avg Moisture % by Product">
          <ResponsiveContainer width="100%" height={180}><BarChart data={moistureByProd} margin={{ top:5,right:10,left:-10,bottom:5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="name" tick={CT} /><YAxis tick={CT} domain={[0,20]} /><Tooltip {...TS} />
            <Bar dataKey="moisture" name="Moisture %" fill="#60a5fa" radius={[4,4,0,0]} />
          </BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="🐛 Defect Levels">
          <ResponsiveContainer width="100%" height={180}><PieChart><Pie data={defectDistrib} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={({ name,percent })=>`${name} ${(percent*100).toFixed(0)}%`}>
            {defectDistrib.map((_,i)=><Cell key={i} fill={['#4ade80','#f59e0b','#f87171','#a78bfa'][i%4]} />)}
          </Pie><Tooltip {...TS} /></PieChart></ResponsiveContainer>
        </ChartCard>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom:16, border:'2px solid var(--primary)' }}>
          <div className="section-header">
            <h3>{editingId?'✏️ Edit':'➕ Add'} Quality Report</h3>
            <button className="btn btn-outline btn-sm" onClick={closeForm}>✕ Cancel</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="three-col">
              <div className="form-group"><label>Processing Batch</label>
                <select className="form-control" value={form.processing_id} onChange={fi('processing_id')} required>
                  <option value="">— Select Processing Batch —</option>
                  {pBatches.map(b=><option key={b.processing_id} value={b.processing_id}>#{b.processing_id} — {b.product_name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Inspector</label>
                <select className="form-control" value={form.inspector_id} onChange={fi('inspector_id')} required>
                  <option value="">— Select Inspector —</option>
                  {inspectors.map(i=><option key={i.user_id} value={i.user_id}>{i.name}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Grading Status</label>
                <select className="form-control" value={form.grading_status} onChange={fi('grading_status')}>
                  <option>Pass</option><option>Fail</option><option>Pass with Conditions</option>
                </select>
              </div>
            </div>
            <div className="three-col">
              <div className="form-group"><label>Moisture Content (%)</label><input type="number" step="0.1" min="0" max="100" className="form-control" value={form.moisture_content} onChange={fi('moisture_content')} /></div>
              <div className="form-group"><label>Purity (%)</label><input type="number" step="0.1" min="0" max="100" className="form-control" value={form.purity} onChange={fi('purity')} /></div>
              <div className="form-group"><label>Defect Level</label>
                <select className="form-control" value={form.defect_level} onChange={fi('defect_level')}>
                  <option>None</option><option>Minor</option><option>Moderate</option><option>Severe</option>
                </select>
              </div>
            </div>
            <div className="form-group"><label>Remarks</label><input className="form-control" value={form.remarks} onChange={fi('remarks')} placeholder="Optional inspection notes…" /></div>
            <button type="submit" className="btn btn-primary">{editingId?'💾 Save Changes':'✅ Create Report'}</button>
          </form>
        </div>
      )}

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14, gap:8, flexWrap:'wrap' }}>
        <div style={{ display:'flex', gap:8 }}>
          <input className="form-control" placeholder="🔍 Search product, inspector, status…" value={search} onChange={e=>setSearch(e.target.value)} style={{ width:280 }} />
          {search && <button className="btn btn-outline btn-sm" onClick={()=>setSearch('')}>✕</button>}
        </div>
      </div>

      <div className="card">
        <div className="section-header"><h3>🔬 Quality Reports ({filtered.length})</h3>
          <button className="btn btn-primary btn-sm" onClick={openAdd}>+ Add Report</button>
        </div>
        <table>
          <thead><tr><th>#</th><th>Product</th><th>Inspector</th><th>Moisture%</th><th>Purity%</th><th>Defect</th><th>Status</th><th>Remarks</th><th>Actions</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan="9" style={{ textAlign:'center' }}>Loading…</td></tr>}
            {!loading && filtered.length===0 && <tr><td colSpan="9" style={{ textAlign:'center' }}>No results.</td></tr>}
            {filtered.map(r=>(
              <tr key={r.report_id}>
                <td><strong>#{r.report_id}</strong></td><td>{r.product_name}</td><td>{r.inspector_name}</td>
                <td>{r.moisture_content??'—'}%</td><td>{r.purity??'—'}%</td><td>{r.defect_level||'—'}</td>
                <td><Badge text={r.grading_status||'—'} color={gradeColor(r.grading_status)} /></td>
                <td style={{ maxWidth:140, fontSize:'0.8rem', color:'var(--text-muted)' }}>{r.remarks||'—'}</td>
                <td>
                  <button className="btn btn-outline btn-sm" style={{ marginRight:6 }} onClick={()=>openEdit(r)}>✏️</button>
                  <button className="btn btn-amber btn-sm" onClick={()=>handleDelete(r.report_id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QualityDataAdmin;
