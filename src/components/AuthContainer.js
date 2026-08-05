import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import LoginForm from '../forms/LoginForm';
import RegisterForm from '../forms/RegisterForm';
import UserMenu from './UserMenu';
import { useIsAuthenticated, useAppDispatch, useAppSelector } from '../store/hooks';
import { setShowLoginForm, setShowRegisterForm } from '../store/slices/uiSlice';
import { selectShowLoginForm, selectShowRegisterForm } from '../store/selectors/uiSelectors';
import '../styles/AuthContainer.css';

const AuthContainer = () => {
    const isAuthenticated = useIsAuthenticated();
    const dispatch = useAppDispatch();
    const showLoginForm = useAppSelector(selectShowLoginForm);
    const showRegisterForm = useAppSelector(selectShowRegisterForm);

    const handleLoginSuccess = (data) => {
        dispatch(setShowLoginForm(false));
    };

    const handleRegisterSuccess = (data) => {
        dispatch(setShowRegisterForm(false));

        if (!data?.token) {
            dispatch(setShowLoginForm(true));
        }
    };

    const headerRoot = typeof document !== 'undefined' ? document.querySelector('.logo-header') : null;

    const authHeader = (
        <div className="auth-header">
            {isAuthenticated ? (
                <UserMenu />
            ) : (
                <div className="auth-buttons">
                    <button 
                        onClick={() => dispatch(setShowLoginForm(true))}
                        className="auth-button login-button"
                    >
                        Sign in
                    </button>
                    <button 
                        onClick={() => dispatch(setShowRegisterForm(true))}
                        className="auth-button register-button"
                    >
                        Register
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <>
            {/* Auth Header rendered into the page header via portal so it is attached to header */}
            {headerRoot ? createPortal(authHeader, headerRoot) : authHeader}

            {/* Redirect to login if not authenticated */}
            {!isAuthenticated && (
                <div className="auth-redirect">
                    <div className="auth-redirect-content">
                        <h1>Welcome to PlaylistService!</h1>
                        <p>Please log in or register to use the service.</p>
                        <div className="auth-redirect-buttons">
                            <button 
                                onClick={() => dispatch(setShowLoginForm(true))}
                                className="auth-redirect-button login"
                            >
                                Sign in
                            </button>
                            <button 
                                onClick={() => dispatch(setShowRegisterForm(true))}
                                className="auth-redirect-button register"
                            >
                                Register
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Show Login Form */}
            {showLoginForm && (
                <LoginForm
                    onClose={() => dispatch(setShowLoginForm(false))}
                    onSuccess={handleLoginSuccess}
                />
            )}

            {/* Show Register Form */}
            {showRegisterForm && (
                <RegisterForm
                    onClose={() => dispatch(setShowRegisterForm(false))}
                    onSuccess={handleRegisterSuccess}
                />
            )}
        </>
    );
};

export default AuthContainer;
