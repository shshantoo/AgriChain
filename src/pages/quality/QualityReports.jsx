import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Badge } from '../../components/SharedUI';

const BASE = 'http://localhost:3001/api/quality';
const INSPECTORS_URL = 'http://localhost:3001/api/quality/inspectors-list';
const PB_URL = 'http://localhost:3001/api/quality/processing-batches-list';

const emptyForm = { processing_id: '', inspector_id: '', moisture_content: '', purity: '', defect_level: 'None', grading_status: 'Pass', remarks: '' };

const QualityReports = () => {
  const [reports, setReports] = useState([]);
  const [inspectors, setInspectors] = useState([]);
  const [pBatches, setPBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const [r, i, pb] = await Promise.all([axios.get(`${BASE}/reports`), axios.get(INSPECTORS_URL), axios.get(PB_URL)]);
      setReports(r.data); setInspectors(i.data); setPBatches(pb.data);
    } catch { setReports([]); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editingId) await axios.put(`${BASE}/reports/${editingId}`, form);
      else await axios.post(`${BASE}/reports`, form);
      setShowForm(false); setEditingId(null); setForm(emptyForm); load();
    } catch (err) { alert(err.response?.data?.error || 'Failed'); }
  };

  const fi = k => e => setForm({ ...form, [k]: e.target.value });
  const gradeColor = s => s === 'Pass' ? 'green' : s === 'Pass with Conditions' ? 'amber' : 'red';

  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>🔬 Quality Reports</h2>
        <p>Submit and manage quality control reports linked to processing batches</p>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20, border: '1px solid var(--primary)' }}>
          <div className="section-header">
            <h3>{editingId ? '✏️ Edit Report' : '➕ New Quality Report'}</h3>
            <button className="btn btn-outline btn-sm" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label>Processing Batch</label>
                <select className="form-control" value={form.processing_id} onChange={fi('processing_id')} required>
                  <option value="">— Select Processing Batch —</option>
                  {pBatches.map(pb => <option key={pb.processing_id} value={pb.processing_id}>#{pb.processing_id} — {pb.product_name} @ {pb.area}, {pb.district} ({new Date(pb.processing_date).toLocaleDateString()})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Inspector</label>
                <select className="form-control" value={form.inspector_id} onChange={fi('inspector_id')} required>
                  <option value="">— Select Inspector —</option>
                  {inspectors.map(i => <option key={i.user_id} value={i.user_id}>{i.name} {i.lab_id ? `(${i.lab_id})` : ''}</option>)}
                </select>
              </div>
            </div>
            <div className="three-col">
              <div className="form-group"><label>Moisture Content (%)</label><input type="number" step="0.01" min="0" max="100" className="form-control" value={form.moisture_content} onChange={fi('moisture_content')} /></div>
              <div className="form-group"><label>Purity (%)</label><input type="number" step="0.01" min="0" max="100" className="form-control" value={form.purity} onChange={fi('purity')} /></div>
              <div className="form-group"><label>Defect Level</label>
                <select className="form-control" value={form.defect_level} onChange={fi('defect_level')}>
                  <option>None</option><option>Minor</option><option>Moderate</option><option>Severe</option>
                </select>
              </div>
            </div>
            <div className="form-group" style={{ maxWidth: 250 }}>
              <label>Grading Status</label>
              <select className="form-control" value={form.grading_status} onChange={fi('grading_status')}>
                <option>Pass</option><option>Pass with Conditions</option><option>Fail</option>
              </select>
            </div>
            <div className="form-group"><label>Remarks</label><textarea className="form-control" rows="2" value={form.remarks} onChange={fi('remarks')} /></div>
            <button type="submit" className="btn btn-primary">{editingId ? '💾 Save Changes' : '✅ Submit Report'}</button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="section-header">
          <h3>📋 All Quality Reports</h3>
          {!showForm && <button className="btn btn-primary" onClick={() => { setForm(emptyForm); setEditingId(null); setShowForm(true); }}>+ New Report</button>}
        </div>
        <table>
          <thead><tr><th>#</th><th>Product</th><th>Inspector</th><th>Moisture%</th><th>Purity%</th><th>Defect Level</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan="8" style={{ textAlign: 'center' }}>Loading…</td></tr>}
            {!loading && reports.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center' }}>No reports found.</td></tr>}
            {reports.map(r => (
              <tr key={r.report_id}>
                <td><strong>#{r.report_id}</strong></td>
                <td>{r.product_name}</td>
                <td>{r.inspector_name}</td>
                <td>{r.moisture_content ?? '—'}%</td>
                <td>{r.purity ?? '—'}%</td>
                <td>{r.defect_level || '—'}</td>
                <td><Badge text={r.grading_status || '—'} color={gradeColor(r.grading_status)} /></td>
                <td>
                  <button className="btn btn-outline btn-sm" style={{ marginRight: 6 }} onClick={() => { setForm(r); setEditingId(r.report_id); setShowForm(true); }}>Edit</button>
                  <button className="btn btn-amber btn-sm" onClick={async () => { if (!window.confirm('Delete?')) return; await axios.delete(`${BASE}/reports/${r.report_id}`); load(); }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QualityReports;
