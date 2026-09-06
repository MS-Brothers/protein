import { createContext, useState, useEffect } from 'react';

export const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken') || null);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (!adminToken) {
        setAdminLoading(false);
        return;
      }

      try {
        const payload = JSON.parse(atob(adminToken.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
          adminLogout();
          setAdminLoading(false);
          return;
        }

        const res = await fetch(import.meta.env.VITE_API_URL + '/api/admin/auth/profile', {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });
        
        const data = await res.json();
        
        if (res.ok && data.success) {
          setAdmin({ ...data.data, isAdmin: true });
        } else {
          adminLogout();
        }
      } catch (error) {
        console.error('Admin auth error:', error);
        adminLogout();
      }
      setAdminLoading(false);
    };

    checkAuth();
  }, [adminToken]);

  const adminLogin = (token, adminData) => {
    localStorage.setItem('adminToken', token);
    setAdminToken(token);
    setAdmin(adminData);
  };

  const adminLogout = () => {
    localStorage.removeItem('adminToken');
    setAdminToken(null);
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, setAdmin, adminToken, adminLogin, adminLogout, adminLoading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
