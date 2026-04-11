import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { StatCard, Badge } from '../../components/SharedUI';

const COLORS = ['#4ade80', '#60a5fa', '#f59e0b', '#f87171', '#a78bfa', '#34d399', '#fb923c', '#818cf8'];
const CT = { fill: 'var(--text-muted)', fontSize: 11 };
const TS = { contentStyle: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 } };

const ROLE_LABELS = { F: 'Farmers', S: 'Suppliers', WM: 'WH Managers', PM: 'Proc. Managers', QI: 'QC Inspectors', A: 'Admins', MO: 'Market Operators', LM: 'Logistics Mgrs' };

const ChartCard = ({ title, children, span }) => (
  <div className="card" style={span ? { gridColumn: span } : {}}>
    <div style={{ fontWeight: 600, marginBottom: 14, fontSize: '0.9rem' }}>{title}</div>
    {children}
  </div>
);

const SystemOverview = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [harvests, setHarvests] = useState([]);
  const [sales, setSales] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      axios.get('http://localhost:3001/api/admin/stats'),
      axios.get('http://localhost:3001/api/admin/users'),
      axios.get('http://localhost:3001/api/farmer/harvest'),
      axios.get('http://localhost:3001/api/market/sales'),
      axios.get('http://localhost:3001/api/warehouse/inventory'),
      axios.get('http://localhost:3001/api/delivery'),
    ]).then(([s, u, h, sa, inv, d]) => {
      setStats(s.data); setUsers(u.data); setHarvests(h.data);
      setSales(sa.data); setInventory(inv.data); setDeliveries(d.data);
    }).catch(() => setStats(null)).finally(() => setLoading(false));
  }, []);

  // ── Chart Data ──────────────────────────────────────────────────
  const usersByRole = Object.entries(
    users.reduce((acc, u) => { const lbl = ROLE_LABELS[u.role_type] || u.role_type; acc[lbl] = (acc[lbl] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const harvestByProduct = Object.entries(
    harvests.reduce((acc, h) => { acc[h.product_name] = (acc[h.product_name] || 0) + parseFloat(h.quantity || 0); return acc; }, {})
  ).map(([name, value]) => ({ name, value: +value.toFixed(1) })).sort((a, b) => b.value - a.value);

  const inventoryByWarehouse = Object.entries(
    inventory.reduce((acc, i) => { const k = i.district || 'Unknown'; acc[k] = (acc[k] || 0) + parseFloat(i.quantity || 0); return acc; }, {})
  ).map(([name, value]) => ({ name, value: +value.toFixed(1) }));

  const salesByProduct = Object.entries(
    sales.reduce((acc, s) => { acc[s.product_name] = (acc[s.product_name] || 0) + parseFloat(s.sale_price || 0); return acc; }, {})
  ).map(([name, value]) => ({ name, revenue: +value.toFixed(0) })).sort((a, b) => b.revenue - a.revenue);

  const salesByMonth = Object.entries(
    sales.reduce((acc, s) => {
      if (!s.sale_date) return acc;
      const m = new Date(s.sale_date).toLocaleString('default', { month: 'short', year: '2-digit' });
      acc[m] = (acc[m] || 0) + parseFloat(s.sale_price || 0);
      return acc;
    }, {})
  ).map(([name, revenue]) => ({ name, revenue: +revenue.toFixed(0) }));

  const deliveryStatus = Object.entries(
    deliveries.reduce((acc, d) => { acc[d.status] = (acc[d.status] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const gradeDistrib = Object.entries(
    harvests.reduce((acc, h) => { const g = h.quality_grade || 'N/A'; acc[g] = (acc[g] || 0) + 1; return acc; }, {})
  ).map(([name, value]) => ({ name, value }));

  const totalRevenue = sales.reduce((a, s) => a + parseFloat(s.sale_price || 0), 0);

  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>🌐 System Overview</h2>
        <p>AgriChain v2.0 — Live analytics dashboard across all modules</p>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>⏳ Loading system data…</div>
      ) : !stats ? (
        <div className="alert alert-danger">⚠️ Could not load system stats. Ensure the backend is running.</div>
      ) : (
        <>
          {/* KPIs */}
          <div className="stat-grid" style={{ marginBottom: 20 }}>
            <StatCard label="Total Users" value={stats.totalUsers} sub="Across all 8 roles" badgeText="System" badgeColor="blue" />
            <StatCard label="Harvest Batches" value={stats.totalHarvestBatches} sub="All time" badgeText="Production" badgeColor="green" />
            <StatCard label="Total Inventory" value={`${parseFloat(stats.totalInventoryQty).toFixed(1)} t`} sub="In all warehouses" badgeText="Stock" badgeColor="blue" />
            <StatCard label="Total Revenue" value={`৳ ${(totalRevenue / 1000).toFixed(1)}K`} sub="Cumulative sales" badgeText="Finance" badgeColor="green" />
            <StatCard label="Total Deliveries" value={stats.totalDeliveries} sub="All dispatches" badgeText="Logistics" badgeColor="amber" />
            <StatCard label="Total Sales" value={stats.totalSalesRecords ?? sales.length} sub="Transactions" badgeText="Market" badgeColor="green" />
          </div>

          {/* Row 1: Users + Harvest */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 16 }}>
            <ChartCard title="👥 Users by Role">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={usersByRole} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}>
                    {usersByRole.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip {...TS} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="🌾 Harvest Production by Product (t)">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={harvestByProduct} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={CT} />
                  <YAxis tick={CT} />
                  <Tooltip {...TS} />
                  <Bar dataKey="value" name="Qty (t)" fill="#4ade80" radius={[4, 4, 0, 0]}>
                    {harvestByProduct.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Row 2: Sales over time + Sales by product */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
            <ChartCard title="📈 Revenue Trend by Month (৳)">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={salesByMonth} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={CT} />
                  <YAxis tick={CT} tickFormatter={v => `৳${(v / 1000).toFixed(0)}K`} />
                  <Tooltip {...TS} formatter={v => [`৳ ${v.toLocaleString()}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#4ade80" strokeWidth={3} dot={{ fill: '#4ade80', r: 5, strokeWidth: 2 }} activeDot={{ r: 7 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="💰 Revenue by Product (৳)">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={salesByProduct} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" tick={CT} tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                  <YAxis type="category" dataKey="name" tick={CT} width={60} />
                  <Tooltip {...TS} formatter={v => [`৳ ${v.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#60a5fa" radius={[0, 4, 4, 0]}>
                    {salesByProduct.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Row 3: Inventory + Delivery Status + Grade Distribution */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
            <ChartCard title="📦 Inventory by District (t)">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={inventoryByWarehouse} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={CT} />
                  <YAxis tick={CT} />
                  <Tooltip {...TS} />
                  <Bar dataKey="value" name="Stock (t)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="🚚 Delivery Status">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={deliveryStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}>
                    {deliveryStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip {...TS} /><Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="🎖️ Harvest Grade Distribution">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={gradeDistrib} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    <Cell fill="#4ade80" /><Cell fill="#60a5fa" /><Cell fill="#f87171" />
                  </Pie>
                  <Tooltip {...TS} /><Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Role Cards + Quick Links */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
            <div className="card">
              <div className="section-header"><h3>🏗️ System Modules</h3></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginTop: 12 }}>
                {[
                  { icon: '👨‍🌾', label: 'Farmer', desc: 'Sowing · Harvest · Inputs' },
                  { icon: '🚚', label: 'Supplier', desc: 'Input Supply Delivery' },
                  { icon: '🏭', label: 'Warehouse', desc: 'Inventory · Sensors · Movement' },
                  { icon: '⚙️', label: 'Processing', desc: 'Plants · Batches' },
                  { icon: '🔬', label: 'Quality', desc: 'QC Reports · Grading' },
                  { icon: '🚛', label: 'Logistics', desc: 'Delivery Tracking' },
                  { icon: '🏪', label: 'Market', desc: 'Markets · Sales' },
                  { icon: '🛡️', label: 'Admin', desc: 'Full System Access' },
                ].map(r => (
                  <div key={r.label} style={{ background: 'var(--bg)', padding: '10px', textAlign: 'center', borderRadius: 8 }}>
                    <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>{r.icon}</div>
                    <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{r.label}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{r.desc}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="section-header"><h3>⚡ Quick Navigation</h3></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 8 }}>
                {[
                  ['/admin/batch-trace', '🔗 Batch Traceability'],
                  ['/admin/farmer-data', '🌾 Farmer Data'],
                  ['/admin/warehouse-data', '📦 Warehouse Data'],
                  ['/admin/processing-data', '⚙️ Processing Data'],
                  ['/admin/quality-data', '🔬 Quality Data'],
                  ['/admin/delivery-data', '🚚 Delivery Data'],
                  ['/admin/market-data', '💰 Market & Sales'],
                  ['/admin/users', '👥 User Management'],
                ].map(([path, label]) => (
                  <a key={path} href={path} className="btn btn-outline btn-sm" style={{ textDecoration: 'none', textAlign: 'left' }}>{label}</a>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SystemOverview;
