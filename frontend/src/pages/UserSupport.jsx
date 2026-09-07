import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserNavbar from '../components/UserNavbar';
import { AuthContext } from '../context/AuthContext';
import { getApiUrl } from '../config/api';

function UserSupport() {
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Prefill user details if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.full_name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.mobile || ''
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSubmitted(false);

    try {
      const response = await fetch(getApiUrl('/api/contact'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message,
          userId: user?.user_id || null
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitted(true);
        setFormData(prev => ({
          ...prev,
          subject: '',
          message: ''
        }));
      } else {
        setErrorMsg(data.message || 'Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error('Support form submission error:', err);
      setErrorMsg('Network error. Unable to reach the server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <UserNavbar />

      <main style={{ flex: 1, maxWidth: '850px', width: '100%', margin: '0 auto', padding: '1.75rem 1rem' }}>
        
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

        {/* Support Header Card */}
        <div 
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            padding: '2rem 1.5rem',
            boxShadow: 'var(--shadow-md)',
            marginBottom: '1.5rem'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'var(--warning-light)', color: 'var(--warning)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: '0 8px 20px rgba(245, 158, 11, 0.25)' }}>
              <svg style={{ width: '32px', height: '32px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h1 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)', fontSize: '1.6rem', fontWeight: '800' }}>
              Customer Support & Help Desk
            </h1>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: '1.6', maxWidth: '540px', marginInline: 'auto' }}>
              Our authentication & verification support team is available to assist you with any questions or issues.
            </p>
          </div>

          {/* Contact Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            
            {/* Phone Card */}
            <a 
              href="tel:+917709553344"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '1.25rem',
                background: 'var(--table-row-hover)',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div style={{ overflow: 'hidden' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px', display: 'block' }}>
                  Call Us
                </span>
                <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  +91 77095 53344
                </span>
              </div>
            </a>

            {/* Email Card */}
            <a 
              href="mailto:akshay44x@gmail.com"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '1.25rem',
                background: 'var(--table-row-hover)',
                borderRadius: '16px',
                border: '1px solid var(--border-color)',
                textDecoration: 'none',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--success-light)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg style={{ width: '22px', height: '22px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div style={{ overflow: 'hidden' }}>
                <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px', display: 'block' }}>
                  Email Us
                </span>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'block' }}>
                  akshay44x@gmail.com
                </span>
              </div>
            </a>

          </div>

          {/* Address Box */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '1.25rem', background: 'var(--table-row-hover)', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--warning-light)', color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>
                Registered Office Address
              </span>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                Ground Floor, Gat No. 405, H. No. 474, Sitewadi Road, Near Shivneri Villa, Tal. Junnar, Pune, Maharashtra – 412409, India
              </p>
            </div>
          </div>

          {/* Quick Message Form */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.75rem' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.15rem', fontWeight: '700' }}>
              Send Us a Message
            </h3>
            <p style={{ margin: '0 0 1.25rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Have an issue with a batch or seal? Fill out the quick form below and our team will respond directly:
            </p>

            {submitted && (
              <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
                ✓ Thank you! Your message has been sent to our support desk (<strong>akshay44x@gmail.com</strong>). Our team will get back to you shortly.
              </div>
            )}

            {errorMsg && (
              <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="modern-input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    Your Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="modern-input"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                    Mobile Number (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="modern-input"
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  Subject / Batch Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. Verification issue on Batch ABC-123"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                  className="modern-input"
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  Message
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe your question or issue in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  className="modern-input"
                  style={{ minHeight: '100px', resize: 'vertical' }}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ borderRadius: '10px', minWidth: '150px' }}
                disabled={loading}
              >
                {loading ? 'Sending Message...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default UserSupport;
