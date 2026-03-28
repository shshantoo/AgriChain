import { useContext } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { RoleContext } from '../context/RoleContext';

const Layout = ({ children }) => {
  const { currentRole, logout } = useContext(RoleContext);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSwitchRole = () => {
    logout();
    navigate('/login');
  };

  // Find the label for the current page
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
            if (item.section) {
              return <div key={index} className="nav-section">{item.section}</div>;
            }
            return (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            );
          })}
        </div>

        <div className="sidebar-bottom">
          <button className="switch-role-btn" onClick={handleSwitchRole}>
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
            <div className="notif-btn">
              🔔<div className="notif-dot"></div>
            </div>
            <div className="avatar">{currentRole.avatar}</div>
          </div>
        </div>

        {/* Page Content Rendered Here */}
        {children}
      </div>
    </div>
  );
};

export default Layout;
