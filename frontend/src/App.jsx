import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyProduct from './pages/VerifyProduct';
import UserVerificationHistory from './pages/UserVerificationHistory';
import UserSupport from './pages/UserSupport';

import ProtectedRoute from './components/ProtectedRoute';

// Admin imports
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAuthCodes from './pages/admin/AdminAuthCodes';
import AdminExcelUploads from './pages/admin/AdminExcelUploads';
import LabelEditor from './pages/admin/LabelEditor';
import AdminVerificationHistory from './pages/admin/AdminVerificationHistory';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProfile from './pages/admin/AdminProfile';
import AdminLabelsUsed from './pages/admin/AdminLabelsUsed';
import AdminProtectedRoute from './components/AdminProtectedRoute';

import './App.css';

function App() {
  return (
    <ThemeProvider>
      <AdminAuthProvider>
        <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/verify" element={
              <ProtectedRoute>
                <VerifyProduct />
              </ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute>
                <UserVerificationHistory />
              </ProtectedRoute>
            } />
            <Route path="/support" element={
              <ProtectedRoute>
                <UserSupport />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/auth-codes" element={
              <AdminProtectedRoute>
                <AdminAuthCodes />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/excel-uploads" element={
              <AdminProtectedRoute>
                <AdminExcelUploads />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/label-editor" element={
              <AdminProtectedRoute>
                <LabelEditor />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/verification-history" element={
              <AdminProtectedRoute>
                <AdminVerificationHistory />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <AdminProtectedRoute>
                <AdminUsers />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/profile" element={
              <AdminProtectedRoute>
                <AdminProfile />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/labels-used" element={
              <AdminProtectedRoute>
                <AdminLabelsUsed />
              </AdminProtectedRoute>
            } />
          </Routes>
        </Router>
        </AuthProvider>
      </AdminAuthProvider>
    </ThemeProvider>
  );
}

export default App;
