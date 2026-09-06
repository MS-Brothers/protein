import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';

const AdminExcelUploads = () => {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedUpload, setSelectedUpload] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/admin/auth-codes/excel-uploads', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setUploads(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch upload history');
      }
    } catch (err) {
      setError('An error occurred while fetching history.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUploadDetails = async (id) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(import.meta.env.VITE_API_URL + `/api/admin/auth-codes/excel-uploads/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSelectedUpload(data.data);
      } else {
        alert(data.message || 'Failed to fetch details');
      }
    } catch (err) {
      alert('An error occurred while fetching details.');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(import.meta.env.VITE_API_URL + `/api/admin/auth-codes/excel-uploads/${deleteConfirmId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setDeleteConfirmId(null);
        setSelectedUpload(null);
        fetchUploads();
      } else {
        alert(data.message || 'Failed to delete upload');
      }
    } catch (err) {
      alert('An error occurred while deleting upload.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout title="Excel Upload History" subtitle="Track all imported batch files, row statuses, and code allocations">
      
      {/* Action Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
        <button
          onClick={fetchUploads}
          className="btn btn-outline"
          style={{ minHeight: '38px', padding: '6px 14px', fontSize: '13px' }}
        >
          <svg style={{ width: '15px', height: '15px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh History
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Uploads Data Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
          <p style={{ margin: 0 }}>Loading upload history...</p>
        </div>
      ) : uploads.length === 0 ? (
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: '700' }}>
            No Excel Uploads Found
          </h3>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Upload your first batch of authentication codes via the Authentication Codes page.
          </p>
        </div>
      ) : (
        <div className="responsive-table-wrapper" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <table className="modern-table">
            <thead>
              <tr>
                <th>File Name</th>
                <th>Total Rows</th>
                <th>Imported</th>
                <th>Duplicates</th>
                <th>Upload Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {uploads.map((upload) => (
                <tr key={upload.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <svg style={{ width: '18px', height: '18px', color: 'var(--success)', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                        {upload.file_name}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: '700' }}>{upload.total_rows}</span>
                  </td>
                  <td>
                    <span className="badge badge-success">
                      {upload.successful_imports}
                    </span>
                  </td>
                  <td>
                    <span className={upload.duplicate_codes > 0 ? "badge badge-warning" : "badge badge-neutral"}>
                      {upload.duplicate_codes}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    {new Date(upload.created_at).toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        onClick={() => fetchUploadDetails(upload.id)}
                        className="btn btn-outline"
                        style={{ minHeight: '30px', padding: '4px 10px', fontSize: '12px', borderRadius: '6px' }}
                      >
                        Details
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(upload.id)}
                        className="btn btn-danger"
                        style={{ minHeight: '30px', padding: '4px 10px', fontSize: '12px', borderRadius: '6px' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Details Modal */}
      {selectedUpload && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                Upload Batch Breakdown
              </h3>
              <button 
                onClick={() => setSelectedUpload(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>File Name</span>
                <p style={{ margin: '2px 0 0 0', fontWeight: '700', fontSize: '1rem', color: 'var(--text-primary)' }}>{selectedUpload.file_name}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ background: 'var(--table-row-hover)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', display: 'block' }}>Total Rows</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-primary)' }}>{selectedUpload.total_rows}</span>
                </div>
                <div style={{ background: 'var(--success-light)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--success-text)', fontWeight: '700', display: 'block' }}>Imported</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--success)' }}>{selectedUpload.successful_imports}</span>
                </div>
                <div style={{ background: 'var(--warning-light)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--warning-text)', fontWeight: '700', display: 'block' }}>Duplicates</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--warning)' }}>{selectedUpload.duplicate_codes}</span>
                </div>
                <div style={{ background: 'var(--danger-light)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--danger-text)', fontWeight: '700', display: 'block' }}>Failed</span>
                  <span style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--danger)' }}>{selectedUpload.failed_imports}</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Uploaded At</span>
                <p style={{ margin: '2px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {new Date(selectedUpload.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setSelectedUpload(null)}
                className="btn btn-primary"
                style={{ borderRadius: '8px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h3 style={{ margin: 0, color: 'var(--danger)', fontSize: '1.15rem', fontWeight: '700' }}>
                Confirm Batch Deletion
              </h3>
              <button 
                onClick={() => setDeleteConfirmId(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: '1.6' }}>
                Are you sure you want to delete this Excel upload log and its associated codes?
              </p>
            </div>
            <div className="modal-footer">
              <button 
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeleting}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn btn-danger"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminExcelUploads;
