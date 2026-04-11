import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Badge } from '../../components/SharedUI';

const ROLE_LABELS = { F: '👨‍🌾 Farmer', S: '🚚 Supplier', WM: '🏭 WH Manager', PM: '⚙️ Proc. Manager', QI: '🔬 Quality Inspector', A: '🛡️ Admin', MO: '🏪 Market Operator', LM: '🚛 Logistics Manager' };
const BASE = 'http://localhost:3001/api/admin';

const emptyUser = { first_name: '', last_name: '', email: '', password: '', role_type: 'F', status: 'Active' };

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyUser);
  const [search, setSearch] = useState('');

  const load = async () => { setLoading(true); try { const r = await axios.get(`${BASE}/users`); setUsers(r.data); } catch { setUsers([]); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editingId) await axios.put(`${BASE}/users/${editingId}`, form);
      else await axios.post(`${BASE}/users`, form);
      setShowForm(false); setEditingId(null); setForm(emptyUser); load();
    } catch (err) { alert(err.response?.data?.message || err.response?.data?.error || 'Failed'); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this user? This cannot be undone.')) return;
    try { await axios.delete(`${BASE}/users/${id}`); load(); }
    catch { alert('Delete failed'); }
  };

  const fi = k => e => setForm({ ...form, [k]: e.target.value });

  const filtered = users.filter(u =>
    `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const roleColor = r => ({ F: 'green', S: 'amber', WM: 'blue', PM: 'blue', QI: 'blue', A: 'red', MO: 'green', LM: 'amber' }[r] || 'blue');

  return (
    <div className="page-body active">
      <div className="page-header">
        <h2>👥 User Management</h2>
        <p>Admin view — Manage all user accounts across all 8 roles</p>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20, border: '1px solid var(--primary)' }}>
          <div className="section-header">
            <h3>{editingId ? '✏️ Edit User' : '➕ Add User'}</h3>
            <button className="btn btn-outline btn-sm" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="three-col">
              <div className="form-group"><label>First Name</label><input className="form-control" value={form.first_name} onChange={fi('first_name')} required /></div>
              <div className="form-group"><label>Last Name</label><input className="form-control" value={form.last_name} onChange={fi('last_name')} required /></div>
              <div className="form-group"><label>Email</label><input type="email" className="form-control" value={form.email} onChange={fi('email')} required /></div>
            </div>
            <div className="three-col">
              {!editingId && <div className="form-group"><label>Password</label><input type="password" className="form-control" value={form.password} onChange={fi('password')} placeholder="Default: agrichain123" /></div>}
              <div className="form-group"><label>Role</label>
                <select className="form-control" value={form.role_type} onChange={fi('role_type')}>
                  {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Status</label>
                <select className="form-control" value={form.status} onChange={fi('status')}>
                  <option>Active</option><option>Inactive</option><option>Suspended</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">{editingId ? '💾 Save' : '✅ Create User'}</button>
          </form>
        </div>
      )}

      <div className="card">
        <div className="section-header">
          <h3>📋 All Users ({users.length})</h3>
          <div style={{ display: 'flex', gap: 10 }}>
            <input className="form-control" placeholder="Search name or email…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220 }} />
            {!showForm && <button className="btn btn-primary" onClick={() => { setForm(emptyUser); setEditingId(null); setShowForm(true); }}>+ Add User</button>}
          </div>
        </div>
        <table>
          <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
          <tbody>
            {loading && <tr><td colSpan="7" style={{ textAlign: 'center' }}>Loading…</td></tr>}
            {!loading && filtered.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center' }}>No users found.</td></tr>}
            {filtered.map(u => (
              <tr key={u.user_id}>
                <td><strong>#{u.user_id}</strong></td>
                <td>{u.first_name} {u.last_name}</td>
                <td>{u.email}</td>
                <td><Badge text={ROLE_LABELS[u.role_type] || u.role_type} color={roleColor(u.role_type)} /></td>
                <td><Badge text={u.status} color={u.status === 'Active' ? 'green' : 'red'} /></td>
                <td>{u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</td>
                <td>
                  <button className="btn btn-outline btn-sm" style={{ marginRight: 6 }} onClick={() => { setForm({ first_name: u.first_name, last_name: u.last_name, email: u.email, role_type: u.role_type, status: u.status, password: '' }); setEditingId(u.user_id); setShowForm(true); }}>Edit</button>
                  <button className="btn btn-amber btn-sm" onClick={() => handleDelete(u.user_id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
