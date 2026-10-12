import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/AuthService';

// Legacy stub thunks (retained for backward compatibility with unused legacy forms)
export const initAuth = createAsyncThunk('auth/init', async () => null);
export const login = createAsyncThunk('auth/login', async () => null);
export const register = createAsyncThunk('auth/register', async () => null);
export const verifyEmail = createAsyncThunk('auth/verifyEmail', async () => null);
export const googleLogin = createAsyncThunk('auth/googleLogin', async () => null);
export const logout = createAsyncThunk('auth/logout', async () => {
    authService.clearLocalStorage();
    return null;
});
export const changePassword = createAsyncThunk('auth/changePassword', async () => null);
export const removeAccount = createAsyncThunk('auth/removeAccount', async () => null);

const initialState = {
    isAuthenticated: false,
    currentUser: null,
    userToken: null,
    isLoading: false,
    error: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        updateUserData: (state, action) => {
            state.currentUser = action.payload;
            authService.setUser(action.payload);
        },
        setClerkUser: (state, action) => {
            if (action.payload) {
                state.isAuthenticated = true;
                state.currentUser = action.payload;
                state.userToken = action.payload.token || null;
            } else {
                state.isAuthenticated = false;
                state.currentUser = null;
                state.userToken = null;
            }
        },
    },
    extraReducers: (builder) => {
        builder.addCase(logout.fulfilled, (state) => {
            state.isAuthenticated = false;
            state.currentUser = null;
            state.userToken = null;
        });
    },
});

export const { updateUserData, setClerkUser } = authSlice.actions;
export default authSlice.reducer;
