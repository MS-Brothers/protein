const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const verificationRoutes = require('./routes/verificationRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const adminDashboardRoutes = require('./routes/adminDashboardRoutes');
const adminAuthCodesRoutes = require('./routes/adminAuthCodesRoutes');
const adminVerificationHistoryRoutes = require('./routes/adminVerificationHistoryRoutes');
const adminUsersRoutes = require('./routes/adminUsersRoutes');
const labelRoutes = require('./routes/labelRoutes');
const path = require('path');

const app = express();

// Trust proxy for reverse proxies (Nginx, Cloudflare, Hostinger)
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/auth-codes', adminAuthCodesRoutes);
app.use('/api/admin/verification-history', adminVerificationHistoryRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/admin/labels', labelRoutes);

// Serve static frontend assets if frontend/dist exists
const frontendDistPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDistPath));

// 404 Handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`
  });
});

// Root / SPA wildcard route fallback (serves index.html for React Router or API Status)
app.get('*', (req, res) => {
  const fs = require('fs');
  const indexPath = path.join(frontendDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  
  if (req.path === '/' || req.path === '/api') {
    return res.json({
      success: true,
      message: 'Global Horizon Exim - Protein Authentication API Server is running',
      version: '1.0.0'
    });
  }

  res.status(404).json({
    success: false,
    message: `Resource ${req.originalUrl} not found. Ensure frontend is built or check the API route.`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error Handler]:', err.stack || err.message || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;

