import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Badge } from '../../components/SharedUI';

const SowingLog = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    plot: 'Plot A1 — Paddy Field',
    crop_type: 'Paddy (Rice)',
    seed_type: 'Hybrid MR219',
    sowing_date: '2025-01-15',
    expected_harvest_date: '2025-05-15',
    seed_qty: 120,
    variety: 'MR219 Elite',
    fertiliser: 'NPK 15-15-15, 50kg/ha',
    pesticides: 'None',
    usage_rates: '50kg/ha',
    notes: 'Good soil moisture. Applied pre-emergent herbicide.'
  });

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/farmer/sowing');
      setRecords(res.data);
    } catch (err) {
      console.error('API Error:', err);
      // Fallback data
      setRecords([
        { id: 1, plot: 'A1', crop_type: 'Paddy', sowing_date: '2025-01-15', status: 'Growing' },
        { id: 2, plot: 'B2', crop_type: 'Maize', sowing_date: '2025-01-20', status: 'Growing' },
        { id: 3, plot: 'C3', crop_type: 'Soybean', sowing_date: '2025-02-02', status: 'Germinating' },
        { id: 4, plot: 'D4', crop_type: 'Wheat', sowing_date: '2024-12-10', status: 'Harvested' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await axios.post('http://localhost:3001/api/farmer/sowing', formData);
      fetchRecords();
      alert('Sowing record saved successfully!');
    } catch (err) {
      console.error('Error saving record:', err);
      alert('Failed to save record.');
    }
  };

  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>Sowing Log</h2>
        <p>Record and track planting activities for each plot</p>
      </div>
      <div className="two-col">
        <div className="card">
          <div className="section-header"><h3>➕ New Sowing Record</h3></div>
          <div className="form-group">
            <label>Plot / Field ID</label>
            <select className="form-control" value={formData.plot} onChange={e => setFormData({...formData, plot: e.target.value})}>
              <option>Plot A1 — Paddy Field</option>
              <option>Plot B2 — Maize Field</option>
              <option>Plot C3 — Soybean Field</option>
            </select>
          </div>
          <div className="form-group">
            <label>Crop Type</label>
            <select className="form-control" value={formData.crop_type} onChange={e => setFormData({...formData, crop_type: e.target.value})}>
              <option>Paddy (Rice)</option>
              <option>Maize</option>
              <option>Soybean</option>
              <option>Wheat</option>
            </select>
          </div>
          <div className="form-group">
            <label>Seed Type</label>
            <input type="text" className="form-control" value={formData.seed_type} onChange={e => setFormData({...formData, seed_type: e.target.value})}/>
          </div>
          <div className="two-col" style={{gap: '12px'}}>
            <div className="form-group">
              <label>Sowing Date</label>
              <input type="date" className="form-control" value={formData.sowing_date} onChange={e => setFormData({...formData, sowing_date: e.target.value})}/>
            </div>
            <div className="form-group">
              <label>Expected Harvest Date</label>
              <input type="date" className="form-control" value={formData.expected_harvest_date} onChange={e => setFormData({...formData, expected_harvest_date: e.target.value})}/>
            </div>
          </div>
          <div className="two-col" style={{gap: '12px'}}>
            <div className="form-group">
              <label>Seed Qty (kg)</label>
              <input type="number" className="form-control" value={formData.seed_qty} onChange={e => setFormData({...formData, seed_qty: e.target.value})}/>
            </div>
            <div className="form-group">
              <label>Seed Variety</label>
              <input type="text" className="form-control" value={formData.variety} onChange={e => setFormData({...formData, variety: e.target.value})}/>
            </div>
          </div>
          <div className="form-group">
            <label>Fertiliser Applied</label>
            <input type="text" className="form-control" value={formData.fertiliser} onChange={e => setFormData({...formData, fertiliser: e.target.value})}/>
          </div>
          <div className="two-col" style={{gap: '12px'}}>
            <div className="form-group">
              <label>Pesticides</label>
              <input type="text" className="form-control" value={formData.pesticides} onChange={e => setFormData({...formData, pesticides: e.target.value})}/>
            </div>
            <div className="form-group">
              <label>Usage Rates</label>
              <input type="text" className="form-control" value={formData.usage_rates} onChange={e => setFormData({...formData, usage_rates: e.target.value})}/>
            </div>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea className="form-control" rows="3" placeholder="Additional notes..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
          </div>
          <button className="btn btn-primary" style={{width:'100%'}} onClick={handleSubmit}>💾 Save Sowing Record</button>
        </div>
        <div className="card">
          <div className="section-header"><h3>📋 Recent Sowing Records</h3></div>
          <table>
            <thead><tr><th>Plot</th><th>Crop</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {records.map(rec => (
                <tr key={rec.id}>
                  <td>{rec.plot.replace('Plot ', '').substring(0, 2)}</td>
                  <td>{rec.crop_type}</td>
                  <td>{new Date(rec.sowing_date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric'})}</td>
                  <td>
                    <Badge 
                      text={rec.status} 
                      color={rec.status === 'Growing' ? 'green' : rec.status === 'Germinating' ? 'amber' : 'blue'} 
                    />
                  </td>
                </tr>
              ))}
              {records.length === 0 && !loading && <tr><td colSpan="4" style={{textAlign:'center'}}>No records found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SowingLog;
