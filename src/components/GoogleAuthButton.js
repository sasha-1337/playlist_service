import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAppDispatch } from '../store/hooks';
import { googleLogin } from '../store/slices/authSlice';
import { setShowLoginForm } from '../store/slices/uiSlice';

const GoogleAuthButton = ({ onSuccess, onClose }) => {
    const dispatch = useAppDispatch();
    const [errorMsg, setErrorMsg] = useState(null);

    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

    const handleSuccess = async (credentialResponse) => {
        setErrorMsg(null);
        const idToken = credentialResponse.credential;

        const resultAction = await dispatch(googleLogin(idToken));

        if (googleLogin.fulfilled.match(resultAction)) {
            console.log("Login with Google successfully!");
            if (onSuccess) {
                onSuccess(resultAction.payload?.user);
            }
            if (onClose) {
                onClose();
            } else {
                dispatch(setShowLoginForm(false));
            }
        } else {
            setErrorMsg(resultAction.payload);
        }
    };

    const handleError = () => {
        setErrorMsg("Failed connect to Google.");
        console.error('Google Login Failed');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '10px' }}>
            <GoogleOAuthProvider clientId={clientId}>
                <GoogleLogin
                    onSuccess={handleSuccess}
                    onError={handleError}
                    useOneTap
                    shape="rectangular"
                    text="continue_with"
                />
            </GoogleOAuthProvider>

            {errorMsg && <p style={{ color: 'red', marginTop: '10px' }}>{errorMsg}</p>}
        </div>
    );
};

export default GoogleAuthButton;