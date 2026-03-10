import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, isAdmin } from '../utils/auth';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const location = useLocation();

    if (!isAuthenticated()) {
        // Redirect to login - will go to homepage after successful login
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && !isAdmin()) {
        // Not authorized - redirect to home
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
