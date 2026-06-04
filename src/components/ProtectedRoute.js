import React from 'react';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div className="loading">Завантаження...</div>;
    }

    if (!isAuthenticated) {
        return null;
    }

    return children;
};

export default ProtectedRoute;
