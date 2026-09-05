// src/components/ProtectedRoute.js
import React, { useEffect, useState } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spin, Alert } from 'antd';

const ProtectedRoute = ({ 
  component: Component, 
  adminOnly = false, 
  children,
  requiredPlan = null,
  ...rest 
}) => {
  const { user, loading, isAuthenticated, canAccess } = useAuth();
  const [userRole, setUserRole] = useState(null);
  const [checking, setChecking] = useState(true);

  // ✅ Get user role from localStorage if context loses it
  useEffect(() => {
    const getStoredRole = () => {
      // Try to get from localStorage
      const storedRole = localStorage.getItem('user_role');
      const storedUser = localStorage.getItem('user');
      const storedUserType = localStorage.getItem('user_type');
      
      if (storedRole) {
        setUserRole(storedRole);
      } else if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          const role = userData.user_type || userData.role || 'user';
          setUserRole(role);
          // Store it for persistence
          localStorage.setItem('user_role', role);
          localStorage.setItem('user_type', role);
        } catch (e) {
          setUserRole('user');
        }
      } else if (storedUserType) {
        setUserRole(storedUserType);
      } else if (user) {
        const role = user.user_type || user.role || 'user';
        setUserRole(role);
        localStorage.setItem('user_role', role);
        localStorage.setItem('user_type', role);
      } else {
        setUserRole('user');
      }
      
      setChecking(false);
    };
    
    getStoredRole();
  }, [user]);

  // ✅ Check if user has admin access
  const isAdmin = () => {
    // Check from user object first
    if (user) {
      if (user.user_type === 'admin' || 
          user.user_type === 'company_admin' ||
          user.user_type === 'super_admin' ||
          user.user_type === 'platform_owner' ||
          user.role?.includes('admin') ||
          user.role?.startsWith('admin_')) {
        return true;
      }
    }
    
    // Check from localStorage
    const role = localStorage.getItem('user_role');
    const type = localStorage.getItem('user_type');
    
    if (role === 'admin' || 
        role === 'company_admin' || 
        role === 'super_admin' ||
        role === 'platform_owner' ||
        type === 'admin' ||
        type === 'company_admin' ||
        type === 'super_admin' ||
        type === 'platform_owner') {
      return true;
    }
    
    // Check stored user data
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.user_type === 'admin' || 
            userData.user_type === 'company_admin' ||
            userData.user_type === 'super_admin' ||
            userData.user_type === 'platform_owner' ||
            userData.is_admin === true) {
          return true;
        }
      } catch (e) {}
    }
    
    return false;
  };

  // ✅ Check if user is super admin
  const isSuperAdmin = () => {
    // Check from user object
    if (user) {
      if (user.user_type === 'super_admin' || 
          user.user_type === 'platform_owner' ||
          user.is_super_admin === true) {
        return true;
      }
    }
    
    // Check from localStorage
    const role = localStorage.getItem('user_role');
    const type = localStorage.getItem('user_type');
    const isSuperAdminFlag = localStorage.getItem('is_super_admin') === 'true';
    
    if (isSuperAdminFlag || 
        role === 'super_admin' || 
        role === 'platform_owner' ||
        type === 'super_admin' ||
        type === 'platform_owner') {
      return true;
    }
    
    // Check stored user data
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        if (userData.user_type === 'super_admin' || 
            userData.user_type === 'platform_owner' ||
            userData.is_super_admin === true) {
          return true;
        }
      } catch (e) {}
    }
    
    return false;
  };

  // ✅ Get the correct dashboard path based on role
  const getDashboardPath = (role) => {
    if (isSuperAdmin()) return '/super-admin/dashboard';
    if (role === 'admin' || role === 'company_admin') return '/admin/dashboard';
    if (role === 'safetypro' || role === 'safety_pro') return '/safetypro/dashboard';
    if (role === 'employee' || role === 'staff') return '/employee/dashboard';
    return '/dashboard';
  };

  if (loading || checking) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  // For protected routes, check authentication
  return (
    <Route
      {...rest}
      render={(props) => {
        // Check if user is authenticated
        if (!isAuthenticated || !user) {
          return <Redirect to="/login" />;
        }

        // Check plan access if required
        if (requiredPlan && canAccess && !canAccess(requiredPlan)) {
          return <Redirect to="/pricing" />;
        }

        // ✅ Check if admin access is required
        if (adminOnly) {
          const hasAdminAccess = isAdmin();
          
          if (!hasAdminAccess) {
            // Redirect to appropriate dashboard based on role
            const role = userRole || user?.user_type || 'user';
            const dashboardPath = getDashboardPath(role);
            return <Redirect to={dashboardPath} />;
          }
        }

        // ✅ Check if trying to access super admin route
        const path = rest.path || '';
        if (path.includes('/super-admin') || path.includes('super-admin')) {
          if (!isSuperAdmin()) {
            const role = userRole || user?.user_type || 'user';
            const dashboardPath = getDashboardPath(role);
            return <Redirect to={dashboardPath} />;
          }
        }

        // ✅ If route is admin dashboard but user is not admin
        if (path.includes('/admin/dashboard')) {
          if (!isAdmin()) {
            const role = userRole || user?.user_type || 'user';
            const dashboardPath = getDashboardPath(role);
            return <Redirect to={dashboardPath} />;
          }
        }

        // Render either the component or children
        return Component ? <Component {...props} /> : children;
      }}
    />
  );
};

export default ProtectedRoute;