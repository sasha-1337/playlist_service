import React from 'react';
import { useAppSelector, useIsAuthenticated } from '../store/hooks';
import { selectAuthIsLoading } from '../store/selectors/authSelectors';

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = useIsAuthenticated();
    const isLoading = useAppSelector(selectAuthIsLoading);

    if (isLoading) {
        return <div className="loading">Завантаження...</div>;
    }

    if (!isAuthenticated) {
        return null;
    }

    return children;
};

export default ProtectedRoute;
