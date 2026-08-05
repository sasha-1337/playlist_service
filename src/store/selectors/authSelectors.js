import { createSelector } from '@reduxjs/toolkit';

export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectCurrentUser = (state) => state.auth.currentUser;
export const selectUserToken = (state) => state.auth.userToken;
export const selectAuthIsLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;

export const selectUserId = createSelector(
    selectCurrentUser,
    (user) => user?.id ?? null
);
