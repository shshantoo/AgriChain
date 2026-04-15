import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Badge } from '../../components/SharedUI';

const TRACE_URL = id => `http://localhost:3001/api/admin/batch/${id}/trace`;

const Section = ({ title, children }) => (
  <div className="card" style={{ marginTop: 16 }}>
    <div className="section-header"><h3>{title}</h3></div>
    {children}
  </div>
);

const BatchTraceability = () => {
  const [batchId, setBatchId] = useState('');
  const [trace, setTrace] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [batches, setBatches] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3001/api/admin/batches-list')
      .then(res => setBatches(res.data))
      .catch(console.error);
  }, []);

  const fetchTrace = async (id) => {
    setError(''); setTrace(null);
    if (!id) return;
    setLoading(true);
    setBatchId(id); // Keep input synced
    try {
      const r = await axios.get(TRACE_URL(id));
      setTrace(r.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Batch not found');
    } finally { setLoading(false); }
  };

  const handleSearch = e => {
    e.preventDefault();
    fetchTrace(batchId);
  };

  const filteredBatches = batches.filter(b => 
    b.product_name.toLowerCase().includes(filter.toLowerCase()) ||
    b.farmer_name.toLowerCase().includes(filter.toLowerCase()) ||
    String(b.batch_id).includes(filter)
  );

  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>🔗 Batch Traceability</h2>
        <p>Enter a Harvest Batch ID to trace the complete supply chain journey</p>
      </div>

      <div className="card">
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', marginBottom: 24 }}>
          <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
            <label>Harvest Batch ID</label>
            <input className="form-control" type="number" value={batchId} onChange={e => setBatchId(e.target.value)} placeholder="e.g. 1" required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '⏳ Searching…' : '🔍 Trace Batch'}
          </button>
        </form>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '16px 0' }} />
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>📋 Available Harvest Batches</h3>
          <input 
            type="text" 
            className="form-control" 
            style={{ width: '250px' }}
            placeholder="Search by ID, Product, or Farmer..." 
            value={filter} 
            onChange={e => setFilter(e.target.value)} 
          />
        </div>
        
        <div style={{ maxHeight: 280, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8 }}>
          <table>
            <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
              <tr>
                <th>Batch #</th>
                <th>Product</th>
                <th>Farmer</th>
                <th>Harvest Date</th>
                <th>Qty (t)</th>
                <th>Grade</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredBatches.map(b => (
                <tr key={b.batch_id}>
                  <td><strong>#{b.batch_id}</strong></td>
                  <td>{b.product_name}</td>
                  <td>{b.farmer_name}</td>
                  <td>{new Date(b.harvest_date).toLocaleDateString()}</td>
                  <td>{b.quantity}</td>
                  <td><Badge text={b.quality_grade || '—'} color={b.quality_grade === 'A' ? 'green' : 'amber'} /></td>
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      type="button"
                      className="btn btn-sm btn-outline" 
                      onClick={() => fetchTrace(b.batch_id)}
                      disabled={loading}
                    >
                      Trace
                    </button>
                  </td>
                </tr>
              ))}
              {filteredBatches.length === 0 && (
                <tr><td colSpan="7" style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No batches found matching your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {error && <div className="alert alert-danger" style={{ marginTop: 16 }}>⚠️ {error}</div>}

      {trace && (
        <>
          {/* Batch & Farmer */}
          <Section title="🌾 Harvest Batch — Core Info">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginTop: 12 }}>
              {[
                ['Batch #', trace.batch.batch_id],
                ['Product', trace.batch.product_name],
                ['Category', trace.batch.category || '—'],
                ['Harvest Date', trace.batch.harvest_date ? new Date(trace.batch.harvest_date).toLocaleDateString() : '—'],
                ['Quantity', `${trace.batch.quantity} t`],
                ['Quality Grade', trace.batch.quality_grade || '—'],
                ['Farmer', trace.batch.farmer_name],
                ['Farm Village', trace.batch.farm_village || '—'],
                ['Farm District', trace.batch.farm_district || '—'],
                ['Farm Size', trace.batch.farm_size ? `${trace.batch.farm_size} ha` : '—'],
                ['Shelf Life', trace.batch.shelf_life ? `${trace.batch.shelf_life} days` : '—'],
                ['Storage Req.', trace.batch.storage_requirement || '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ background: 'var(--bg)', padding: '10px 14px', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>{k}</div>
                  <div style={{ fontWeight: 600 }}>{v}</div>
                </div>
              ))}
            </div>
          </Section>

          {/* Inventory */}
          <Section title={`📦 Inventory (${trace.inventory.length} record${trace.inventory.length !== 1 ? 's' : ''})`}>
            {trace.inventory.length === 0 ? <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>No inventory records.</p> : (
              <table style={{ marginTop: 8 }}>
                <thead><tr><th>Warehouse</th><th>District</th><th>Qty (t)</th><th>Shelf Life</th><th>Status</th></tr></thead>
                <tbody>{trace.inventory.map(i => (
                  <tr key={i.inventory_id}>
                    <td>{i.area}</td><td>{i.district}</td><td>{i.quantity}</td>
                    <td>{i.shelf_life ? `${i.shelf_life} days` : '—'}</td>
                    <td><Badge text={i.stock_status || '—'} color={i.stock_status === 'In Stock' ? 'green' : 'amber'} /></td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </Section>

          {/* Stock Movements */}
          <Section title={`🔄 Stock Movements (${trace.movements.length})`}>
            {trace.movements.length === 0 ? <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>No stock movements.</p> : (
              <table style={{ marginTop: 8 }}>
                <thead><tr><th>Date</th><th>Warehouse</th><th>Qty Removed</th><th>From</th><th>To</th><th>Type</th></tr></thead>
                <tbody>{trace.movements.map(m => (
                  <tr key={m.movement_id}>
                    <td>{new Date(m.movement_date).toLocaleDateString()}</td>
                    <td>{m.area}, {m.district}</td><td>{m.quantity_removed} t</td>
                    <td>{m.from_location || '—'}</td><td>{m.to_location || '—'}</td>
                    <td><Badge text={m.movement_type || '—'} color="blue" /></td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </Section>

          {/* Processing */}
          <Section title={`⚙️ Processing Batches (${trace.processing.length})`}>
            {trace.processing.length === 0 ? <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>No processing records.</p> : (
              <table style={{ marginTop: 8 }}>
                <thead><tr><th>#</th><th>Plant</th><th>District</th><th>Plant Type</th><th>Processing Date</th></tr></thead>
                <tbody>{trace.processing.map(p => (
                  <tr key={p.processing_id}>
                    <td><strong>#{p.processing_id}</strong></td>
                    <td>{p.area}</td><td>{p.district}</td><td>{p.process_plants_type || '—'}</td>
                    <td>{new Date(p.processing_date).toLocaleDateString()}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </Section>

          {/* Quality Reports */}
          <Section title={`🔬 Quality Reports (${trace.qualityReports.length})`}>
            {trace.qualityReports.length === 0 ? <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>No quality reports.</p> : (
              <table style={{ marginTop: 8 }}>
                <thead><tr><th>Inspector</th><th>Moisture%</th><th>Purity%</th><th>Defect Level</th><th>Status</th><th>Remarks</th></tr></thead>
                <tbody>{trace.qualityReports.map(qr => (
                  <tr key={qr.report_id}>
                    <td>{qr.inspector_name}</td><td>{qr.moisture_content ?? '—'}%</td>
                    <td>{qr.purity ?? '—'}%</td><td>{qr.defect_level || '—'}</td>
                    <td><Badge text={qr.grading_status || '—'} color={qr.grading_status === 'Pass' ? 'green' : qr.grading_status?.includes('Conditions') ? 'amber' : 'red'} /></td>
                    <td style={{ maxWidth: 200, whiteSpace: 'pre-wrap' }}>{qr.remarks || '—'}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </Section>

          {/* Deliveries */}
          <Section title={`🚚 Deliveries (${trace.deliveries.length})`}>
            {trace.deliveries.length === 0 ? <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>No deliveries.</p> : (
              <table style={{ marginTop: 8 }}>
                <thead><tr><th>Market</th><th>Zone</th><th>Logistics Manager</th><th>From</th><th>To</th><th>Date</th><th>Status</th></tr></thead>
                <tbody>{trace.deliveries.map(d => (
                  <tr key={d.delivery_id}>
                    <td>{d.city}</td><td>{d.zone}</td><td>{d.logistics_manager}</td>
                    <td>{d.source_area}, {d.source_district}</td>
                    <td>{d.destination_area}, {d.destination_district}</td>
                    <td>{d.transport_date ? new Date(d.transport_date).toLocaleDateString() : '—'}</td>
                    <td><Badge text={d.status} color={d.status === 'Delivered' ? 'green' : d.status === 'In Transit' ? 'blue' : 'amber'} /></td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </Section>

          {/* Sales */}
          <Section title={`💰 Sales (${trace.sales.length})`}>
            {trace.sales.length === 0 ? <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>No sales records.</p> : (
              <table style={{ marginTop: 8 }}>
                <thead><tr><th>Market</th><th>Zone</th><th>Sale Date</th><th>Sale Price</th></tr></thead>
                <tbody>
                  {trace.sales.map(s => (
                    <tr key={s.sale_id}>
                      <td>{s.city}</td><td>{s.zone}</td>
                      <td>{new Date(s.sale_date).toLocaleDateString()}</td>
                      <td><strong>৳ {parseFloat(s.sale_price).toLocaleString()}</strong></td>
                    </tr>
                  ))}
                  <tr style={{ background: 'var(--bg)', fontWeight: 700 }}>
                    <td colSpan="3">Total Revenue</td>
                    <td>৳ {trace.sales.reduce((acc, s) => acc + parseFloat(s.sale_price), 0).toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </Section>
        </>
      )}
    </div>
  );
};

export default BatchTraceability;
