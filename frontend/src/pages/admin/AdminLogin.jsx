import { useState, useContext } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { AdminAuthContext } from '../../context/AdminAuthContext';
import { getApiUrl } from '../../config/api';
import '../../App.css';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { admin, adminLogin } = useContext(AdminAuthContext);
  const navigate = useNavigate();

  // Redirect if already logged in as admin
  if (admin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(getApiUrl('/api/admin/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        adminLogin(data.data.token, data.data);
        navigate('/admin/dashboard');
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
      <div className="auth-card">
        <div className="logo-container">
          <div className="logo-circle">
            <img src="/logo.png" alt="Global Horizon Exim Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h2>GLOBAL HORIZON EXIM</h2>
          <p className="company-subtitle" style={{ color: '#f87171' }}>ADMIN PORTAL</p>
        </div>
        
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'AUTHENTICATING...' : 'LOGIN TO ADMIN'}
          </button>
        </form>

        <p className="auth-footer" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <Link to="/">&larr; Back to User Login</Link>
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;
