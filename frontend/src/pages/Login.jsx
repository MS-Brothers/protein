import { useState, useContext } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function Login() {
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const navigate = useNavigate();
  const { user, login } = useContext(AuthContext);

  // Redirect if already logged in as user
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (response.ok && data.success) {
        login(data.data, data.data.token);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {showSupport ? (
        <div className="auth-card">
          <h2>Support Details</h2>
          <p className="subtitle" style={{ marginBottom: '1.5rem', color: '#94a3b8', textAlign: 'center' }}>How can we help you today?</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '50%', color: '#60a5fa', display: 'flex', flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500', marginBottom: '2px' }}>CUSTOMER CARE</div>
                <a href="tel:+917709553344" style={{ fontSize: '1.1rem', color: '#f8fafc', fontWeight: '600' }}>+91 77095 53344</a>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '50%', color: '#60a5fa', display: 'flex', flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500', marginBottom: '2px' }}>EMAIL</div>
                <a href="mailto:globalhorizonexim@gmail.com" style={{ fontSize: '1rem', color: '#f8fafc', fontWeight: '600', wordBreak: 'break-all' }}>globalhorizonexim@gmail.com</a>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '50%', color: '#60a5fa', display: 'flex', flexShrink: 0 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500', marginBottom: '2px' }}>ADDRESS</div>
                <div style={{ fontSize: '0.95rem', color: '#f8fafc', lineHeight: '1.4' }}>Ground Floor, Gat No. 405, H. No. 474, Sitewadi Road, Near Shivneri Villa, Tal. Junnar, Pune, Maharashtra – 412409, India</div>
              </div>
            </div>
          </div>

          <button className="btn btn-glass" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setShowSupport(false)}>
            Back to Login
          </button>
        </div>
      ) : (
        <div className="auth-card">
          <div className="logo-container">
            <div className="logo-circle">
              <img src="/logo.png" alt="Global Horizon Exim Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h2>GLOBAL HORIZON EXIM</h2>
            <p className="company-subtitle">Importer &bull; Exporter</p>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email or User ID</label>
              <input
                type="text"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button
                type="button"
                onClick={() => setShowSupport(true)}
                style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '500', padding: '5px' }}>
                Need Support?
              </button>
            </div>
          </form>
          <div className="auth-footer">
            <div style={{ marginBottom: '10px' }}>
              <Link to="/forgot-password" style={{ color: '#94a3b8' }}>Forgot Password?</Link>
            </div>
            <div>
              Don't have an account? <Link to="/register" style={{ fontWeight: '600' }}>Register here</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
