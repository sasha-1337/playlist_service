class AuthService {
    constructor(baseUrl = process.env.REACT_APP_AUTH_SERVICE_API_URL) {
        this.baseUrl = baseUrl;
    }

    async register(username, email, password, confirmPassword) {
        try {
            const response = await fetch(`${this.baseUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    confirmPassword,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                return { success: true, message: data.message, data: data };
            } else {
                console.error('Registration error:', data);
                return { success: false, message: data.message || 'Registration failed' };
            }
        } catch (error) {
            console.error('Network error:', error);
            return { success: false, message: error.message || 'Network error' };
        }
    }

    async verifyEmail(email, code) {
        try {
            const response = await fetch(`${this.baseUrl}/verify-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
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
            return { success: false, message: error.message || 'Network error' };
        }
    }

    async login(email, password) {
        try {
            const response = await fetch(`${this.baseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
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
            return { success: false, message: error.message || 'Network error' };
        }
    }

    async googleLogin(idToken) {
        try {
            const response = await fetch(`${this.baseUrl}/google-login-oauth`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idToken }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
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
            return { success: false, message: error.message || 'Network error' };
        }
    }

    async logout() {
        try {
            const accessToken = this.getToken();
            const response = await fetch(`${this.baseUrl}/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                }
            });
            console.log('Logout response:', response);
            const result = await response.json();

            if (response.ok && result.success) {
                return { success: true, message: result.message || 'Logout successful' };
            }
            else {
                console.error('Logout error:', result);
                return { success: false, message: result.message || 'Logout failed' };
            }

        }
        catch (error) {
            return { success: false, message: error.message || 'Network error' };
        }
    }

    async changePassword(oldPassword, newPassword) {
        try {
            const response = await fetch(`${this.baseUrl}/change-password`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    oldPassword,
                    newPassword
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                console.log('Password changed successfully:', result);
                return { success: true, message: result.message || 'Password changed successfully' };
            }
            else {
                console.error('Error: Password failed to change:', result);
                return { success: false, message: result.message || 'Error: Password failed to change' };
            }
        } catch (error) {
            return { success: false, message: error.message || 'Network error' };
        }
    }

    async removeAccount(password) {
        try {
            const responseAuth = await fetch(`${this.baseUrl}/remove-account`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            const responseDb = await fetch(`${process.env.REACT_APP_API_BASE_URL}/items`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`,
                },
            });
            
            const resultAuth = await responseAuth.json();
            const resultDb = await responseDb.json();
            console.log(resultDb);
            if (responseAuth.ok && responseDb.ok && resultAuth.success) {
                return { success: true, message: resultAuth.message || resultDb.message || 'Account deleted successfully' };
            } else {
                return { success: false, message: resultAuth.message || resultDb.message || 'Error: Account cannot be deleted' };
            }
        } catch (error) {
            return { success: false, message: error.message || 'Network error' };
        }
    }

    async refreshToken() {
        try {
            const accessToken = this.getToken();
            const refreshToken = localStorage.getItem('refreshToken');

            const response = await fetch(`${this.baseUrl}/refresh-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    accessToken,
                    refreshToken
                }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                localStorage.setItem('authToken', result.token);
                if (result.refreshToken) localStorage.setItem('refreshToken', result.refreshToken);

                console.log('Token refreshed successfully:', result);
                return { success: true, message: result.message || 'Token refreshed successfully', data: result };
            }
            else {
                console.error('Error: Token can not be refreshed:', result);
                return { success: false, message: result.message || 'Error: Token can not be refreshed' };
            }
        }
        catch (error) {
            return { success: false, message: error.message || 'Network error' };
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
