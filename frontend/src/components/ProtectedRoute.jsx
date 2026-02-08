import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, isAdmin } from '../utils/auth';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const location = useLocation();

    if (!isAuthenticated()) {
        // Save the attempted URL for redirect after login
        localStorage.setItem('redirectAfterLogin', location.pathname);
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && !isAdmin()) {
        // Not authorized - redirect to home
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
