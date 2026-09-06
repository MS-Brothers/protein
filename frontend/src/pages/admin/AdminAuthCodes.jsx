import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getApiUrl } from '../../config/api';

const AdminAuthCodes = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState(null);
  
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setSummary(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an Excel file (.xlsx or .xls) to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('excelFile', file);

    setLoading(true);
    setError('');
    setSummary(null);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(getApiUrl('/api/admin/auth-codes/upload'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSummary(data.summary);
        setFile(null);
        const inputElem = document.getElementById('excelUpload');
        if (inputElem) inputElem.value = '';
      } else {
        throw new Error(data.message || 'An error occurred during file upload.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during file upload.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(getApiUrl('/api/admin/auth-codes/clear-all'), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setShowClearConfirm(false);
        setSummary(null);
        alert('All authentication codes have been cleared successfully.');
      } else {
        alert(data.message || 'Failed to clear authentication codes');
      }
    } catch (err) {
      alert('An error occurred while clearing authentication codes.');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <AdminLayout title="Authentication Codes" subtitle="Bulk upload, allocate, and manage product security codes">
      
      {/* Top Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button 
          onClick={() => setShowClearConfirm(true)}
          className="btn btn-danger"
          style={{ minHeight: '40px', fontSize: '13px', padding: '8px 16px' }}
        >
          <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear All Codes
        </button>
      </div>

      {/* Upload Card */}
      <div 
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          padding: '2rem 1.5rem',
          boxShadow: 'var(--shadow-md)',
          maxWidth: '750px',
          margin: '0 auto 2rem auto'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1.25rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
              Upload Code Batch
            </h2>
            <p style={{ margin: '2px 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Import Excel (.xlsx, .xls) containing column <strong style={{ color: 'var(--text-primary)' }}>authentication_code</strong>
            </p>
          </div>
        </div>

        <form onSubmit={handleUpload}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="excelUpload"
              style={{
                border: '2px dashed var(--border-color)',
                borderRadius: '16px',
                padding: '2rem 1rem',
                background: 'var(--table-row-hover)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease'
              }}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--border-color)'; }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = 'var(--border-color)';
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  setFile(e.dataTransfer.files[0]);
                  setError('');
                }
              }}
            >
              <svg style={{ width: '40px', height: '40px', color: 'var(--primary)', marginBottom: '0.75rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                {file ? file.name : 'Tap or Drag Excel file here'}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Supports .xlsx, .xls formats'}
              </span>
              <input
                type="file"
                id="excelUpload"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                disabled={loading}
                style={{ display: 'none' }}
              />
            </label>
          </div>
          
          {error && <div className="alert alert-error">{error}</div>}

          <button
            type="submit"
            disabled={loading || !file}
            className="btn btn-primary btn-full"
            style={{ minHeight: '48px', fontSize: '15px', fontWeight: '700' }}
          >
            {loading ? (
              <span>Uploading and Processing Codes...</span>
            ) : (
              <>
                <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import Excel Codes
              </>
            )}
          </button>
        </form>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div 
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderTop: '4px solid var(--success)',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-md)',
            maxWidth: '750px',
            margin: '0 auto'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
            <span className="badge badge-success">Success</span>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: 'var(--success-text)' }}>
              Batch Import Completed
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.75rem' }}>
            <div style={{ background: 'var(--table-row-hover)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', display: 'block' }}>Total</span>
              <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)' }}>{summary.totalRows}</span>
            </div>
            <div style={{ background: 'var(--success-light)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--success-text)', fontWeight: '700', display: 'block' }}>Imported</span>
              <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--success)' }}>{summary.imported}</span>
            </div>
            <div style={{ background: 'var(--warning-light)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--warning-text)', fontWeight: '700', display: 'block' }}>Duplicates</span>
              <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--warning)' }}>{summary.duplicates}</span>
            </div>
            <div style={{ background: 'var(--danger-light)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--danger-text)', fontWeight: '700', display: 'block' }}>Invalid</span>
              <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--danger)' }}>{summary.invalid}</span>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3 style={{ margin: 0, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem' }}>
                <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Confirm Deletion
              </h3>
              <button 
                onClick={() => setShowClearConfirm(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                Are you sure you want to delete <strong>ALL</strong> authentication codes in the database? This action cannot be undone.
              </p>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setShowClearConfirm(false)}
                disabled={isClearing}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button 
                onClick={handleClearAll}
                disabled={isClearing}
                className="btn btn-danger"
              >
                {isClearing ? 'Clearing...' : 'Yes, Delete All Codes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminAuthCodes;
