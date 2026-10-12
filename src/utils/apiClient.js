import axios from 'axios';
import authService from '../services/AuthService';

// Axios instance for backend API requests (:5000)
const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Fallback alias for backward compatibility
const authClient = apiClient;

// Request Interceptor: attach Clerk session token
apiClient.interceptors.request.use(
    async (config) => {
        let token = null;

        // 1. Отримуємо свіжий токен з поточної активної сесії Clerk
        if (typeof window !== 'undefined' && window.Clerk?.session) {
            try {
                token = await window.Clerk.session.getToken();
                if (token) {
                    authService.setClerkToken(token);
                }
            } catch (err) {
                console.warn('⚠️ [apiClient] Failed to fetch token from window.Clerk.session:', err);
                token = authService.getClerkToken();
            }
        } else {
            token = authService.getClerkToken();
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: handle 401/403 with Clerk session token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && (error.response.status === 401 || error.response.status === 403) && !originalRequest._retry) {
            originalRequest._retry = true;

            // Примусово оновлюємо токен сесії Clerk (skipCache: true)
            if (typeof window !== 'undefined' && window.Clerk?.session) {
                try {
                    const newToken = await window.Clerk.session.getToken({ skipCache: true });
                    if (newToken) {
                        authService.setClerkToken(newToken);
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return apiClient(originalRequest);
                    }
                } catch (clerkErr) {
                    console.error('❌ [apiClient] Clerk session refresh failed:', clerkErr);
                }
            }

            // Якщо токен не вдалося оновити — очищаємо та сповіщаємо додаток
            authService.setClerkToken(null);
            window.dispatchEvent(new Event('auth:unauthorized'));
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

export { apiClient, authClient };
