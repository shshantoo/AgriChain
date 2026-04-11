import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Badge } from '../../components/SharedUI';

const BASE = 'http://localhost:3001/api/farmer';

const InputSupplyReceived = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { const r = await axios.get(`${BASE}/input-supply`); setRecords(r.data); }
    catch { setRecords([]); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>📦 Input Supplies Received</h2>
        <p>View all input supplies (seeds, fertilisers, pesticides) that have been delivered to you</p>
      </div>
      <div className="card">
        <div className="section-header">
          <h3>📋 Supply Records</h3>
          <button className="btn btn-outline btn-sm" onClick={load}>↻ Refresh</button>
        </div>
        <table>
          <thead>
            <tr><th>ID</th><th>Supplier</th><th>Input Type</th><th>Quantity</th><th>Supply Date</th><th>Cost</th><th>Current Stock</th><th>Usage Rate</th></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan="8" style={{ textAlign: 'center' }}>Loading…</td></tr>}
            {!loading && records.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center' }}>No supply records found.</td></tr>}
            {records.map(r => (
              <tr key={r.supply_id}>
                <td><strong>#{r.supply_id}</strong></td>
                <td>{r.supplier_name}</td>
                <td>{r.input_type}</td>
                <td>{r.quantity}</td>
                <td>{r.supply_date ? new Date(r.supply_date).toLocaleDateString() : '—'}</td>
                <td>{r.cost ? `৳ ${parseFloat(r.cost).toLocaleString()}` : '—'}</td>
                <td>{r.current_stock_level ?? '—'}</td>
                <td>{r.usage_rate ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InputSupplyReceived;
