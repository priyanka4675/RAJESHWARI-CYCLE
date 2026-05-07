import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

var navItems = [
  { label: 'Dashboard',  path: '/',           icon: '🏠' },
  { label: 'Inventory',  path: '/inventory',  icon: '📦' },
  { label: 'Sales',      path: '/sales',      icon: '🧾' },
  { label: 'Purchases',  path: '/purchases',  icon: '🏭' },
  { label: 'Dealers',    path: '/dealers',    icon: '👥' },
  { label: 'Payments',   path: '/payments',   icon: '💳' },
  { label: 'Reports',    path: '/reports',    icon: '📊' },
];

var pageTitles = {
  '/':               'Dashboard',
  '/inventory':      'Inventory',
  '/inventory/add':  'Add Product',
  '/sales':          'Sales',
  '/sales/create':   'Create Invoice',
  '/dealers':        'Dealers',
  '/payments':       'Payments',
  '/purchases':      'Purchases',
  '/reports':        'Reports',
};

export default function Layout() {
  var auth = useAuth();
  var location = useLocation();
  var title = pageTitles[location.pathname] || 'Rajeshwari Cycles';

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">🚲</span>
          <h2>Rajeshwari Cycles</h2>
          <p>Ramachandrapuram</p>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main Menu</div>
          {navItems.map(function(item) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={function(x) { return 'nav-item' + (x.isActive ? ' active' : ''); }}
              >
                <span>{item.icon}</span>
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="signout-btn" onClick={auth.signOut}>
            🚪 Sign Out
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div className="topbar-title">{title}</div>
          <div className="topbar-right">
            <span className="topbar-badge">Admin</span>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
