import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spin, Alert } from 'antd';

const AdminRoute = ({ component: Component, ...rest }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Route
      {...rest}
      render={(props) => {
        // Check if user is authenticated and is an admin
        const isAdmin = user && (user.user_type === 'admin' || user.role?.includes('admin'));
        
        if (!user) {
          return <Redirect to="/login" />;
        }

        if (!isAdmin) {
          return (
            <div style={{ padding: '50px' }}>
              <Alert
                message="Access Denied"
                description="You do not have permission to access the admin dashboard."
                type="error"
                showIcon
              />
            </div>
          );
        }

        return <Component {...props} />;
      }}
    />
  );
};

export default AdminRoute;