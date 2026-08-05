import { configureStore } from '@reduxjs/toolkit';
import libraryReducer from './slices/librarySlice';
import selectionReducer from './slices/selectionSlice';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';

export const createAppStore = (onUnauthorized) =>
    configureStore({
        reducer: {
            auth: authReducer,
            library: libraryReducer,
            selection: selectionReducer,
            ui: uiReducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                thunk: {
                    extraArgument: { onUnauthorized },
                },
            }),
    });

export default createAppStore;
