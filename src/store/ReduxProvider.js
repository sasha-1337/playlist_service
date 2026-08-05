import React, { useMemo } from 'react';
import { Provider } from 'react-redux';
import { createAppStore } from './index';
import { logout } from './slices/authSlice';

export const ReduxProvider = ({ children }) => {
    const store = useMemo(() => {
        let _store;
        _store = createAppStore(() => {
            _store.dispatch(logout());
        });
        return _store;
    }, []);

    return <Provider store={store}>{children}</Provider>;
};

export default ReduxProvider;
