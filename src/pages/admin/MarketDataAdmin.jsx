import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { StatCard, Badge } from '../../components/SharedUI';

const COLORS = ['#4ade80','#60a5fa','#f59e0b','#f87171','#a78bfa','#34d399'];
const CT = { fill:'var(--text-muted)', fontSize:11 };
const TS = { contentStyle:{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, fontSize:12 } };
const ChartCard = ({ title, children }) => (
  <div className="card"><div style={{ fontWeight:600, marginBottom:12, fontSize:'0.9rem' }}>{title}</div>{children}</div>
);
const MKT = 'http://localhost:3001/api/market';
const emptySale = { batch_id:'', product_id:'', market_id:'', sale_date:'', sale_price:'' };
const emptyMkt = { operator_id:'', city:'', zone:'', market_type:'Wholesale' };

const MarketDataAdmin = () => {
  const [sales, setSales] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [batches, setBatches] = useState([]);
  const [products, setProducts] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('sales');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('sales');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const [sa, mk, b, p, op] = await Promise.all([
        axios.get(`${MKT}/sales`), axios.get(`${MKT}/markets`),
        axios.get('http://localhost:3001/api/admin/batches-list'),
        axios.get('http://localhost:3001/api/product'),
        axios.get(`${MKT}/market-operators-list`),
      ]);
      setSales(sa.data); setMarkets(mk.data); setBatches(b.data); setProducts(p.data); setOperators(op.data);
    } catch { } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const marketsList = markets.map(m=>({ market_id:m.market_id, label:`${m.city}, ${m.zone} (${m.market_type||'—'})` }));

  const openAdd = (type) => { setFormType(type); setEditingId(null); setShowForm(true); setTab(type); setForm(type==='sales'?{...emptySale}:{...emptyMkt}); };
  const openEdit = (type, row) => {
    setFormType(type); setShowForm(true); setTab(type);
    if (type==='sales') { setEditingId(row.sale_id); setForm({ batch_id:row.batch_id, product_id:row.product_id, market_id:row.market_id, sale_date:row.sale_date?.split('T')[0]||row.sale_date, sale_price:row.sale_price }); }
    else { setEditingId(row.market_id); setForm({ operator_id:row.operator_id, city:row.city, zone:row.zone||'', market_type:row.market_type||'Wholesale' }); }
  };
  const closeForm = () => { setShowForm(false); setEditingId(null); };
  const handleSubmit = async e => {
    e.preventDefault();
    const url = formType==='sales'?`${MKT}/sales`:`${MKT}/markets`;
    try { if (editingId) await axios.put(`${url}/${editingId}`, form); else await axios.post(url, form); closeForm(); load(); }
    catch (err) { alert(err.response?.data?.error||'Save failed'); }
  };
  const handleDelete = async (type, id) => {
    if (!window.confirm('Delete this record?')) return;
    try { await axios.delete(`${type==='sales'?`${MKT}/sales`:`${MKT}/markets`}/${id}`); load(); } catch { alert('Delete failed — may have dependent records'); }
  };
  const fi = k => e => setForm({ ...form, [k]: e.target.value });

  // Charts
  const revByMkt = Object.entries(sales.reduce((acc,s)=>{ const k=s.market_city||'Unknown'; acc[k]=(acc[k]||0)+parseFloat(s.sale_price||0); return acc; },{})).map(([name,value])=>({ name, value:+value.toFixed(0) }));
  const revByProd = Object.entries(sales.reduce((acc,s)=>{ acc[s.product_name]=(acc[s.product_name]||0)+parseFloat(s.sale_price||0); return acc; },{})).map(([name,value])=>({ name, revenue:+value.toFixed(0) })).sort((a,b)=>b.revenue-a.revenue);
  const mktTypeD = Object.entries(markets.reduce((acc,m)=>{ const t=m.market_type||'Other'; acc[t]=(acc[t]||0)+1; return acc; },{})).map(([name,value])=>({ name, value }));
  const salesByMonth = Object.entries(sales.reduce((acc,s)=>{ if (!s.sale_date) return acc; const m=new Date(s.sale_date).toLocaleString('default',{month:'short',year:'2-digit'}); acc[m]=(acc[m]||0)+parseFloat(s.sale_price||0); return acc; },{})).map(([name,revenue])=>({ name, revenue:+revenue.toFixed(0) }));
  const totalRevenue = sales.reduce((a,s)=>a+parseFloat(s.sale_price||0),0);

  const q = search.toLowerCase();
  const filtS = sales.filter(s=>`${s.product_name} ${s.market_city} ${s.market_zone}`.toLowerCase().includes(q));
  const filtM = markets.filter(m=>`${m.city} ${m.zone} ${m.operator_name} ${m.market_type}`.toLowerCase().includes(q));

  return (
    <div className="page-body active">
      <div className="page-header"><h2>💰 Market & Sales — Admin View</h2><p>Full CRUD for markets and sales records, with revenue analytics</p></div>
      <div className="stat-grid" style={{ marginBottom:20 }}>
        <StatCard label="Total Revenue" value={`৳ ${(totalRevenue/1000).toFixed(1)}K`} sub="All sales" badgeText="Finance" badgeColor="green" />
        <StatCard label="Sales Records" value={sales.length} sub="Transactions" badgeText="Tracked" badgeColor="blue" />
        <StatCard label="Markets" value={markets.length} sub="Registered" badgeText="Locations" badgeColor="amber" />
        <StatCard label="Avg Sale" value={`৳ ${sales.length?(totalRevenue/sales.length/1000).toFixed(1):0}K`} sub="Per transaction" badgeText="Avg" badgeColor="green" />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:16, marginBottom:16 }}>
        <ChartCard title="💰 Revenue by Market City (৳)">
          <ResponsiveContainer width="100%" height={180}><BarChart data={revByMkt} margin={{ top:5,right:10,left:10,bottom:5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="name" tick={CT} /><YAxis tick={CT} tickFormatter={v=>`${(v/1000).toFixed(0)}K`} /><Tooltip {...TS} formatter={v=>[`৳ ${v.toLocaleString()}`,'Revenue']} />
            <Bar dataKey="value" name="Revenue" fill="#4ade80" radius={[4,4,0,0]} />
          </BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="🏪 Market Types">
          <ResponsiveContainer width="100%" height={180}><PieChart><Pie data={mktTypeD} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} label={({ name,percent })=>`${name} ${(percent*100).toFixed(0)}%`}>
            {mktTypeD.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
          </Pie><Tooltip {...TS} /></PieChart></ResponsiveContainer>
        </ChartCard>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
        <ChartCard title="📦 Revenue by Product (৳)">
          <ResponsiveContainer width="100%" height={180}><BarChart data={revByProd} layout="vertical" margin={{ top:5,right:20,left:10,bottom:5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis type="number" tick={CT} tickFormatter={v=>`${(v/1000).toFixed(0)}K`} /><YAxis type="category" dataKey="name" tick={CT} width={60} /><Tooltip {...TS} formatter={v=>[`৳ ${v.toLocaleString()}`,'Revenue']} />
            <Bar dataKey="revenue" fill="#60a5fa" radius={[0,4,4,0]}>{revByProd.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}</Bar>
          </BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="📈 Revenue Over Time (৳)">
          <ResponsiveContainer width="100%" height={180}><LineChart data={salesByMonth} margin={{ top:5,right:20,left:10,bottom:5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="name" tick={CT} /><YAxis tick={CT} tickFormatter={v=>`${(v/1000).toFixed(0)}K`} /><Tooltip {...TS} formatter={v=>[`৳ ${v.toLocaleString()}`,'Revenue']} />
            <Line type="monotone" dataKey="revenue" stroke="#4ade80" strokeWidth={2} dot={{ fill:'#4ade80', r:4 }} />
          </LineChart></ResponsiveContainer>
        </ChartCard>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom:16, border:'2px solid var(--primary)' }}>
          <div className="section-header">
            <h3>{editingId?'✏️ Edit':'➕ Add'} {formType==='sales'?'Sale Record':'Market'}</h3>
            <button className="btn btn-outline btn-sm" onClick={closeForm}>✕ Cancel</button>
          </div>
          <form onSubmit={handleSubmit}>
            {formType === 'sales' ? (
              <>
                <div className="three-col">
                  <div className="form-group"><label>Harvest Batch</label>
                    <select className="form-control" value={form.batch_id} onChange={fi('batch_id')} required>
                      <option value="">— Select Batch —</option>
                      {batches.map(b=><option key={b.batch_id} value={b.batch_id}>#{b.batch_id} — {b.product_name}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Product</label>
                    <select className="form-control" value={form.product_id} onChange={fi('product_id')} required>
                      <option value="">— Select Product —</option>
                      {products.map(p=><option key={p.product_id} value={p.product_id}>{p.product_name}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Market</label>
                    <select className="form-control" value={form.market_id} onChange={fi('market_id')} required>
                      <option value="">— Select Market —</option>
                      {marketsList.map(m=><option key={m.market_id} value={m.market_id}>{m.label}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div className="form-group"><label>Sale Date</label><input type="date" className="form-control" value={form.sale_date} onChange={fi('sale_date')} required /></div>
                  <div className="form-group"><label>Sale Price (৳)</label><input type="number" step="0.01" min="0" className="form-control" value={form.sale_price} onChange={fi('sale_price')} required /></div>
                </div>
              </>
            ) : (
              <>
                <div className="three-col">
                  <div className="form-group"><label>Market Operator</label>
                    <select className="form-control" value={form.operator_id} onChange={fi('operator_id')} required>
                      <option value="">— Select Operator —</option>
                      {operators.map(o=><option key={o.user_id} value={o.user_id}>{o.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>City</label><input className="form-control" value={form.city} onChange={fi('city')} required /></div>
                  <div className="form-group"><label>Zone</label><input className="form-control" value={form.zone} onChange={fi('zone')} /></div>
                </div>
                <div className="form-group" style={{ maxWidth:200 }}><label>Market Type</label>
                  <select className="form-control" value={form.market_type} onChange={fi('market_type')}>
                    <option>Wholesale</option><option>Retail</option><option>Export</option>
                  </select>
                </div>
              </>
            )}
            <button type="submit" className="btn btn-primary">{editingId?'💾 Save Changes':'✅ Create Record'}</button>
          </form>
        </div>
      )}

      <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:14, flexWrap:'wrap' }}>
        {[['sales','💰 Sales',filtS.length],['markets','🏪 Markets',filtM.length]].map(([t,l,cnt])=>(
          <button key={t} className={`btn btn-sm ${tab===t?'btn-primary':'btn-outline'}`} onClick={()=>setTab(t)}>{l} ({cnt})</button>
        ))}
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          <input className="form-control" placeholder="🔍 Search…" value={search} onChange={e=>setSearch(e.target.value)} style={{ width:220 }} />
          {search && <button className="btn btn-outline btn-sm" onClick={()=>setSearch('')}>✕</button>}
        </div>
      </div>

      {tab === 'sales' && (
        <div className="card">
          <div className="section-header"><h3>💰 Sales Records ({filtS.length})</h3>
            <button className="btn btn-primary btn-sm" onClick={()=>openAdd('sales')}>+ Add Sale</button>
          </div>
          <table>
            <thead><tr><th>#</th><th>Product</th><th>Market</th><th>Sale Date</th><th>Sale Price</th><th>Actions</th></tr></thead>
            <tbody>
              {loading && <tr><td colSpan="6" style={{ textAlign:'center' }}>Loading…</td></tr>}
              {!loading && filtS.length===0 && <tr><td colSpan="6" style={{ textAlign:'center' }}>No results.</td></tr>}
              {filtS.map(s=>(
                <tr key={s.sale_id}>
                  <td><strong>#{s.sale_id}</strong></td><td>{s.product_name}</td><td>{s.market_city}, {s.market_zone}</td>
                  <td>{s.sale_date?new Date(s.sale_date).toLocaleDateString():'—'}</td>
                  <td><strong>৳ {parseFloat(s.sale_price).toLocaleString()}</strong></td>
                  <td>
                    <button className="btn btn-outline btn-sm" style={{ marginRight:6 }} onClick={()=>openEdit('sales',s)}>✏️</button>
                    <button className="btn btn-amber btn-sm" onClick={()=>handleDelete('sales',s.sale_id)}>🗑️</button>
                  </td>
                </tr>
              ))}
              {filtS.length > 0 && (
                <tr style={{ fontWeight:700, background:'var(--bg)' }}>
                  <td colSpan="4" style={{ textAlign:'right' }}>Total (filtered)</td>
                  <td>৳ {filtS.reduce((a,s)=>a+parseFloat(s.sale_price||0),0).toLocaleString()}</td><td></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'markets' && (
        <div className="card">
          <div className="section-header"><h3>🏪 Markets ({filtM.length})</h3>
            <button className="btn btn-primary btn-sm" onClick={()=>openAdd('markets')}>+ Add Market</button>
          </div>
          <table>
            <thead><tr><th>#</th><th>Operator</th><th>City</th><th>Zone</th><th>Type</th><th>Actions</th></tr></thead>
            <tbody>
              {!loading && filtM.length===0 && <tr><td colSpan="6" style={{ textAlign:'center' }}>No results.</td></tr>}
              {filtM.map(m=>(
                <tr key={m.market_id}>
                  <td><strong>#{m.market_id}</strong></td><td>{m.operator_name}</td><td>{m.city}</td><td>{m.zone||'—'}</td>
                  <td><Badge text={m.market_type||'—'} color="blue" /></td>
                  <td>
                    <button className="btn btn-outline btn-sm" style={{ marginRight:6 }} onClick={()=>openEdit('markets',m)}>✏️</button>
                    <button className="btn btn-amber btn-sm" onClick={()=>handleDelete('markets',m.market_id)}>🗑️</button>
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

export default MarketDataAdmin;
