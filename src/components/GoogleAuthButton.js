import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';

const GoogleAuthButton = () => {
    const { googleLogin } = useAuth();
    const [errorMsg, setErrorMsg] = useState(null);

    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

    const handleSuccess = async (credentialResponse) => {
        setErrorMsg(null);
        const idToken = credentialResponse.credential;

        const result = await googleLogin(idToken);

        if (result.success) {
            console.log("Login with Google successfully!");
            // Тут ти можеш зробити редірект, наприклад:
            // navigate('/dashboard');
        } else {
            setErrorMsg(result.message);
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