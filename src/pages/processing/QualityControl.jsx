import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { StatCard } from '../../components/SharedUI';

const QualityControl = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    batch_id: 'BP-2025-001',
    inspector: 'Azlan Bin Rahman',
    inspection_date: new Date().toISOString().split('T')[0],
    moisture_pct: 13.5,
    foreign_matter_pct: 0.3,
    grade: 'Grade A — Premium',
    notes: 'Sample passed moisture and foreign matter tests. Grade A approved.'
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/processing/qc');
      setReports(res.data);
    } catch (err) {
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      await axios.post('http://localhost:3001/api/processing/qc', formData);
      fetchReports();
      alert('QC Report submitted successfully!');
    } catch (err) {
      console.error('Error submitting QC:', err);
      alert('Failed to submit QC report.');
    }
  };

  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>Quality Control</h2>
        <p>QA checks, grade assignments and reject tracking</p>
      </div>
      <div className="card">
        <div className="section-header"><h3>🔬 QC Inspection Form</h3></div>
        <div className="three-col">
          <div className="form-group">
            <label>Batch ID</label>
            <select className="form-control" value={formData.batch_id} onChange={e => setFormData({...formData, batch_id: e.target.value})}>
              <option>BP-2025-001</option>
              <option>BP-2025-002</option>
            </select>
          </div>
          <div className="form-group">
            <label>Inspector Name</label>
            <input className="form-control" value={formData.inspector} onChange={e => setFormData({...formData, inspector: e.target.value})}/>
          </div>
          <div className="form-group">
            <label>Inspection Date</label>
            <input type="date" className="form-control" value={formData.inspection_date} onChange={e => setFormData({...formData, inspection_date: e.target.value})}/>
          </div>
        </div>
        <div className="three-col">
          <div className="form-group">
            <label>Moisture Content (%)</label>
            <input type="number" className="form-control" value={formData.moisture_pct} onChange={e => setFormData({...formData, moisture_pct: e.target.value})}/>
          </div>
          <div className="form-group">
            <label>Foreign Matter (%)</label>
            <input type="number" className="form-control" value={formData.foreign_matter_pct} onChange={e => setFormData({...formData, foreign_matter_pct: e.target.value})}/>
          </div>
          <div className="form-group">
            <label>Grade Assignment</label>
            <select className="form-control" value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})}>
              <option>Grade A — Premium</option>
              <option>Grade B — Standard</option>
              <option>Reject</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>QC Notes</label>
          <textarea className="form-control" rows="2" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}></textarea>
        </div>
        <button className="btn btn-primary" onClick={handleSubmit}>✅ Submit QC Report</button>
      </div>
      <div className="card">
        <div className="section-header"><h3>📊 QC Summary</h3></div>
        <div className="stat-grid" style={{gridTemplateColumns:'repeat(4,1fr)'}}>
          <StatCard label="Batches Inspected" value="24" badgeText="This Month" badgeColor="blue" />
          <StatCard label="Grade A Passed" value="18" badgeText="75%" badgeColor="green" />
          <StatCard label="Grade B" value="5" badgeText="21%" badgeColor="amber" />
          <StatCard label="Rejected" value="1" badgeText="4%" badgeColor="red" />
        </div>
      </div>
      
      {/* Show recent reports if any from DB */}
      {reports.length > 0 && (
        <div className="card">
          <div className="section-header"><h3>Recent QC Submissions</h3></div>
          <table>
            <thead><tr><th>Batch ID</th><th>Date</th><th>Grade</th><th>Inspector</th></tr></thead>
            <tbody>
              {reports.map((report, idx) => (
                <tr key={idx}>
                  <td>{report.batch_id}</td>
                  <td>{new Date(report.inspection_date).toLocaleDateString()}</td>
                  <td>{report.grade}</td>
                  <td>{report.inspector}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default QualityControl;
