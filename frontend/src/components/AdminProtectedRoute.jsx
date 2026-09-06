import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminAuthContext } from '../context/AdminAuthContext';

function AdminProtectedRoute({ children }) {
  const { admin, adminLoading } = useContext(AdminAuthContext);

  if (adminLoading) {
    return <div>Loading admin...</div>;
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default AdminProtectedRoute;
