import { useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

export default function UserNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Verify Product', path: '/verify' },
    { label: 'History', path: '/history' },
    { label: 'Support', path: '/support' }
  ];

  return (
    <nav className="user-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        {/* Brand Logo */}
        <div 
          onClick={() => navigate('/dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
        >
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '800', fontSize: '18px', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.4)' }}>
            P
          </div>
          <div>
            <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.3px', display: 'block', lineHeight: 1.2 }}>
              Protein Auth
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Genuine Check
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="user-nav-links">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                style={{
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {link.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <ThemeToggle />

        {/* User Badge */}
        <div 
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 10px 4px 4px',
            borderRadius: '30px',
            background: 'var(--table-row-hover)',
            border: '1px solid var(--border-color)',
            cursor: 'pointer'
          }}
          title="Go to Profile"
        >
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '13px' }}>
            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.full_name?.split(' ')[0] || 'User'}
          </span>
        </div>

        {/* Logout button */}
        <button
          onClick={logout}
          className="btn btn-danger"
          style={{ padding: '6px 12px', minHeight: '34px', fontSize: '13px', borderRadius: '8px' }}
        >
          Logout
        </button>

        {/* Mobile Hamburger Menu button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            background: 'transparent',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '6px 8px',
            cursor: 'pointer',
            color: 'var(--text-primary)'
          }}
          className="user-mobile-menu-btn"
        >
          <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-color)',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 60
        }}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  setMobileMenuOpen(false);
                }}
                style={{
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-primary)',
                  border: 'none',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  fontWeight: isActive ? '700' : '500',
                  fontSize: '15px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>{link.label}</span>
                {isActive && (
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}
