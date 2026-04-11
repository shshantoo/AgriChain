import { useContext, useState, useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { RoleContext } from '../context/RoleContext';
import axios from 'axios';

const Layout = ({ children }) => {
  const { currentRole, user, logout, updateUser } = useContext(RoleContext);
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  // Pre-fill form when modal opens
  useEffect(() => {
    if (showEditModal && user) {
      setForm({ first_name: user.first_name, last_name: user.last_name, email: user.email });
      setSaveMsg('');
    }
  }, [showEditModal, user]);

  // Close menu on outside click
  useEffect(() => {
    const handleClick = e => { if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSaveProfile = async e => {
    e.preventDefault();
    setSaving(true); setSaveMsg('');
    try {
      await axios.put('http://localhost:3001/api/auth/profile', form);
      updateUser({ first_name: form.first_name, last_name: form.last_name, email: form.email });
      setSaveMsg('✅ Profile updated successfully!');
      setTimeout(() => setShowEditModal(false), 1200);
    } catch (err) {
      setSaveMsg('❌ ' + (err.response?.data?.message || 'Failed to update'));
    } finally { setSaving(false); }
  };

  const fi = k => e => setForm({ ...form, [k]: e.target.value });

  const currentNavItem = currentRole.nav.find(item => item.path === location.pathname);
  const pageTitle = currentNavItem ? currentNavItem.label : 'Dashboard';

  return (
    <div id="app" className="active">
      {/* SIDEBAR */}
      <aside className="sidebar" id="sidebar">
        <div className="sidebar-logo">Agri<span>Chain</span></div>
        <div className="sidebar-role-badge">
          <strong id="sidebar-role-name">{currentRole.name}</strong>
          Logged in as <span id="sidebar-role-user">{currentRole.user}</span>
        </div>

        <div id="sidebar-nav">
          {currentRole.nav.map((item, index) => {
            if (item.section) return <div key={index} className="nav-section">{item.section}</div>;
            return (
              <NavLink key={index} to={item.path} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                <span className="nav-icon">{item.icon}</span>{item.label}
              </NavLink>
            );
          })}
        </div>

        <div className="sidebar-bottom">
          <button className="switch-role-btn" onClick={() => { logout(); navigate('/login'); }}>
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="main-content">
        <div className="topbar">
          <div className="topbar-title">{pageTitle}</div>
          <div className="topbar-right">
            <div className="topbar-pill">● {currentRole.pill}</div>
            <div className="notif-btn">🔔<div className="notif-dot"></div></div>

            {/* Profile Avatar with Dropdown */}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                id="profile-avatar-btn"
                onClick={() => setShowMenu(p => !p)}
                style={{
                  width: 40, height: 40, borderRadius: '50%', border: '2px solid var(--primary)',
                  background: 'var(--surface)', cursor: 'pointer', fontSize: '1.2rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'transform 0.15s', transform: showMenu ? 'scale(1.1)' : 'scale(1)'
                }}
                title={`${user?.first_name} ${user?.last_name}`}
              >
                {currentRole.avatar}
              </button>

              {showMenu && (
                <div style={{
                  position: 'absolute', top: '48px', right: 0, minWidth: 220, zIndex: 1000,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.4)', overflow: 'hidden'
                }}>
                  {/* User info header */}
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
                    <div style={{ fontWeight: 700, marginBottom: 2 }}>{user?.first_name} {user?.last_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: 4 }}>{currentRole.name}</div>
                  </div>
                  {/* Actions */}
                  <button
                    onClick={() => { setShowMenu(false); setShowEditModal(true); }}
                    style={{
                      width: '100%', padding: '12px 16px', textAlign: 'left', background: 'none',
                      border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: '0.9rem',
                      display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.1s'
                    }}
                    onMouseEnter={e => e.target.style.background = 'var(--bg)'}
                    onMouseLeave={e => e.target.style.background = 'none'}
                  >
                    ✏️ <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={() => { logout(); navigate('/login'); }}
                    style={{
                      width: '100%', padding: '12px 16px', textAlign: 'left', background: 'none',
                      border: 'none', borderTop: '1px solid var(--border)', cursor: 'pointer',
                      color: '#f87171', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: 10
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(248,113,113,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    🚪 <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {showEditModal && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }} onClick={() => setShowEditModal(false)}>
            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16,
              padding: 28, minWidth: 380, maxWidth: 480, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
            }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0 }}>✏️ Edit Profile</h3>
                <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.2rem' }}>✕</button>
              </div>
              <form onSubmit={handleSaveProfile}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label>First Name</label>
                    <input className="form-control" value={form.first_name} onChange={fi('first_name')} required />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input className="form-control" value={form.last_name} onChange={fi('last_name')} required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" className="form-control" value={form.email} onChange={fi('email')} required />
                </div>
                {saveMsg && (
                  <div style={{ padding: '8px 12px', borderRadius: 8, marginBottom: 12, fontSize: '0.88rem',
                    background: saveMsg.startsWith('✅') ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                    color: saveMsg.startsWith('✅') ? '#4ade80' : '#f87171', border: '1px solid currentColor'
                  }}>{saveMsg}</div>
                )}
                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving}>
                    {saving ? '⏳ Saving…' : '💾 Save Changes'}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Page Content */}
        {children}
      </div>
    </div>
  );
};

export default Layout;
