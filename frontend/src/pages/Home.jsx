import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getApiUrl } from '../config/api';
import '../App.css';

function Home() {
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [dbStatus, setDbStatus] = useState('Checking...');
  const [quickCode, setQuickCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(getApiUrl('/api/health'));
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

  const handleQuickVerify = (e) => {
    e.preventDefault();
    const clean = quickCode.trim().toUpperCase();
    if (!clean) return;
    navigate(`/verify?code=${encodeURIComponent(clean)}`);
  };

  return (
    <div className="home-page-wrapper">
      <div className="home-card-main">
        {/* Brand Header */}
        <div className="logo-container" style={{ marginBottom: '1.25rem' }}>
          <div className="logo-circle">
            <img 
              src="/logo.png" 
              alt="Global Horizon Exim Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: '1.85rem', fontWeight: '800', letterSpacing: '-0.5px', color: '#ffffff' }}>
            GLOBAL HORIZON EXIM
          </h1>
          <p className="company-subtitle">Protein Authentication Platform</p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '9999px', fontSize: '0.8rem', color: '#93c5fd', marginTop: '6px' }}>
            <span className="dot dot-success" style={{ width: '6px', height: '6px' }}></span>
            <span>Official Importer & Exporter Verification Node</span>
          </div>
        </div>

        {/* Quick Instant Verification Bar */}
        <div 
          style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.35)',
            borderRadius: '20px',
            padding: '1.25rem',
            marginBottom: '1.75rem',
            boxShadow: '0 12px 30px -10px rgba(37, 99, 235, 0.35)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}>
            <svg style={{ width: '20px', height: '20px', color: '#60a5fa' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span style={{ fontSize: '0.95rem', fontWeight: '700', color: '#f8fafc', letterSpacing: '0.3px' }}>
              Quick Authenticate Protein Product
            </span>
          </div>
          <form onSubmit={handleQuickVerify} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input 
              type="text"
              placeholder="Enter Scratch Code (e.g. GHX-040260)..."
              value={quickCode}
              onChange={(e) => setQuickCode(e.target.value.toUpperCase())}
              style={{
                flex: '1 1 240px',
                minHeight: '46px',
                background: 'rgba(2, 6, 23, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '0 1rem',
                color: '#ffffff',
                fontSize: '1rem',
                fontWeight: '700',
                letterSpacing: '1px',
                textAlign: 'center',
                textTransform: 'uppercase',
                outline: 'none'
              }}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              style={{ minHeight: '46px', padding: '0 1.5rem', borderRadius: '12px', fontWeight: '700', letterSpacing: '0.5px', flex: '0 0 auto' }}
            >
              Verify Now &rarr;
            </button>
          </form>
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
          <div className="status-header">Live Server & Database Health</div>
          <div className="status-row">
            <div className="status-chip">
              <span className="dot dot-success"></span>
              <span className="chip-label">Frontend SPA:</span>
              <span className="chip-value">Active</span>
            </div>
            <div className="status-chip">
              <span className={`dot ${backendStatus === 'Connected' ? 'dot-success' : 'dot-error'}`}></span>
              <span className="chip-label">Backend Node:</span>
              <span className="chip-value">{backendStatus}</span>
            </div>
            <div className="status-chip">
              <span className={`dot ${dbStatus === 'Connected' ? 'dot-success' : 'dot-error'}`}></span>
              <span className="chip-label">MySQL DB:</span>
              <span className="chip-value">{dbStatus}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Home;
