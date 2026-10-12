import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Show, SignInButton, SignUpButton, UserButton, useUser, useAuth } from '@clerk/react';
import { useAppDispatch } from '../store/hooks';
import authService from '../services/AuthService';
import { setClerkUser } from '../store/slices/authSlice';
import '../styles/AuthContainer.css';

// Синхронізація сесії Clerk з Redux і локальним сховищем
const ClerkSync = () => {
    const { user, isLoaded, isSignedIn } = useUser();
    const { getToken } = useAuth();
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (!isLoaded) return;
        if (isSignedIn && user) {
            getToken()
                .then((token) => {
                    authService.setClerkToken(token || null);
                    dispatch(setClerkUser({
                        id: user.id,
                        username: user.username || user.firstName || user.fullName || user.primaryEmailAddress?.emailAddress?.split('@')[0] || 'User',
                        email: user.primaryEmailAddress?.emailAddress || '',
                        token: token || null,
                    }));
                })
                .catch(() => {
                    authService.setClerkToken(null);
                    dispatch(setClerkUser({
                        id: user.id,
                        username: user.username || user.firstName || user.fullName || 'User',
                        email: user.primaryEmailAddress?.emailAddress || '',
                        token: null,
                    }));
                });
        } else {
            authService.setClerkToken(null);
            dispatch(setClerkUser(null));
        }
    }, [isLoaded, isSignedIn, user, dispatch, getToken]);

    return null;
};

const AuthContainer = () => {
    const headerRoot = typeof document !== 'undefined' ? document.querySelector('.logo-header') : null;

    const authHeader = (
        <div className="auth-header">
            <Show when="signed-in">
                <div className="clerk-user-menu-wrapper">
                    <UserButton
                        afterSignOutUrl="/"
                        appearance={{
                            elements: {
                                userButtonAvatarBox: {
                                    width: '36px',
                                    height: '36px',
                                },
                            },
                        }}
                    />
                </div>
            </Show>
            <Show when="signed-out">
                <div className="auth-buttons">
                    <SignInButton mode="modal">
                        <button className="auth-button login-button">Sign in</button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                        <button className="auth-button register-button">Register</button>
                    </SignUpButton>
                </div>
            </Show>
        </div>
    );

    return (
        <>
            <ClerkSync />

            {/* Меню користувача в куті хедера */}
            {headerRoot ? createPortal(authHeader, headerRoot) : authHeader}

            {/* Запрошення увійти, якщо користувач не авторизований */}
            <Show when="signed-out">
                <div className="auth-redirect">
                    <div className="auth-redirect-content">
                        <h1>Welcome to Playlist Manager!</h1>
                        <p>Please log in or register with Clerk to use the service.</p>
                        <div className="auth-redirect-buttons">
                            <SignInButton mode="modal">
                                <button className="auth-redirect-button login">Sign in</button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <button className="auth-redirect-button register">Register</button>
                            </SignUpButton>
                        </div>
                    </div>
                </div>
            </Show>
        </>
    );
};

export default AuthContainer;
