import { authClient, apiClient } from '../utils/apiClient';

class AuthService {
    constructor() {
        // Base URL is now handled by Axios instances, but we keep this if needed somewhere else
        this.baseUrl = process.env.REACT_APP_AUTH_SERVICE_API_URL || 'http://localhost:5000/api';
    }

    async register(username, email, password, confirmPassword) {
        try {
            const response = await authClient.post('/register', {
                username,
                email,
                password,
                confirmPassword,
            });

            const data = response.data;

            if (data.success) {
                return { success: true, message: data.message, data: data };
            } else {
                console.error('Registration error:', data);
                return { success: false, message: data.message || 'Registration failed' };
            }
        } catch (error) {
            console.error('Network error:', error);
            const data = error.response?.data;
            return { success: false, message: data?.message || error.message || 'Network error' };
        }
    }

    async verifyEmail(email, code) {
        try {
            const response = await authClient.post('/verify-email', { email, code });
            const result = response.data;

            if (result.success) {
                if (result.token) {
                    localStorage.setItem('authToken', result.token);
                    localStorage.setItem('refreshToken', result.refreshToken);
                    localStorage.setItem('user', JSON.stringify(result.user));
                }
                return { success: true, message: result.message, data: result };
            } else {
                return { success: false, message: result.message || 'Verification failed' };
            }
        } catch (error) {
            const data = error.response?.data;
            return { success: false, message: data?.message || error.message || 'Network error' };
        }
    }

    async login(email, password) {
        try {
            const response = await authClient.post('/login', { email, password });
            const result = response.data;

            if (result.success) {
                if (result.token) {
                    localStorage.setItem('authToken', result.token);
                    localStorage.setItem('refreshToken', result.refreshToken);
                    localStorage.setItem('user', JSON.stringify(result.user));
                }
                return { success: true, message: result.message, data: result };
            } else {
                return { success: false, message: result.message || 'Login failed' };
            }
        } catch (error) {
            const data = error.response?.data;
            return { success: false, message: data?.message || error.message || 'Network error' };
        }
    }

    async googleLogin(idToken) {
        try {
            const response = await authClient.post('/google-login-oauth', { idToken });
            const result = response.data;

            if (result.success) {
                if (result.token) {
                    localStorage.setItem('authToken', result.token);
                    if (result.refreshToken) {
                        localStorage.setItem('refreshToken', result.refreshToken);
                    }
                    localStorage.setItem('user', JSON.stringify(result.user));
                }
                return { success: true, message: result.message, data: result };
            } else {
                return { success: false, message: result.message || 'Google Login failed' };
            }
        } catch (error) {
            const data = error.response?.data;
            return { success: false, message: data?.message || error.message || 'Network error' };
        }
    }

    async logout() {
        try {
            const accessToken = this.getToken();
            const response = await authClient.post('/logout', {}, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                }
            });
            
            const result = response.data;
            console.log('Logout response:', result);

            if (result.success) {
                return { success: true, message: result.message || 'Logout successful' };
            } else {
                console.error('Logout error:', result);
                return { success: false, message: result.message || 'Logout failed' };
            }
        } catch (error) {
            const data = error.response?.data;
            return { success: false, message: data?.message || error.message || 'Network error' };
        }
    }

    async changePassword(oldPassword, newPassword) {
        try {
            const response = await authClient.post('/change-password', {
                oldPassword,
                newPassword
            }, {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                }
            });

            const result = response.data;

            if (result.success) {
                console.log('Password changed successfully:', result);
                return { success: true, message: result.message || 'Password changed successfully' };
            } else {
                console.error('Error: Password failed to change:', result);
                return { success: false, message: result.message || 'Error: Password failed to change' };
            }
        } catch (error) {
            const data = error.response?.data;
            return { success: false, message: data?.message || error.message || 'Network error' };
        }
    }

    async removeAccount(password) {
        try {
            const responseAuth = await authClient.delete('/remove-account', {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                },
                data: { password }
            });

            // Use apiClient for items deletion (auto-injects token)
            const responseDb = await apiClient.delete('/items');
            
            const resultAuth = responseAuth.data;
            const resultDb = responseDb.data;
            console.log(resultDb);
            
            if (resultAuth.success) {
                return { success: true, message: resultAuth.message || resultDb.message || 'Account deleted successfully' };
            } else {
                return { success: false, message: resultAuth.message || resultDb.message || 'Error: Account cannot be deleted' };
            }
        } catch (error) {
            const data = error.response?.data;
            return { success: false, message: data?.message || error.message || 'Network error' };
        }
    }

    async refreshToken() {
        try {
            const accessToken = this.getToken();
            const refreshToken = localStorage.getItem('refreshToken');

            const response = await authClient.post('/refresh-token', {
                accessToken,
                refreshToken
            });

            const result = response.data;

            if (result.success) {
                localStorage.setItem('authToken', result.token);
                if (result.refreshToken) localStorage.setItem('refreshToken', result.refreshToken);

                console.log('Token refreshed successfully:', result);
                return { success: true, message: result.message || 'Token refreshed successfully', data: result };
            } else {
                console.error('Error: Token can not be refreshed:', result);
                return { success: false, message: result.message || 'Error: Token can not be refreshed' };
            }
        } catch (error) {
            const data = error.response?.data;
            return { success: false, message: data?.message || error.message || 'Network error' };
        }
    };

    clearLocalStorage() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    }

    getToken() {
        return localStorage.getItem('authToken');
    }

    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    isAuthenticated() {
        return !!this.getToken();
    }
}

const authService = new AuthService();

export default authService;
