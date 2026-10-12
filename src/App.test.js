import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import App from './App';
import { createAppStore } from './store';

jest.mock('./services/AuthService', () => ({
    __esModule: true,
    default: {
        isAuthenticated: jest.fn(() => false),
        getUser: jest.fn(() => null),
        getToken: jest.fn(() => null),
        login: jest.fn(),
        register: jest.fn(),
        verifyEmail: jest.fn(),
        googleLogin: jest.fn(),
        logout: jest.fn(),
    },
}));

const renderApp = () => {
    const store = createAppStore(jest.fn());
    return render(
        <Provider store={store}>
            <App />
        </Provider>
    );
};

test('renders app title', () => {
    renderApp();
    expect(screen.getByText(/Playlist Manager/i)).toBeInTheDocument();
});

test('renders auth container welcome message when not authenticated', () => {
    renderApp();
    expect(screen.getByText(/Welcome to Playlist Manager/i)).toBeInTheDocument();
});
