import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Badge } from '../../components/SharedUI';

const HarvestTracking = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    plot: 'Plot A1 — Paddy',
    harvest_date: '2025-03-10',
    quantity_tonnes: 5.8,
    grade: 'Grade A (Premium)',
    storage_conditions: 'Dry, Ambient',
    movement_tracking: 'Direct transfer to KL Central',
    destination: 'Warehouse Central — KL'
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/farmer/harvest');
      setRecords(res.data);
    } catch (err) {
      console.error('API Error:', err);
      setRecords([
        { batch_id: 'A1-0312', plot: 'Paddy', quantity_tonnes: 5.8, status: 'Delivered' },
        { batch_id: 'B2-0218', plot: 'Maize', quantity_tonnes: 3.2, status: 'In Transit' },
        { batch_id: 'A1-1205', plot: 'Paddy', quantity_tonnes: 6.1, status: 'Archived' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await axios.post('http://localhost:3001/api/farmer/harvest', formData);
      fetchRecords();
      alert('Harvest recorded and QR generated!');
    } catch (err) {
      console.error('Error saving harvest:', err);
      alert('Failed to save harvest.');
    }
  };

  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>Harvest Tracking</h2>
        <p>Log harvest quantities and generate QR/Barcode for traceability</p>
      </div>
      <div className="two-col">
        <div>
          <div className="card">
            <div className="section-header"><h3>🌾 Log New Harvest</h3></div>
            <div className="form-group">
              <label>Plot</label>
              <select className="form-control" value={formData.plot} onChange={e => setFormData({...formData, plot: e.target.value})}>
                <option>Plot A1 — Paddy</option>
                <option>Plot B2 — Maize</option>
              </select>
            </div>
            <div className="two-col" style={{gap:'12px'}}>
              <div className="form-group">
                <label>Harvest Date</label>
                <input type="date" className="form-control" value={formData.harvest_date} onChange={e => setFormData({...formData, harvest_date: e.target.value})}/>
              </div>
              <div className="form-group">
                <label>Quantity (tonnes)</label>
                <input type="number" className="form-control" value={formData.quantity_tonnes} onChange={e => setFormData({...formData, quantity_tonnes: e.target.value})}/>
              </div>
            </div>
            <div className="form-group">
              <label>Quality Grade</label>
              <select className="form-control" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})}>
                <option>Grade A (Premium)</option>
                <option>Grade B (Standard)</option>
                <option>Grade C (Commercial)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Storage Conditions</label>
              <input type="text" className="form-control" value={formData.storage_conditions} onChange={e => setFormData({...formData, storage_conditions: e.target.value})}/>
            </div>
            <div className="form-group">
              <label>Movement across storage facilities or processing units</label>
              <input type="text" className="form-control" value={formData.movement_tracking} onChange={e => setFormData({...formData, movement_tracking: e.target.value})}/>
            </div>
            <div className="form-group">
              <label>Destination Warehouse</label>
              <select className="form-control" value={formData.destination} onChange={e => setFormData({...formData, destination: e.target.value})}>
                <option>Warehouse Central — KL</option>
                <option>Warehouse North — Kedah</option>
              </select>
            </div>
            <button className="btn btn-primary" style={{marginRight:'10px'}} onClick={handleSubmit}>💾 Save & Generate QR</button>
            <button className="btn btn-outline">📄 Print Label</button>
          </div>
          <div className="card">
            <div className="section-header"><h3>📦 Harvest Summary</h3></div>
            <div className="bar-chart">
              <div className="bar" style={{height:'60%'}}></div>
              <div className="bar" style={{height:'80%'}}></div>
              <div className="bar" style={{height:'45%'}}></div>
              <div className="bar amber" style={{height:'70%'}}></div>
              <div className="bar" style={{height:'90%'}}></div>
              <div className="bar" style={{height:'55%'}}></div>
            </div>
            <div className="chart-labels"><span>Oct</span><span>Nov</span><span>Dec</span><span>Jan</span><span>Feb</span><span>Mar</span></div>
          </div>
        </div>
        <div className="card">
          <div className="section-header"><h3>🏷️ Batch Labels & QR</h3></div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'16px',padding:'20px 0'}}>
            <div className="qr-mock"></div>
            <div style={{textAlign:'center'}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:'1rem'}}>BATCH #2025-A1-0312</div>
              <div style={{fontSize:'0.8rem',color:'var(--text-muted)',marginTop:'4px'}}>Plot A1 · Paddy MR219 · 5.8T</div>
              <div style={{fontSize:'0.8rem',color:'var(--text-muted)'}}>Harvested: 10 Mar 2025</div>
              <div style={{fontSize:'0.8rem',color:'var(--text-muted)'}}>Dest: Warehouse Central KL</div>
            </div>
            <button className="btn btn-primary">📲 Download QR</button>
            <button className="btn btn-outline">🖨️ Print Label</button>
          </div>
          <div style={{borderTop:'1px solid var(--border)',paddingTop:'16px',marginTop:'8px'}}>
            <div className="section-header"><h3>Recent Batches</h3></div>
            <table>
              <thead><tr><th>Batch ID</th><th>Crop</th><th>Qty</th><th>Status</th></tr></thead>
              <tbody>
                {records.map((rec, i) => (
                  <tr key={i}>
                    <td>{rec.batch_id.replace('BATCH-#2025-','').substring(0,8)}</td>
                    <td>{rec.plot.includes('Paddy') ? 'Paddy' : rec.plot.includes('Maize') ? 'Maize' : rec.plot}</td>
                    <td>{rec.quantity_tonnes}t</td>
                    <td>
                      <Badge 
                        text={rec.status} 
                        color={rec.status === 'Delivered' ? 'green' : rec.status === 'In Transit' ? 'amber' : 'blue'} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HarvestTracking;
