import axios from 'axios';
import authService from '../services/AuthService';

// Axios instance for authenticated API requests
const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Axios instance for auth service (no interceptors, prevents circular token refresh loop)
const authClient = axios.create({
    baseURL: process.env.REACT_APP_AUTH_SERVICE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: add the token
apiClient.interceptors.request.use(
    (config) => {
        const token = authService.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

let refreshPromise = null;

// Response Interceptor: handle 401/403
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Ensure we only retry once by using a custom flag, and only on 401/403
        if (error.response && (error.response.status === 401 || error.response.status === 403) && !originalRequest._retry) {
            originalRequest._retry = true;

            if (!refreshPromise) {
                refreshPromise = authService.refreshToken().then((result) => {
                    refreshPromise = null;
                    if (!result.success) {
                        authService.clearLocalStorage();
                        window.dispatchEvent(new Event('auth:unauthorized'));
                        return Promise.reject(new Error('Session expired'));
                    }
                    return result.data?.token || result.token;
                }).catch((err) => {
                    refreshPromise = null;
                    authService.clearLocalStorage();
                    window.dispatchEvent(new Event('auth:unauthorized'));
                    return Promise.reject(err);
                });
            }

            try {
                const newToken = await refreshPromise;
                // Update the original request header with the new token
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                // Retry the request
                return apiClient(originalRequest);
            } catch (err) {
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export { apiClient, authClient };
