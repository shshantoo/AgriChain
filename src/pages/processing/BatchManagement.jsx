import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Badge } from '../../components/SharedUI';

const BatchManagement = () => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    batch_id: 'BP-2025-009',
    raw_material: 'Paddy (Rice)',
    processing_type: 'Milling',
    input_qty: 10,
    line: 'Line 1',
    start_time: '2025-03-28T10:00'
  });

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/processing/batches');
      setBatches(res.data);
    } catch (err) {
      console.error('API Error:', err);
      setBatches([
        { batch_id: 'BP-001', processing_type: 'Milling', input_qty: 12, output_qty: 9.8, status: 'Active' },
        { batch_id: 'BP-002', processing_type: 'Drying', input_qty: 8, output_qty: null, status: 'Drying' },
        { batch_id: 'BP-003', processing_type: 'Pressing', input_qty: 5, output_qty: 1.8, status: 'Done' },
        { batch_id: 'BP-004', processing_type: 'Grinding', input_qty: 6, output_qty: null, status: 'On Hold' },
        { batch_id: 'BP-005', processing_type: 'Milling', input_qty: 10, output_qty: 8.2, status: 'Done' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        start_time: formData.start_time.replace('T', ' ') + ':00'
      };
      await axios.post('http://localhost:3001/api/processing/batches', payload);
      fetchBatches();
      // Auto-increment batch ID for demo
      const newIdNumber = parseInt(formData.batch_id.split('-')[2]) + 1;
      setFormData({
        ...formData,
        batch_id: `BP-2025-${newIdNumber.toString().padStart(3, '0')}`
      });
      alert('Batch started successfully!');
    } catch (err) {
      console.error('Error starting batch:', err);
      alert('Failed to start batch.');
    }
  };

  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>Batch Management</h2>
        <p>Create, manage and track processing batches end-to-end</p>
      </div>
      <div className="two-col">
        <div className="card">
          <div className="section-header"><h3>➕ Create New Batch</h3></div>
          <div className="form-group">
            <label>Batch ID (Auto)</label>
            <input className="form-control" value={formData.batch_id} readOnly style={{background:'#f9fafb'}}/>
          </div>
          <div className="form-group">
            <label>Raw Material</label>
            <select className="form-control" value={formData.raw_material} onChange={e => setFormData({...formData, raw_material: e.target.value})}>
              <option>Paddy (Rice)</option>
              <option>Maize</option>
              <option>Soybean</option>
            </select>
          </div>
          <div className="form-group">
            <label>Processing Type</label>
            <select className="form-control" value={formData.processing_type} onChange={e => setFormData({...formData, processing_type: e.target.value})}>
              <option>Milling</option>
              <option>Drying</option>
              <option>Pressing / Oil Extraction</option>
              <option>Flour Grinding</option>
            </select>
          </div>
          <div className="two-col" style={{gap:'12px'}}>
            <div className="form-group">
              <label>Input Qty (t)</label>
              <input type="number" className="form-control" value={formData.input_qty} onChange={e => setFormData({...formData, input_qty: e.target.value})}/>
            </div>
            <div className="form-group">
              <label>Processing Line</label>
              <select className="form-control" value={formData.line} onChange={e => setFormData({...formData, line: e.target.value})}>
                <option>Line 1</option>
                <option>Line 2</option>
                <option>Line 3</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Start Date/Time</label>
            <input type="datetime-local" className="form-control" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})}/>
          </div>
          <button className="btn btn-primary" style={{width:'100%'}} onClick={handleSubmit}>🚀 Start Batch</button>
        </div>
        <div className="card">
          <div className="section-header"><h3>📋 All Batches</h3></div>
          <table>
            <thead><tr><th>Batch</th><th>Type</th><th>Input</th><th>Output</th><th>Status</th></tr></thead>
            <tbody>
              {batches.map((batch, idx) => (
                <tr key={idx}>
                  <td>{batch.batch_id.replace('BP-2025-', 'BP-')}</td>
                  <td>{batch.processing_type}</td>
                  <td>{batch.input_qty}t</td>
                  <td>{batch.output_qty ? `${batch.output_qty}t${batch.processing_type==='Pressing'?' oil':''}` : '—'}</td>
                  <td>
                    <Badge 
                      text={batch.status} 
                      color={batch.status === 'Done' ? 'green' : batch.status === 'On Hold' ? 'red' : batch.status === 'Active' ? 'blue' : 'amber'} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BatchManagement;
