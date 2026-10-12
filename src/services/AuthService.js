/**
 * Clerk-focused AuthService for managing client-side auth state and token persistence.
 */
class AuthService {
    setClerkToken(token) {
        if (token) {
            localStorage.setItem('clerkToken', token);
        } else {
            localStorage.removeItem('clerkToken');
        }
    }

    getClerkToken() {
        return localStorage.getItem('clerkToken');
    }

    getToken() {
        return this.getClerkToken();
    }

    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    setUser(user) {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('user');
        }
    }

    clearLocalStorage() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('clerkToken');
    }

    isAuthenticated() {
        return !!this.getClerkToken();
    }
}

const authService = new AuthService();
export default authService;
