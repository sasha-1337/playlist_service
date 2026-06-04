import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/AuthService';
import { googleLogout } from '@react-oauth/google';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userToken, setUserToken] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            if (authService.isAuthenticated()) {
                const user = authService.getUser();
                const token = authService.getToken();
                if (user) {
                    setIsAuthenticated(true);
                    setCurrentUser(user);
                    setUserToken(token);
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    
    const login = async (email, password) => {
        const result = await authService.login(email, password);
        if (result.success) {
            setIsAuthenticated(true);
            setCurrentUser(result.data.user);
            setUserToken(result.data.token);
        }
        return result;
    };

    const register = async (username, email, password, confirmPassword) => {
        const result = await authService.register(username, email, password, confirmPassword);
        return result;
    };

    const verifyEmail = async (email, code) => {
        const result = await authService.verifyEmail(email, code);
        // Якщо підтвердження успішне, користувач стає авторизованим
        if (result.success && result.data && result.data.token) {
            setIsAuthenticated(true);
            setCurrentUser(result.data.user);
            setUserToken(result.data.token);
        }
        return result;
    };

    // const register = async (username, email, password, confirmPassword) => {
    //     const result = await authService.register(username, email, password, confirmPassword);

    //     if (result.success && result.data && result.data.token) {
    //         setIsAuthenticated(true);
    //         setCurrentUser(result.data.user);
    //         console.log("Registered user:", result.data.user);
    //         setUserToken(result.data.token);
    //     }
    //     return result;
    // };

    const googleLogin = async (idToken) => {
        const result = await authService.googleLogin(idToken);
        if (result.success && result.data && result.data.token) {
            setIsAuthenticated(true);
            setCurrentUser(result.data.user);
            setUserToken(result.data.token);
        }
        return result;
    };

    const logout = async () => {
        try {
            await authService.logout();
        } catch (e) {
            console.error("Internal server error. Force logout: ", e);
        } finally {
            try {
                googleLogout();
            } catch (e) {
                console.log("Google session already cleared");
            }

            authService.clearLocalStorage();
            setIsAuthenticated(false);
            setCurrentUser(null);
            setUserToken(null);
        }
    };

    const updateUserData = (userData) => {
        setCurrentUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const changePassword = async (oldPassword, newPassword) => {
        const result = await authService.changePassword(oldPassword, newPassword);
        return result;
    };

    const removeAccount = async (password) => {
        const result = await authService.removeAccount(password);
        return result;
    };

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            currentUser,
            isLoading,
            login,
            register,
            verifyEmail,
            logout,
            googleLogin,
            changePassword,
            removeAccount,
            updateUserData,
            userToken
        }}>
            {/* Не рендеримо дочірні компоненти, поки йде перевірка токена */}
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};