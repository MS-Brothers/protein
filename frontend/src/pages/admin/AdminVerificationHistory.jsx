import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getApiUrl } from '../../config/api';

const AdminVerificationHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page,
        limit: 10,
        search,
        status
      });

      const response = await fetch(getApiUrl(`/api/admin/verification-history?${params.toString()}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setHistory(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        throw new Error(data.message || 'Failed to fetch verification history');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while fetching data.');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); 
    fetchHistory();
  };

  const getStatusBadge = (statusValue) => {
    if (statusValue === 'GENUINE') return <span className="badge badge-success">Genuine</span>;
    if (statusValue === 'ALREADY_VERIFIED') return <span className="badge badge-warning">Already Verified</span>;
    return <span className="badge badge-danger">Invalid</span>;
  };

  return (
    <AdminLayout title="Verification History" subtitle="Live logs and tracking for every consumer product authentication">
      
      {error && <div className="alert alert-error">{error}</div>}

      {/* Filter and Search Bar */}
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
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: '1 1 260px', maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Search code or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="modern-input"
            style={{ minHeight: '40px', fontSize: '14px' }}
          />
          <button type="submit" className="btn btn-primary" style={{ minHeight: '40px', padding: '0 16px', borderRadius: '8px', fontSize: '13px' }}>
            Search
          </button>
        </form>

        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '2px' }}>
          {[
            { label: 'All', value: 'ALL' },
            { label: 'Genuine', value: 'GENUINE' },
            { label: 'Already Verified', value: 'ALREADY_VERIFIED' },
            { label: 'Invalid', value: 'INVALID' }
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => {
                setStatus(item.value);
                setPage(1);
              }}
              style={{
                border: 'none',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: status === item.value ? '700' : '500',
                cursor: 'pointer',
                background: status === item.value ? 'var(--primary)' : 'var(--table-row-hover)',
                color: status === item.value ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          <p style={{ margin: 0 }}>Loading verification history...</p>
        </div>
      ) : history.length === 0 ? (
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
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
            <svg style={{ width: '30px', height: '30px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: '700' }}>
            No Verification Records Found
          </h3>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {search || status !== 'ALL' ? 'Try changing your search keywords or status filters' : 'Verification events will show here once users scan products'}
          </p>
        </div>
      ) : (
        <>
          <div className="responsive-table-wrapper" style={{ boxShadow: 'var(--shadow-sm)' }}>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Status</th>
                  <th>User / Verifier</th>
                  <th>Mobile</th>
                  <th>Verification Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <span style={{ fontWeight: '800', letterSpacing: '1px', color: 'var(--text-primary)' }}>
                        {item.authentication_code}
                      </span>
                    </td>
                    <td>
                      {getStatusBadge(item.verification_status)}
                    </td>
                    <td>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                        {item.user_name || item.user_id || 'Guest / Unregistered'}
                      </div>
                      {item.user_email && (
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.user_email}</div>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {item.user_mobile || 'N/A'}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {new Date(item.verified_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '1.5rem' }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn btn-outline"
                style={{ minHeight: '36px', padding: '6px 14px', fontSize: '13px' }}
              >
                Previous
              </button>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="btn btn-outline"
                style={{ minHeight: '36px', padding: '6px 14px', fontSize: '13px' }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
};

export default AdminVerificationHistory;
