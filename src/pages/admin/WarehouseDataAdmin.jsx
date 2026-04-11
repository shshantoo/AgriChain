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

const WH = 'http://localhost:3001/api/warehouse';
const emptyInv = { batch_id:'', warehouse_id:'', quantity:'', shelf_life:'', remaining_shelf_life:'', packaging_details:'', reorder_level:'', max_stock_level:'', stock_status:'In Stock' };
const emptyWH = { area:'', district:'', capacity:'' };
const emptyMov = { batch_id:'', warehouse_id:'', movement_date:'', quantity_removed:'', from_location:'', to_location:'', movement_type:'Transfer' };

const WarehouseDataAdmin = () => {
  const [inventory, setInventory] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [movements, setMovements] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('inventory');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('inventory');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const [inv, wh, mv, b] = await Promise.all([
        axios.get(`${WH}/inventory`), axios.get(`${WH}/warehouses`),
        axios.get(`${WH}/stock-movement`), axios.get('http://localhost:3001/api/admin/batches-list'),
      ]);
      setInventory(inv.data); setWarehouses(wh.data); setMovements(mv.data); setBatches(b.data);
    } catch { } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const whList = warehouses.map(w=>({ warehouse_id: w.warehouse_id, label:`${w.area}, ${w.district}` }));

  const openAdd = (type) => { setFormType(type); setEditingId(null); setShowForm(true); setTab(type); 
    setForm(type==='inventory'?{...emptyInv}:type==='movement'?{...emptyMov}:{...emptyWH}); };
  const openEdit = (type, row) => {
    setFormType(type); setShowForm(true); setTab(type);
    if (type==='inventory') { setEditingId(row.inventory_id); setForm({ batch_id:row.batch_id, warehouse_id:row.warehouse_id, quantity:row.quantity, shelf_life:row.shelf_life||'', remaining_shelf_life:row.remaining_shelf_life||'', packaging_details:row.packaging_details||'', reorder_level:row.reorder_level||'', max_stock_level:row.max_stock_level||'', stock_status:row.stock_status||'In Stock' }); }
    else if (type==='movement') { setEditingId(row.movement_id); setForm({ batch_id:row.batch_id, warehouse_id:row.warehouse_id, movement_date:row.movement_date?.split('T')[0]||'', quantity_removed:row.quantity_removed, from_location:row.from_location||'', to_location:row.to_location||'', movement_type:row.movement_type||'Transfer' }); }
    else { setEditingId(row.warehouse_id); setForm({ area:row.area, district:row.district, capacity:row.capacity }); }
  };
  const closeForm = () => { setShowForm(false); setEditingId(null); };
  const handleSubmit = async e => {
    e.preventDefault();
    const urls = { inventory:`${WH}/inventory`, movement:`${WH}/stock-movement`, warehouses:`${WH}/warehouses` };
    const ids = { inventory:editingId, movement:editingId, warehouses:editingId };
    try { if (editingId) await axios.put(`${urls[formType]}/${ids[formType]}`, form); else await axios.post(urls[formType], form); closeForm(); load(); }
    catch (err) { alert(err.response?.data?.error || 'Save failed'); }
  };
  const handleDelete = async (type, id) => {
    if (!window.confirm('Delete this record?')) return;
    const urls = { inventory:`${WH}/inventory`, movement:`${WH}/stock-movement`, warehouses:`${WH}/warehouses` };
    try { await axios.delete(`${urls[type]}/${id}`); load(); } catch { alert('Delete failed — may have dependent records'); }
  };
  const fi = k => e => setForm({ ...form, [k]: e.target.value });

  // Charts
  const invByWH = Object.entries(inventory.reduce((acc,i)=>{ const k=i.district||'Unknown'; acc[k]=(acc[k]||0)+parseFloat(i.quantity||0); return acc; },{})).map(([name,value])=>({ name, value:+value.toFixed(1) }));
  const statusDistrib = Object.entries(inventory.reduce((acc,i)=>{ const s=i.stock_status||'Unknown'; acc[s]=(acc[s]||0)+1; return acc; },{})).map(([name,value])=>({ name, value }));
  const capData = warehouses.map(w=>{ const used=inventory.filter(i=>i.warehouse_id===w.warehouse_id).reduce((a,i)=>a+parseFloat(i.quantity||0),0); return { name:w.district, capacity:parseFloat(w.capacity), used:+used.toFixed(1), free:+(parseFloat(w.capacity)-used).toFixed(1) }; });
  const movTypeDistrib = Object.entries(movements.reduce((acc,m)=>{ acc[m.movement_type]=(acc[m.movement_type]||0)+1; return acc; },{})).map(([name,value])=>({ name, value }));

  const q = search.toLowerCase();
  const filtI = inventory.filter(i=>`${i.product_name} ${i.area} ${i.district} ${i.stock_status}`.toLowerCase().includes(q));
  const filtM = movements.filter(m=>`${m.product_name} ${m.warehouse_area} ${m.movement_type}`.toLowerCase().includes(q));
  const filtW = warehouses.filter(w=>`${w.area} ${w.district}`.toLowerCase().includes(q));
  const statusColor = s=>s==='In Stock'?'green':s==='Low Stock'?'amber':'red';

  return (
    <div className="page-body active">
      <div className="page-header"><h2>📦 Warehouse Data — Admin View</h2><p>Full CRUD for inventory, warehouses, and stock movements</p></div>
      <div className="stat-grid" style={{ marginBottom:20 }}>
        <StatCard label="Warehouses" value={warehouses.length} sub="Locations" badgeText="Active" badgeColor="blue" />
        <StatCard label="Total Stock" value={`${inventory.reduce((a,i)=>a+parseFloat(i.quantity||0),0).toFixed(1)} t`} sub="All warehouses" badgeText="Stock" badgeColor="green" />
        <StatCard label="Low Stock" value={inventory.filter(i=>i.stock_status!=='In Stock').length} badgeText="Alert" badgeColor="amber" />
        <StatCard label="Movements" value={movements.length} sub="Total records" badgeText="Tracked" badgeColor="blue" />
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
        <ChartCard title="📦 Inventory by District (t)">
          <ResponsiveContainer width="100%" height={180}><BarChart data={invByWH} margin={{ top:5,right:10,left:-10,bottom:5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="name" tick={CT} /><YAxis tick={CT} /><Tooltip {...TS} />
            <Bar dataKey="value" name="Qty (t)" fill="#4ade80" radius={[4,4,0,0]} />
          </BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="🏗️ Capacity vs Used (t)">
          <ResponsiveContainer width="100%" height={180}><BarChart data={capData} margin={{ top:5,right:10,left:-10,bottom:5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="name" tick={CT} /><YAxis tick={CT} /><Tooltip {...TS} /><Legend />
            <Bar dataKey="used" name="Used" fill="#4ade80" radius={[4,4,0,0]} /><Bar dataKey="free" name="Free" fill="#374151" radius={[4,4,0,0]} />
          </BarChart></ResponsiveContainer>
        </ChartCard>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
        <ChartCard title="📊 Stock Status">
          <ResponsiveContainer width="100%" height={160}><PieChart><Pie data={statusDistrib} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ name,percent })=>`${name.split(' ')[0]} ${(percent*100).toFixed(0)}%`}>
            {statusDistrib.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}
          </Pie><Tooltip {...TS} /><Legend /></PieChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="🔄 Movement Types">
          <ResponsiveContainer width="100%" height={160}><PieChart><Pie data={movTypeDistrib} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label={({ name,percent })=>`${name} ${(percent*100).toFixed(0)}%`}>
            {movTypeDistrib.map((_,i)=><Cell key={i} fill={COLORS[(i+2)%COLORS.length]} />)}
          </Pie><Tooltip {...TS} /></PieChart></ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Inline Form */}
      {showForm && (
        <div className="card" style={{ marginBottom:16, border:'2px solid var(--primary)' }}>
          <div className="section-header">
            <h3>{editingId?'✏️ Edit':'➕ Add'} {formType==='inventory'?'Inventory Record':formType==='movement'?'Stock Movement':'Warehouse'}</h3>
            <button className="btn btn-outline btn-sm" onClick={closeForm}>✕ Cancel</button>
          </div>
          <form onSubmit={handleSubmit}>
            {formType === 'inventory' && (
              <>
                <div className="three-col">
                  <div className="form-group"><label>Harvest Batch</label>
                    <select className="form-control" value={form.batch_id} onChange={fi('batch_id')} required>
                      <option value="">— Select Batch —</option>
                      {batches.map(b=><option key={b.batch_id} value={b.batch_id}>#{b.batch_id} — {b.product_name}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Warehouse</label>
                    <select className="form-control" value={form.warehouse_id} onChange={fi('warehouse_id')} required>
                      <option value="">— Select Warehouse —</option>
                      {whList.map(w=><option key={w.warehouse_id} value={w.warehouse_id}>{w.label}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Quantity (t)</label><input type="number" step="0.01" className="form-control" value={form.quantity} onChange={fi('quantity')} required /></div>
                </div>
                <div className="three-col">
                  <div className="form-group"><label>Shelf Life (days)</label><input type="number" className="form-control" value={form.shelf_life} onChange={fi('shelf_life')} /></div>
                  <div className="form-group"><label>Remaining Shelf Life (days)</label><input type="number" className="form-control" value={form.remaining_shelf_life} onChange={fi('remaining_shelf_life')} /></div>
                  <div className="form-group"><label>Stock Status</label>
                    <select className="form-control" value={form.stock_status} onChange={fi('stock_status')}>
                      <option>In Stock</option><option>Low Stock</option><option>Out of Stock</option>
                    </select>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
                  <div className="form-group"><label>Packaging Details</label><input className="form-control" value={form.packaging_details} onChange={fi('packaging_details')} /></div>
                  <div className="form-group"><label>Reorder Level (t)</label><input type="number" step="0.1" className="form-control" value={form.reorder_level} onChange={fi('reorder_level')} /></div>
                  <div className="form-group"><label>Max Stock Level (t)</label><input type="number" step="0.1" className="form-control" value={form.max_stock_level} onChange={fi('max_stock_level')} /></div>
                </div>
              </>
            )}
            {formType === 'movement' && (
              <>
                <div className="three-col">
                  <div className="form-group"><label>Harvest Batch</label>
                    <select className="form-control" value={form.batch_id} onChange={fi('batch_id')} required>
                      <option value="">— Select Batch —</option>
                      {batches.map(b=><option key={b.batch_id} value={b.batch_id}>#{b.batch_id} — {b.product_name}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Warehouse</label>
                    <select className="form-control" value={form.warehouse_id} onChange={fi('warehouse_id')} required>
                      <option value="">— Select Warehouse —</option>
                      {whList.map(w=><option key={w.warehouse_id} value={w.warehouse_id}>{w.label}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label>Movement Date</label><input type="date" className="form-control" value={form.movement_date} onChange={fi('movement_date')} required /></div>
                </div>
                <div className="three-col">
                  <div className="form-group"><label>Qty Removed (t)</label><input type="number" step="0.01" className="form-control" value={form.quantity_removed} onChange={fi('quantity_removed')} required /></div>
                  <div className="form-group"><label>From Location</label><input className="form-control" value={form.from_location} onChange={fi('from_location')} /></div>
                  <div className="form-group"><label>To Location</label><input className="form-control" value={form.to_location} onChange={fi('to_location')} /></div>
                </div>
                <div className="form-group" style={{ maxWidth:200 }}><label>Movement Type</label>
                  <select className="form-control" value={form.movement_type} onChange={fi('movement_type')}>
                    <option>Transfer</option><option>Dispatch</option><option>Return</option><option>Loss</option>
                  </select>
                </div>
              </>
            )}
            {formType === 'warehouses' && (
              <div className="three-col">
                <div className="form-group"><label>Area</label><input className="form-control" value={form.area} onChange={fi('area')} required /></div>
                <div className="form-group"><label>District</label><input className="form-control" value={form.district} onChange={fi('district')} required /></div>
                <div className="form-group"><label>Capacity (t)</label><input type="number" step="0.01" className="form-control" value={form.capacity} onChange={fi('capacity')} required /></div>
              </div>
            )}
            <button type="submit" className="btn btn-primary">{editingId?'💾 Save Changes':'✅ Create Record'}</button>
          </form>
        </div>
      )}

      {/* Tabs + Search */}
      <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:14, flexWrap:'wrap' }}>
        {[['inventory','📦 Inventory',filtI.length],['movement','🔄 Movements',filtM.length],['warehouses','🏗️ Warehouses',filtW.length]].map(([t,l,cnt])=>(
          <button key={t} className={`btn btn-sm ${tab===t?'btn-primary':'btn-outline'}`} onClick={()=>setTab(t)}>{l} ({cnt})</button>
        ))}
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          <input className="form-control" placeholder="🔍 Search…" value={search} onChange={e=>setSearch(e.target.value)} style={{ width:220 }} />
          {search && <button className="btn btn-outline btn-sm" onClick={()=>setSearch('')}>✕</button>}
        </div>
      </div>

      {tab === 'inventory' && (
        <div className="card">
          <div className="section-header"><h3>📦 Inventory ({filtI.length})</h3>
            <button className="btn btn-primary btn-sm" onClick={()=>openAdd('inventory')}>+ Add Record</button>
          </div>
          <table><thead><tr><th>#</th><th>Product</th><th>Warehouse</th><th>Qty (t)</th><th>Shelf Life</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {loading && <tr><td colSpan="7" style={{ textAlign:'center' }}>Loading…</td></tr>}
              {!loading && filtI.length===0 && <tr><td colSpan="7" style={{ textAlign:'center' }}>No results.</td></tr>}
              {filtI.map(i=>(
                <tr key={i.inventory_id}>
                  <td><strong>#{i.inventory_id}</strong></td><td>{i.product_name}</td><td>{i.area}, {i.district}</td>
                  <td>{i.quantity} t</td><td>{i.shelf_life?`${i.shelf_life}d`:'—'}</td>
                  <td><Badge text={i.stock_status||'—'} color={statusColor(i.stock_status)} /></td>
                  <td><button className="btn btn-outline btn-sm" style={{ marginRight:6 }} onClick={()=>openEdit('inventory',i)}>✏️</button>
                    <button className="btn btn-amber btn-sm" onClick={()=>handleDelete('inventory',i.inventory_id)}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'movement' && (
        <div className="card">
          <div className="section-header"><h3>🔄 Stock Movements ({filtM.length})</h3>
            <button className="btn btn-primary btn-sm" onClick={()=>openAdd('movement')}>+ Add Movement</button>
          </div>
          <table><thead><tr><th>#</th><th>Product</th><th>Warehouse</th><th>Qty Removed</th><th>Type</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {!loading && filtM.length===0 && <tr><td colSpan="7" style={{ textAlign:'center' }}>No results.</td></tr>}
              {filtM.map(m=>(
                <tr key={m.movement_id}>
                  <td><strong>#{m.movement_id}</strong></td><td>{m.product_name}</td><td>{m.warehouse_area}, {m.warehouse_district}</td>
                  <td>{m.quantity_removed} t</td><td><Badge text={m.movement_type||'—'} color="blue" /></td>
                  <td>{m.movement_date?new Date(m.movement_date).toLocaleDateString():'—'}</td>
                  <td><button className="btn btn-outline btn-sm" style={{ marginRight:6 }} onClick={()=>openEdit('movement',m)}>✏️</button>
                    <button className="btn btn-amber btn-sm" onClick={()=>handleDelete('movement',m.movement_id)}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'warehouses' && (
        <div className="card">
          <div className="section-header"><h3>🏗️ Warehouses ({filtW.length})</h3>
            <button className="btn btn-primary btn-sm" onClick={()=>openAdd('warehouses')}>+ Add Warehouse</button>
          </div>
          <table><thead><tr><th>#</th><th>Area</th><th>District</th><th>Capacity (t)</th><th>Actions</th></tr></thead>
            <tbody>
              {!loading && filtW.length===0 && <tr><td colSpan="5" style={{ textAlign:'center' }}>No results.</td></tr>}
              {filtW.map(w=>(
                <tr key={w.warehouse_id}>
                  <td><strong>#{w.warehouse_id}</strong></td><td>{w.area}</td><td>{w.district}</td><td>{w.capacity} t</td>
                  <td><button className="btn btn-outline btn-sm" style={{ marginRight:6 }} onClick={()=>openEdit('warehouses',w)}>✏️</button>
                    <button className="btn btn-amber btn-sm" onClick={()=>handleDelete('warehouses',w.warehouse_id)}>🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default WarehouseDataAdmin;
