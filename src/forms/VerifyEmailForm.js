import React, { useState } from 'react';
import styles from '../styles/VerifyEmailForm.module.css';

const VerifyEmailForm = ({ email, onVerify, onBack, isLoading, error }) => {
    const [code, setCode] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onVerify(code);
    };

    return (
        <form onSubmit={handleSubmit}>
            <p>We've sent a 6-digit code to <strong>{email}</strong>.</p>

            <div className={styles.formGroup}>
                <label htmlFor="code">Verification Code:</label>
                <input
                    type="text"
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} // Додали захист: тільки цифри
                    placeholder="123456"
                    maxLength="6"
                    disabled={isLoading}
                    style={{ fontSize: '24px', letterSpacing: '4px', textAlign: 'center' }}
                />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <div className={styles.buttonContainer}>
                <button type="submit" disabled={isLoading || code.length < 6} className={styles.submitButton}>
                    {isLoading ? 'Verifying...' : 'Verify & Complete'}
                </button>
                <button type="button" onClick={onBack} disabled={isLoading} className={styles.cancelButton}>
                    Back
                </button>
            </div>
        </form>
    );
};

export default VerifyEmailForm;