// MarketList — Market operator view of all markets (re-uses SalesManagement markets tab)
// For the MO role, we direct them to /market/markets -> SalesManagement with markets tab default
// This standalone page shows just the markets listing.
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Badge } from '../../components/SharedUI';

const MarketList = () => {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:3001/api/market/markets').then(r => setMarkets(r.data)).catch(() => setMarkets([])).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>🏪 Markets</h2>
        <p>All registered market locations in the AgriChain network</p>
      </div>
      <div className="card">
        <div className="section-header">
          <h3>📋 Market Directory</h3>
          <a className="btn btn-primary" href="/market/sales">+ Add Market via Sales Page</a>
        </div>
        <table>
          <thead><tr><th>#</th><th>Operator</th><th>City</th><th>Zone</th><th>Type</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan="5" style={{ textAlign: 'center' }}>Loading…</td></tr>}
            {!loading && markets.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>No markets found.</td></tr>}
            {markets.map(m => (
              <tr key={m.market_id}>
                <td><strong>#{m.market_id}</strong></td>
                <td>{m.operator_name}</td>
                <td>{m.city}</td>
                <td>{m.zone || '—'}</td>
                <td><Badge text={m.market_type || '—'} color="blue" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MarketList;
