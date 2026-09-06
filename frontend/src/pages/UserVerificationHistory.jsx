import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import UserNavbar from '../components/UserNavbar';
import { getApiUrl } from '../config/api';

function UserVerificationHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/api/verification/history'), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setHistory(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch verification history');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filteredHistory = history.filter((item) => {
    const matchesSearch = item.authentication_code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || item.verification_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getBadgeClass = (status) => {
    if (status === 'GENUINE') return 'badge badge-success';
    if (status === 'ALREADY_VERIFIED') return 'badge badge-warning';
    return 'badge badge-danger';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <UserNavbar />

      <main style={{ flex: 1, maxWidth: '1050px', width: '100%', margin: '0 auto', padding: '1.75rem 1rem' }}>
        
        {/* Header Area */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              Verification History
            </h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Review all your previous product authenticity checks
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={fetchHistory}
              className="btn btn-outline"
              style={{ minHeight: '38px', padding: '6px 14px', fontSize: '13px' }}
            >
              <svg style={{ width: '15px', height: '15px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button 
              onClick={() => navigate('/verify')}
              className="btn btn-primary"
              style={{ minHeight: '38px', padding: '6px 14px', fontSize: '13px' }}
            >
              + Verify Product
            </button>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Filter & Search Toolbar */}
        <div 
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: '380px' }}>
            <svg style={{ width: '18px', height: '18px', position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="modern-input"
              style={{ paddingLeft: '38px', minHeight: '40px', fontSize: '14px' }}
            />
          </div>

          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '2px' }}>
            {[
              { label: 'All', value: 'ALL' },
              { label: 'Genuine', value: 'GENUINE' },
              { label: 'Already Verified', value: 'ALREADY_VERIFIED' }
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilterStatus(tab.value)}
                style={{
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: filterStatus === tab.value ? '700' : '500',
                  cursor: 'pointer',
                  background: filterStatus === tab.value ? 'var(--primary)' : 'var(--table-row-hover)',
                  color: filterStatus === tab.value ? '#ffffff' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content View: Responsive Table & Mobile Cards */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem auto' }} />
            <p style={{ margin: 0, fontSize: '0.95rem' }}>Loading verification records...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div 
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              padding: '3.5rem 1.5rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
              <svg style={{ width: '32px', height: '32px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: '700' }}>
              No verification records found
            </h3>
            <p style={{ margin: '0 0 1.5rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              {searchTerm || filterStatus !== 'ALL' ? 'Try adjusting your search or filters' : 'You haven\'t verified any product authentication codes yet'}
            </p>
            <button 
              onClick={() => navigate('/verify')}
              className="btn btn-primary"
              style={{ borderRadius: '10px' }}
            >
              Verify a Product Now
            </button>
          </div>
        ) : (
          <div className="responsive-table-wrapper" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Authentication Code</th>
                  <th>Status</th>
                  <th>Verification Timestamp</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <span style={{ fontWeight: '800', letterSpacing: '1px', color: 'var(--text-primary)' }}>
                        {item.authentication_code}
                      </span>
                    </td>
                    <td>
                      <span className={getBadgeClass(item.verification_status)}>
                        {item.verification_status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      {new Date(item.verified_at).toLocaleString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(item.authentication_code);
                          alert('Code copied to clipboard: ' + item.authentication_code);
                        }}
                        className="btn btn-outline"
                        style={{ minHeight: '30px', padding: '4px 10px', fontSize: '12px', borderRadius: '6px' }}
                        title="Copy Code"
                      >
                        Copy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default UserVerificationHistory;
