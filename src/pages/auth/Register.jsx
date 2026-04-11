import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ROLES = [
  { value: 'F', label: '👨‍🌾 Farmer', extra: [
    { name: 'farm_village', label: 'Farm Village', type: 'text' },
    { name: 'farm_district', label: 'Farm District', type: 'text' },
    { name: 'farm_size', label: 'Farm Size (ha)', type: 'number' },
    { name: 'crop_type', label: 'Main Crop Type', type: 'text' },
  ]},
  { value: 'S', label: '🚚 Supplier', extra: [
    { name: 'company_name', label: 'Company Name', type: 'text' },
    { name: 'supply_crops_type', label: 'Supply Crops Type', type: 'text' },
  ]},
  { value: 'WM', label: '🏭 Warehouse Manager', extra: [
    { name: 'warehouse_district', label: 'Warehouse District', type: 'text' },
    { name: 'warehouse_area', label: 'Warehouse Area', type: 'text' },
  ]},
  { value: 'PM', label: '⚙️ Processing Manager', extra: [
    { name: 'experience_years', label: 'Experience (years)', type: 'number' },
    { name: 'specialization', label: 'Specialization', type: 'text' },
  ]},
  { value: 'QI', label: '🔬 Quality Inspector', extra: [
    { name: 'lab_id', label: 'Lab ID', type: 'text' },
    { name: 'specialty_research_field', label: 'Specialty / Research Field', type: 'text' },
  ]},
  { value: 'A', label: '🛡️ Admin', extra: [] },
  { value: 'MO', label: '🏪 Market Operator', extra: [
    { name: 'market_city', label: 'Market City', type: 'text' },
    { name: 'market_zone', label: 'Market Zone', type: 'text' },
  ]},
  { value: 'LM', label: '🚛 Logistics Manager', extra: [
    { name: 'transport_unit', label: 'Transport Unit / Fleet', type: 'text' },
  ]},
];

const Register = () => {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', role_type: '' });
  const [extras, setExtras] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const selectedRole = ROLES.find(r => r.value === form.role_type);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleExtra = e => setExtras({ ...extras, [e.target.name]: e.target.value });

  const handleRoleChange = e => {
    setForm({ ...form, role_type: e.target.value });
    setExtras({});
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      await axios.post('http://localhost:3001/api/auth/register', { ...form, ...extras });
      setSuccess('Account created successfully! You can now login.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div id="role-screen">
      <div className="logo">Agri<span>Chain</span></div>
      <div className="tagline">Smart Farm-to-Warehouse Management System</div>
      <div style={{ maxWidth: '520px', margin: '30px auto', background: 'var(--surface)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Create Account</h2>
        {error && <div className="alert alert-danger" style={{ marginBottom: 15 }}>{error}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom: 15 }}>{success}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label>First Name</label>
              <input name="first_name" className="form-control" value={form.first_name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input name="last_name" className="form-control" value={form.last_name} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" className="form-control" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input name="password" type="password" className="form-control" value={form.password} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select name="role_type" className="form-control" value={form.role_type} onChange={handleRoleChange} required>
              <option value="">— Select your role —</option>
              {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          {selectedRole && selectedRole.extra.length > 0 && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginTop: 8 }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {selectedRole.label} Details
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                {selectedRole.extra.map(field => (
                  <div key={field.name} className="form-group">
                    <label>{field.label}</label>
                    <input name={field.name} type={field.type} className="form-control" value={extras[field.name] || ''} onChange={handleExtra} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 16 }}>Create Account</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
