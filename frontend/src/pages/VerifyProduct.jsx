import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UserNavbar from '../components/UserNavbar';

function VerifyProduct() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setResult(null);

    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      setResult({ type: 'error', message: 'Please enter an authentication code.' });
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/verification/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ authenticationCode: cleanCode })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult({
          type: data.data.verificationStatus === 'Already Verified' ? 'warning' : 'success',
          data: data.data
        });
      } else if (response.status === 404) {
        setResult({
          type: 'error',
          message: 'The authentication code is invalid or does not exist. Please contact your authorized seller.'
        });
      } else {
        setResult({
          type: 'error',
          message: data.message || 'An error occurred during verification.'
        });
      }
    } catch (err) {
      setResult({ type: 'error', message: 'Network error. Please verify your internet connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <UserNavbar />

      <main style={{ flex: 1, maxWidth: '640px', width: '100%', margin: '0 auto', padding: '2rem 1rem' }}>
        
        {/* Back Link */}
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            marginBottom: '1.25rem',
            padding: '4px 0'
          }}
        >
          <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </button>

        {/* Verification Card */}
        <div 
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            padding: '2rem 1.5rem',
            boxShadow: 'var(--shadow-lg)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: '0 8px 20px var(--primary-glow)' }}>
              <svg style={{ width: '32px', height: '32px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)', fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.3px' }}>
              Verify Product
            </h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: '1.6' }}>
              Enter the unique authentication code printed on your product scratch label to verify genuineness.
            </p>
          </div>

          <form onSubmit={handleVerify}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="code" style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Authentication Code
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  id="code"
                  placeholder="e.g. GHX-040260"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck="false"
                  style={{
                    width: '100%',
                    minHeight: '54px',
                    padding: '0.75rem 1rem',
                    fontSize: '1.25rem',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    letterSpacing: '3px',
                    fontWeight: '800',
                    border: '2px solid var(--border-color)',
                    borderRadius: '14px',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
                {code && (
                  <button
                    type="button"
                    onClick={() => setCode('')}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                    title="Clear Code"
                  >
                    <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="btn btn-primary btn-full"
              style={{ minHeight: '50px', fontSize: '1rem', fontWeight: '700', letterSpacing: '0.5px' }}
            >
              {loading ? (
                <span>VERIFYING AUTHENTICITY...</span>
              ) : (
                <>
                  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  VERIFY PRODUCT NOW
                </>
              )}
            </button>
          </form>

          {/* Verification Result Card */}
          {result && (
            <div 
              style={{
                marginTop: '2rem',
                padding: '1.5rem',
                borderRadius: '16px',
                background: result.type === 'success' 
                  ? 'var(--success-light)' 
                  : result.type === 'warning' 
                  ? 'var(--warning-light)' 
                  : 'var(--danger-light)',
                border: `1px solid ${
                  result.type === 'success' 
                    ? 'rgba(16, 185, 129, 0.3)' 
                    : result.type === 'warning' 
                    ? 'rgba(245, 158, 11, 0.3)' 
                    : 'rgba(239, 68, 68, 0.3)'
                }`
              }}
            >
              {result.type === 'success' ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--success)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)' }}>
                    <svg style={{ width: '32px', height: '32px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem', marginBottom: '8px' }}>
                    100% Genuine Certified
                  </span>
                  <h3 style={{ margin: '8px 0 1rem 0', color: 'var(--success-text)', fontSize: '1.4rem', fontWeight: '800' }}>
                    Product Authenticated!
                  </h3>

                  <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Authentication Code</span>
                      <span style={{ fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '1px' }}>{result.data.authenticationCode}</span>
                    </div>
                    {result.data.productName && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Product</span>
                        <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{result.data.productName}</span>
                      </div>
                    )}
                    {result.data.batchNumber && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Batch Number</span>
                        <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{result.data.batchNumber}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Verification Time</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {new Date(result.data.verifiedAt || Date.now()).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ) : result.type === 'warning' ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--warning)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', boxShadow: '0 6px 16px rgba(245, 158, 11, 0.4)' }}>
                    <svg style={{ width: '32px', height: '32px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <span className="badge badge-warning" style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem', marginBottom: '8px' }}>
                    Already Verified Code
                  </span>
                  <h3 style={{ margin: '8px 0 0.5rem 0', color: 'var(--warning-text)', fontSize: '1.3rem', fontWeight: '800' }}>
                    Caution: Previously Used
                  </h3>
                  <p style={{ margin: '0 0 1rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    This unique code has already been verified earlier. If this is a newly opened seal, please contact support.
                  </p>

                  <div style={{ background: 'var(--bg-card)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-color)', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Auth Code</span>
                      <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{code}</span>
                    </div>
                    {result.data?.firstVerifiedAt && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>First Verified</span>
                        <span style={{ fontWeight: '600', color: 'var(--warning-text)', fontSize: '0.85rem' }}>
                          {new Date(result.data.firstVerifiedAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--danger)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', boxShadow: '0 6px 16px rgba(239, 68, 68, 0.4)' }}>
                    <svg style={{ width: '32px', height: '32px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <span className="badge badge-danger" style={{ fontSize: '0.85rem', padding: '0.4rem 0.9rem', marginBottom: '8px' }}>
                    Authentication Failed
                  </span>
                  <h3 style={{ margin: '8px 0 0.5rem 0', color: 'var(--danger-text)', fontSize: '1.3rem', fontWeight: '800' }}>
                    Invalid Authentication Code
                  </h3>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.5' }}>
                    {result.message}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default VerifyProduct;
