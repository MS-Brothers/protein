import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { getApiUrl } from '../../config/api';

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
      const response = await fetch(getApiUrl('/api/admin/auth-codes/excel-uploads'), {
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
      const response = await fetch(getApiUrl(`/api/admin/auth-codes/excel-uploads/${id}`), {
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
      const response = await fetch(getApiUrl(`/api/admin/auth-codes/excel-uploads/${deleteConfirmId}`), {
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
                <th>Failed</th>
                <th>Status</th>
                <th>Upload Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {uploads.map((upload) => {
                const total = upload.total_rows ?? upload.total_entries ?? 0;
                const imported = upload.successful_imports ?? upload.imported_count ?? 0;
                const fileDups = upload.excel_duplicates ?? 0;
                const dbDups = upload.existing_codes ?? 0;
                const totalDups = upload.duplicate_codes ?? (fileDups + dbDups);
                const failed = upload.failed_imports ?? Math.max(0, total - imported - totalDups);

                return (
                  <tr key={upload.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg style={{ width: '18px', height: '18px', color: 'var(--primary)', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <span style={{ fontWeight: '700', color: 'var(--text-primary)', display: 'block' }}>
                            {upload.file_name}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID #{upload.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: '800', fontSize: '14px', color: 'var(--text-primary)' }}>{total}</span>
                    </td>
                    <td>
                      <span className="badge badge-success" style={{ fontWeight: '700' }}>
                        {imported}
                      </span>
                    </td>
                    <td>
                      <span className={totalDups > 0 ? "badge badge-warning" : "badge badge-neutral"} style={{ fontWeight: '700' }}>
                        {totalDups}
                      </span>
                      {totalDups > 0 && (
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          File: {fileDups} | DB: {dbDups}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={failed > 0 ? "badge badge-danger" : "badge badge-neutral"} style={{ fontWeight: '700' }}>
                        {failed}
                      </span>
                    </td>
                    <td>
                      <span className={upload.status === 'COMPLETED' ? "badge badge-success" : "badge badge-warning"}>
                        {upload.status || 'COMPLETED'}
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
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Details Modal */}
      {selectedUpload && (() => {
        const total = selectedUpload.total_rows ?? selectedUpload.total_entries ?? 0;
        const imported = selectedUpload.successful_imports ?? selectedUpload.imported_count ?? 0;
        const fileDups = selectedUpload.excel_duplicates ?? 0;
        const dbDups = selectedUpload.existing_codes ?? 0;
        const totalDups = selectedUpload.duplicate_codes ?? (fileDups + dbDups);
        const failed = selectedUpload.failed_imports ?? Math.max(0, total - imported - totalDups);
        
        const importedPct = total > 0 ? Math.round((imported / total) * 100) : 0;
        const dupsPct = total > 0 ? Math.round((totalDups / total) * 100) : 0;
        const failedPct = total > 0 ? Math.round((failed / total) * 100) : 0;

        return (
          <div className="modal-backdrop">
            <div className="modal-box" style={{ maxWidth: '620px' }}>
              <div className="modal-header">
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    Excel Batch Import Details
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Upload Batch #{selectedUpload.id} &bull; {selectedUpload.status || 'COMPLETED'}
                  </span>
                </div>
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
                {/* File Header Info */}
                <div style={{ background: 'var(--table-row-hover)', borderRadius: '12px', padding: '12px 16px', marginBottom: '1.25rem', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>File Name</span>
                    <span style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{selectedUpload.file_name}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700', display: 'block' }}>Upload Date</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{new Date(selectedUpload.created_at).toLocaleString()}</span>
                  </div>
                </div>

                {/* 4 Main KPI Cards: Total Rows, Imported, Duplicates, Failed */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  {/* Total Rows */}
                  <div style={{ background: 'var(--table-row-hover)', padding: '14px 10px', borderRadius: '12px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Total Rows</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', display: 'block' }}>{total}</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>100%</span>
                  </div>

                  {/* Imported */}
                  <div style={{ background: 'var(--success-light)', padding: '14px 10px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--success)', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Imported</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--success)', display: 'block' }}>{imported}</span>
                    <span style={{ fontSize: '10px', color: 'var(--success)', fontWeight: '700' }}>{importedPct}%</span>
                  </div>

                  {/* Duplicates */}
                  <div style={{ background: 'var(--warning-light)', padding: '14px 10px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--warning)', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Duplicates</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--warning)', display: 'block' }}>{totalDups}</span>
                    <span style={{ fontSize: '10px', color: 'var(--warning)', fontWeight: '700' }}>{dupsPct}%</span>
                  </div>

                  {/* Failed */}
                  <div style={{ background: 'var(--danger-light)', padding: '14px 10px', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--danger)', fontWeight: '700', display: 'block', marginBottom: '4px' }}>Failed</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--danger)', display: 'block' }}>{failed}</span>
                    <span style={{ fontSize: '10px', color: 'var(--danger)', fontWeight: '700' }}>{failedPct}%</span>
                  </div>
                </div>

                {/* Visual Ratio Progress Bar */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    <span>Row Distribution Ratio</span>
                    <span>{imported} Imported &bull; {totalDups} Duplicates &bull; {failed} Failed</span>
                  </div>
                  <div style={{ height: '8px', width: '100%', borderRadius: '9999px', background: 'var(--table-row-hover)', display: 'flex', overflow: 'hidden' }}>
                    <div style={{ width: `${importedPct}%`, background: 'var(--success)', transition: 'width 0.3s' }} title={`Imported: ${imported} (${importedPct}%)`}></div>
                    <div style={{ width: `${dupsPct}%`, background: 'var(--warning)', transition: 'width 0.3s' }} title={`Duplicates: ${totalDups} (${dupsPct}%)`}></div>
                    <div style={{ width: `${failedPct}%`, background: 'var(--danger)', transition: 'width 0.3s' }} title={`Failed: ${failed} (${failedPct}%)`}></div>
                  </div>
                </div>

                {/* Breakdown Itemized List */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ background: 'var(--table-row-hover)', padding: '10px 14px', borderBottom: '1px solid var(--border-color)', fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                    Itemized Breakdown
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '10px 14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="dot dot-success" style={{ width: '8px', height: '8px' }}></span>
                          <strong>New Codes Successfully Inserted</strong>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '700', color: 'var(--success)' }}>
                          {imported}
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '10px 14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="dot dot-warning" style={{ width: '8px', height: '8px' }}></span>
                          <span>Duplicates inside Excel file itself</span>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '700', color: 'var(--warning)' }}>
                          {fileDups}
                        </td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '10px 14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="dot dot-warning" style={{ width: '8px', height: '8px' }}></span>
                          <span>Already existing in Database prior to upload</span>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '700', color: 'var(--warning)' }}>
                          {dbDups}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ padding: '10px 14px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="dot dot-error" style={{ width: '8px', height: '8px' }}></span>
                          <span>Invalid format / Empty / Failed rows</span>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: '700', color: 'var(--danger)' }}>
                          {failed}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  onClick={() => setSelectedUpload(null)}
                  className="btn btn-primary"
                  style={{ borderRadius: '8px', minWidth: '100px' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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
