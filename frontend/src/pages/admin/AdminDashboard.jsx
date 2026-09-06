import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminAuthContext } from '../../context/AdminAuthContext';
import AdminLayout from '../../components/AdminLayout';
import { getApiUrl } from '../../config/api';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCodes: 0,
    totalGenuine: 0,
    totalAlreadyVerified: 0,
    totalInvalid: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { admin, adminToken, adminLogout } = useContext(AdminAuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(getApiUrl('/api/admin/dashboard/stats'), {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });
        
        const data = await response.json();
        if (response.ok && data.success) {
          setStats(data.data);
        } else {
          setError(data.message || 'Failed to fetch dashboard stats');
          if (response.status === 401 || response.status === 403) {
            adminLogout();
            navigate('/admin/login');
          }
        }
      } catch (err) {
        setError('Network error loading dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [adminToken, adminLogout, navigate]);

  return (
    <AdminLayout title="Dashboard Overview" subtitle="System metrics and authentication statistics">
      {error && <div className="alert alert-error">{error}</div>}

      {/* KPI Stats Grid */}
      <div className="stats-grid">
        
        {/* Total Codes */}
        <div className="kpi-card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
              Total Auth Codes
            </span>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px' }}>
              {loading ? '...' : stats.totalCodes.toLocaleString()}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>
              Generated in database
            </span>
          </div>
          <div className="kpi-icon-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          </div>
        </div>

        {/* Genuine Verifications */}
        <div className="kpi-card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
              Genuine Verified
            </span>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--success)', marginTop: '4px' }}>
              {loading ? '...' : stats.totalGenuine.toLocaleString()}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: '600' }}>
              100% Genuine verified
            </span>
          </div>
          <div className="kpi-icon-box" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
            <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Already Verified */}
        <div className="kpi-card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
              Already Verified
            </span>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--warning)', marginTop: '4px' }}>
              {loading ? '...' : stats.totalAlreadyVerified.toLocaleString()}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--warning-text)', fontWeight: '600' }}>
              Repeat attempts
            </span>
          </div>
          <div className="kpi-icon-box" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
            <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Invalid Attempts */}
        <div className="kpi-card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
              Invalid Attempts
            </span>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--danger)', marginTop: '4px' }}>
              {loading ? '...' : stats.totalInvalid.toLocaleString()}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--danger)', fontWeight: '600' }}>
              Unknown codes entered
            </span>
          </div>
          <div className="kpi-icon-box" style={{ background: 'var(--danger-light)', color: 'var(--danger)' }}>
            <svg style={{ width: '24px', height: '24px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
        </div>

      </div>

      {/* Quick Navigation Cards */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: '700', margin: '2rem 0 1rem 0', color: 'var(--text-primary)' }}>
        Management Shortcuts
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
        
        <div 
          onClick={() => navigate('/admin/auth-codes')}
          className="kpi-card"
          style={{ cursor: 'pointer', padding: '1.5rem', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}
        >
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: '700' }}>
              Generate & Manage Codes
            </h4>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Create bulk codes, download QR codes, and filter batch allocations.
            </p>
          </div>
        </div>

        <div 
          onClick={() => navigate('/admin/excel-uploads')}
          className="kpi-card"
          style={{ cursor: 'pointer', padding: '1.5rem', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}
        >
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: '700' }}>
              Excel Bulk Import
            </h4>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Upload .xlsx and .csv files to import large batches of authentication codes.
            </p>
          </div>
        </div>

        <div 
          onClick={() => navigate('/admin/label-editor')}
          className="kpi-card"
          style={{ cursor: 'pointer', padding: '1.5rem', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}
        >
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'var(--warning-light)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: '700' }}>
              Label Designer
            </h4>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Overlay dynamic fields, MRP coordinates, and print production labels.
            </p>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;
