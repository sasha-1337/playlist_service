import React from 'react';
import { useAuth } from '@clerk/react';

const ProtectedRoute = ({ children }) => {
    const { isLoaded, isSignedIn } = useAuth();

    if (!isLoaded) {
        return <div className="loading">Завантаження...</div>;
    }

    if (!isSignedIn) {
        return null;
    }

    return children;
};

export default ProtectedRoute;
