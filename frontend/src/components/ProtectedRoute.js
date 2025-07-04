import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  // ✅ Redirect to login if user is not authenticated
  if (!user && !token) {
    return <Navigate to="/login" replace />;
  }

  // ✅ If authenticated, render the requested component
  return children;
};

export default ProtectedRoute;
