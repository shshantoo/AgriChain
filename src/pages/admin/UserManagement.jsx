import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Badge } from '../../components/SharedUI';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Create / Edit State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'farmer', region: 'Not Specified', status: 'Active'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Password hidden/not editable here directly unless resetting
      role: user.role,
      region: user.region,
      status: user.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`http://localhost:3001/api/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error('Delete error', err);
      alert('Failed to delete user');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update user
        await axios.put(`http://localhost:3001/api/admin/users/${editingId}`, formData);
        alert('User updated successfully');
      } else {
        // Create user via admin specific route
        await axios.post('http://localhost:3001/api/admin/users', formData);
        alert('User created successfully');
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', email: '', password: '', role: 'farmer', region: 'Not Specified', status: 'Active' });
      fetchUsers();
    } catch (err) {
      console.error('Submit error:', err);
      alert(err.response?.data?.message || 'Failed to save user');
    }
  };

  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>User Management</h2>
        <p>Manage system users, roles and permissions</p>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '20px', border: '1px solid var(--primary)' }}>
          <div className="section-header">
            <h3>{editingId ? '✏️ Edit User' : '➕ Create New User'}</h3>
            <button className="btn btn-outline btn-sm" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="three-col">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Password {!editingId && <span style={{color:'red'}}>*</span>}</label>
                <input type="text" className="form-control" placeholder={editingId ? "Leave blank to keep same" : "Temporary password"} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required={!editingId} />
              </div>
            </div>
            <div className="three-col">
              <div className="form-group">
                <label>Role</label>
                <select className="form-control" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  <option value="farmer">Farmer</option>
                  <option value="warehouse">Warehouse Manager</option>
                  <option value="processing">Processing Unit</option>
                  <option value="supplier">Supplier</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Region</label>
                <input type="text" className="form-control" value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select className="form-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">{editingId ? '💾 Save Changes' : '✅ Create User'}</button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="section-header">
          <h3>👥 System Users</h3> 
          {!showForm && (
            <button className="btn btn-primary" onClick={() => {
              setEditingId(null);
              setFormData({ name: '', email: '', password: '', role: 'farmer', region: 'Not Specified', status: 'Active' });
              setShowForm(true);
            }}>+ Add User</button>
          )}
        </div>
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Region</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td><strong>{u.name}</strong></td>
                <td>{u.email}</td>
                <td><span style={{textTransform: 'capitalize'}}>{u.role}</span></td>
                <td>{u.region}</td>
                <td><Badge text={u.status} color={u.status === 'Active' ? 'green' : 'amber'} /></td>
                <td>
                  <button className="btn btn-outline btn-sm" style={{marginRight: '8px'}} onClick={() => handleEdit(u)}>Edit</button>
                  <button className="btn btn-amber btn-sm" onClick={() => handleDelete(u.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {users.length === 0 && !loading && <tr><td colSpan="6" style={{textAlign:'center'}}>No users found. Ensure backend is running.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
