import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/AuthService';
import { googleLogout } from '@react-oauth/google';

export const initAuth = createAsyncThunk(
    'auth/init',
    async (_, { rejectWithValue }) => {
        try {
            if (authService.isAuthenticated()) {
                const user = authService.getUser();
                const token = authService.getToken();
                if (user && token) {
                    return { user, token };
                }
            }
            return rejectWithValue('Not authenticated');
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const login = createAsyncThunk(
    'auth/login',
    async ({ email, password }, { rejectWithValue }) => {
        const result = await authService.login(email, password);
        if (result.success) {
            return { user: result.data.user, token: result.data.token };
        }
        return rejectWithValue(result.message || 'Login failed');
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async ({ username, email, password, confirmPassword }, { rejectWithValue }) => {
        const result = await authService.register(username, email, password, confirmPassword);
        if (result.success && result.data?.token) {
            return { user: result.data.user, token: result.data.token };
        }
        return result; 
    }
);

export const verifyEmail = createAsyncThunk(
    'auth/verifyEmail',
    async ({ email, code }, { rejectWithValue }) => {
        const result = await authService.verifyEmail(email, code);
        if (result.success && result.data?.token) {
            return { user: result.data.user, token: result.data.token };
        }
        if (!result.success) {
            return rejectWithValue(result.message || 'Verification failed');
        }
        return result;
    }
);

export const googleLogin = createAsyncThunk(
    'auth/googleLogin',
    async (idToken, { rejectWithValue }) => {
        const result = await authService.googleLogin(idToken);
        if (result.success && result.data?.token) {
            return { user: result.data.user, token: result.data.token };
        }
        return rejectWithValue(result.message || 'Google login failed');
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { dispatch }) => {
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
        }
    }
);

export const changePassword = createAsyncThunk(
    'auth/changePassword',
    async ({ oldPassword, newPassword }, { rejectWithValue }) => {
        const result = await authService.changePassword(oldPassword, newPassword);
        if (!result.success) {
            return rejectWithValue(result.message);
        }
        return result;
    }
);

export const removeAccount = createAsyncThunk(
    'auth/removeAccount',
    async ({ password }, { rejectWithValue }) => {
        const result = await authService.removeAccount(password);
        if (!result.success) {
            return rejectWithValue(result.message);
        }
        return result;
    }
);

const initialUser = authService.getUser();
const initialToken = authService.getToken();
const initialIsAuthenticated = !!(initialUser && initialToken);

const initialState = {
    isAuthenticated: initialIsAuthenticated,
    currentUser: initialUser,
    userToken: initialToken,
    isLoading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        updateUserData: (state, action) => {
            state.currentUser = action.payload;
            localStorage.setItem('user', JSON.stringify(action.payload));
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(initAuth.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(initAuth.fulfilled, (state, action) => {
                state.isAuthenticated = true;
                state.currentUser = action.payload.user;
                state.userToken = action.payload.token;
                state.isLoading = false;
            })
            .addCase(initAuth.rejected, (state) => {
                state.isAuthenticated = false;
                state.currentUser = null;
                state.userToken = null;
                state.isLoading = false;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isAuthenticated = true;
                state.currentUser = action.payload.user;
                state.userToken = action.payload.token;
                state.error = null;
            })
            .addCase(login.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(register.fulfilled, (state, action) => {
                if (action.payload.token) {
                    state.isAuthenticated = true;
                    state.currentUser = action.payload.user;
                    state.userToken = action.payload.token;
                }
            })
            .addCase(verifyEmail.fulfilled, (state, action) => {
                if (action.payload.token) {
                    state.isAuthenticated = true;
                    state.currentUser = action.payload.user;
                    state.userToken = action.payload.token;
                }
            })
            .addCase(googleLogin.fulfilled, (state, action) => {
                state.isAuthenticated = true;
                state.currentUser = action.payload.user;
                state.userToken = action.payload.token;
            })
            .addCase(logout.fulfilled, (state) => {
                state.isAuthenticated = false;
                state.currentUser = null;
                state.userToken = null;
            })
            .addCase(removeAccount.fulfilled, (state) => {
                state.isAuthenticated = false;
                state.currentUser = null;
                state.userToken = null;
            });
    },
});

export const { updateUserData } = authSlice.actions;
export default authSlice.reducer;
