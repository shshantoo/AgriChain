import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'farmer',
    region: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/auth/register', formData);
      setSuccess('Registration successful! You can now log in.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    }
  };

  return (
    <div id="role-screen">
      <div className="logo">Agri<span>Chain</span></div>
      <div className="tagline">Smart Farm-to-Warehouse Management System</div>
      <div style={{ maxWidth: '450px', margin: '20px auto', background: 'var(--surface)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Create an Account</h2>
        {error && <div className="alert alert-danger" style={{ marginBottom: '15px' }}>{error}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom: '15px' }}>{success}</div>}
        <form onSubmit={handleRegister}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label>Full Name</label>
            <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label>Email Address</label>
            <input type="email" className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label>Initial Role</label>
            <select className="form-control" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="farmer">Farmer</option>
              <option value="warehouse">Warehouse Manager</option>
              <option value="processing">Processing Unit</option>
              <option value="supplier">Supplier</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label>Region / Zone (Optional)</label>
            <input type="text" className="form-control" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} />
          </div>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label>Password</label>
            <input type="password" className="form-control" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required minLength="6" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>Register Account</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
