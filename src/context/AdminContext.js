// src/context/AdminContext.js - Updated with better error handling

import React, { createContext, useState, useContext, useEffect } from 'react';
import adminService from '../services/adminService';
import { message } from 'antd';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  // ✅ Don't throw error - return default values instead
  if (!context) {
    console.warn('useAdmin used outside of AdminProvider - returning default values');
    return {
      adminStats: null,
      pendingApprovals: [],
      users: [],
      loading: false,
      error: null,
      loadAdminStats: async () => ({ success: false, stats: {} }),
      loadPendingApprovals: async () => ({ pending_approvals: [] }),
      approveAdmin: async () => ({ success: false }),
      loadUsers: async () => ({ users: [] }),
      updateUser: async () => ({ success: false }),
      deleteUser: async () => ({ success: false }),
      getPlatformAnalytics: async () => ({ analytics: {} }),
      getAdminIncidents: async () => ({ incidents: [] }),
      initializeAdminData: async () => {},
      clearError: () => {}
    };
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [adminStats, setAdminStats] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Clear error
  const clearError = () => setError(null);

  // Load admin dashboard stats
  const loadAdminStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await adminService.getAdminDashboardStats();
      setAdminStats(stats);
      return stats;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load admin stats';
      setError(errorMessage);
      // ✅ Don't show message here - let component handle it
      console.error('Error loading admin stats:', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load pending admin approvals
  const loadPendingApprovals = async () => {
    setLoading(true);
    setError(null);
    try {
      const approvals = await adminService.getPendingApprovals();
      setPendingApprovals(approvals.pending_approvals || []);
      return approvals;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load pending approvals';
      setError(errorMessage);
      console.error('Error loading pending approvals:', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Approve admin
  const approveAdmin = async (adminId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminService.approveAdmin(adminId);
      // Remove from pending approvals
      setPendingApprovals(prev => prev.filter(admin => admin.id !== adminId));
      message.success('Admin approved successfully');
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to approve admin';
      setError(errorMessage);
      message.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Load users with filtering
  const loadUsers = async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const usersData = await adminService.getUsers(filters);
      setUsers(usersData.users || []);
      return usersData;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load users';
      setError(errorMessage);
      console.error('Error loading users:', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user
  const updateUser = async (userId, userData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminService.updateUser(userId, userData);
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ...userData } : user
      ));
      message.success('User updated successfully');
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update user';
      setError(errorMessage);
      message.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await adminService.deleteUser(userId);
      // Remove from local state
      setUsers(prev => prev.filter(user => user.id !== userId));
      message.success('User deleted successfully');
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete user';
      setError(errorMessage);
      message.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get platform analytics
  const getPlatformAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const analytics = await adminService.getPlatformAnalytics();
      return analytics;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load analytics';
      setError(errorMessage);
      console.error('Error loading analytics:', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get admin incidents
  const getAdminIncidents = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const incidents = await adminService.getAdminIncidents(params);
      return incidents;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to load incidents';
      setError(errorMessage);
      console.error('Error loading incidents:', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Initialize admin data if user is admin
  const initializeAdminData = async (user) => {
    const isAdmin = user && (user.user_type === 'admin' || user.role?.includes('admin'));
    if (isAdmin) {
      try {
        await loadAdminStats();
        await loadPendingApprovals();
      } catch (err) {
        console.error('Failed to initialize admin data:', err);
      }
    }
  };

  // Effect to clear error when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, []);

  const value = {
    // State
    adminStats,
    pendingApprovals,
    users,
    loading,
    error,
    
    // Actions
    loadAdminStats,
    loadPendingApprovals,
    approveAdmin,
    loadUsers,
    updateUser,
    deleteUser,
    getPlatformAnalytics,
    getAdminIncidents,
    initializeAdminData,
    clearError
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContext;