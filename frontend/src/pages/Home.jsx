import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

function Home() {
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [dbStatus, setDbStatus] = useState('Checking...');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/health`);
        const data = await response.json();
        
        if (data.success) {
          setBackendStatus('Connected');
          setDbStatus(data.database);
        } else {
          setBackendStatus('Connected (with errors)');
          setDbStatus(data.database);
        }
      } catch (error) {
        setBackendStatus('Not Connected');
        setDbStatus('Not Connected');
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="home-page-wrapper">
      <div className="home-card-main">
        {/* Brand Header */}
        <div className="logo-container" style={{ marginBottom: '1.5rem' }}>
          <div className="logo-circle">
            <img 
              src="/logo.png" 
              alt="Global Horizon Exim Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
          <h2>GLOBAL HORIZON EXIM</h2>
          <p className="company-subtitle">Protein Authentication Platform</p>
        </div>

        {/* Portal Access Grid */}
        <div className="portal-grid">
          {/* Admin Portal Card */}
          <div className="portal-card admin-portal-card">
            <div className="portal-badge admin-badge">Administration</div>
            <div className="portal-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h3>Admin Panel</h3>
            <p>Manage authentication codes, batch Excel uploads, label templates, and system analytics.</p>
            <Link to="/admin/login" className="btn btn-admin">
              Admin Login &rarr;
            </Link>
          </div>

          {/* User / Customer Portal Card */}
          <div className="portal-card user-portal-card">
            <div className="portal-badge user-badge">Customer Portal</div>
            <div className="portal-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <h3>User Portal</h3>
            <p>Verify your protein product authenticity, view verification history, or access support.</p>
            <div className="user-action-btns">
              <Link to="/login" className="btn btn-primary">
                User Login
              </Link>
              <Link to="/register" className="btn btn-secondary-home">
                Register
              </Link>
            </div>
          </div>
        </div>

        {/* System Status Indicators */}
        <div className="status-board-home">
          <div className="status-header">System Health Status</div>
          <div className="status-row">
            <div className="status-chip">
              <span className="dot dot-success"></span>
              <span className="chip-label">Frontend:</span>
              <span className="chip-value">Active</span>
            </div>
            <div className="status-chip">
              <span className={`dot ${backendStatus === 'Connected' ? 'dot-success' : 'dot-error'}`}></span>
              <span className="chip-label">Backend API:</span>
              <span className="chip-value">{backendStatus}</span>
            </div>
            <div className="status-chip">
              <span className={`dot ${dbStatus === 'Connected' ? 'dot-success' : 'dot-error'}`}></span>
              <span className="chip-label">Database:</span>
              <span className="chip-value">{dbStatus}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Home;
