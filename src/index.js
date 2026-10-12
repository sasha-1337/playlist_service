import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import ReduxProvider from './store/ReduxProvider';

import { ClerkProvider } from '@clerk/react';
import { ACTIVE_AUTH_MODE, AUTH_MODES } from './config/authConfig';

const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

if (ACTIVE_AUTH_MODE.id === AUTH_MODES.CLERK.id && !clerkPubKey) {
    throw new Error('REACT_APP_CLERK_PUBLISHABLE_KEY is not defined in your .env file.');
}

const root = ReactDOM.createRoot(document.getElementById('root'));

if (ACTIVE_AUTH_MODE.id === AUTH_MODES.CLERK.id) {
    root.render(
        <React.StrictMode>
            <ClerkProvider publishableKey={clerkPubKey}>
                <ReduxProvider>
                    <App />
                </ReduxProvider>
            </ClerkProvider>
        </React.StrictMode>
    );
} else {
    root.render(
        <React.StrictMode>
            <ReduxProvider>
                <App />
            </ReduxProvider>
        </React.StrictMode>
    );
}