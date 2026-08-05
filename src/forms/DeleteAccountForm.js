import React, { useState } from 'react';
import { MdVisibility, MdVisibilityOff, MdWarning, MdCheck, MdError } from 'react-icons/md';
import { useAppDispatch, useCurrentUser } from '../store/hooks';
import { removeAccount, verifyEmail, logout } from '../store/slices/authSlice';
import styles from '../styles/SettingsModal.module.css';
import VerifyEmailForm from './VerifyEmailForm';

const DeleteAccountConfirm = ({ onCancel, onSuccess }) => {
    const dispatch = useAppDispatch();
    const currentUser = useCurrentUser();
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [step, setStep] = useState(1);

    const confirmationText = `Delete ${currentUser?.username}`;

    const isFormValid = () => {
        return password.trim() && confirmText.trim() === confirmationText;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password.trim()) {
            setError('Input your password');
            return;
        }

        if (confirmText !== confirmationText) {
            setError(`Input text "${confirmationText}" for deleting confirmation`);
            return;
        }

        setIsLoading(true);
        setError('');
        setSuccess('');

        try {
            const resultAction = await dispatch(removeAccount({ password }));
            if (removeAccount.fulfilled.match(resultAction)) {   
                setStep(2);
            } else {
                setError(resultAction.payload || 'Failed to delete account');
            }
        } catch (error) {
            setError(error.message || 'Error request');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifySubmit = async (code) => {
        if (!code || code.length < 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const resultAction = await dispatch(verifyEmail({ 
                email: currentUser.email, 
                code 
            }));

            if (verifyEmail.fulfilled.match(resultAction)) {
                setSuccess('Account deleted successfully! Redirecting...');
                dispatch(logout());
                setTimeout(() => {
                    if (onSuccess) onSuccess(resultAction.payload);
                }, 1500);
            } else {
                setError(resultAction.payload || 'Verification failed');
            }
        } catch (err) {
            setError('Connection error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            { step === 1 && (
        <form className={styles.formContainer} onSubmit={handleSubmit}>
            {/* Warning */}
            <div className={styles.warningBox}>
                <MdWarning className={styles.warningIcon} />
                <div>
                            <h4>Warning: This action cannot be undone.</h4>
                            <p>Deleting your account will result in the permanent loss of all your data, including playlists, albums, and singles.</p>
                </div>
            </div>

            {/* Password Input */}
            <div className={styles.passwordField}>
                        <label htmlFor="deletePassword">Enter your password</label>
                <div className={styles.passwordInputWrapper}>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        id="deletePassword"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            setError('');
                        }}
                        placeholder="Your password"
                        disabled={isLoading}
                        className={styles.input}
                    />
                    <button
                        type="button"
                        className={styles.toggleButton}
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                    >
                        {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                    </button>
                </div>
            </div>

            {/* Confirmation Text */}
            <div className={styles.formGroup}>
                <label htmlFor="confirmText">
                    Enter text to confirm:
                    <code>{confirmationText}</code>
                </label>
                <input
                    type="text"
                    id="confirmText"
                    value={confirmText}
                    onChange={(e) => {
                        setConfirmText(e.target.value);
                        setError('');
                    }}
                    placeholder={confirmationText}
                    disabled={isLoading}
                    className={styles.input}
                />
            </div>

            {/* Messages */}
            {error && (
                <div className={styles.errorMessage}>
                    <MdError /> {error}
                </div>
            )}

            {success && (
                <div className={styles.successMessage}>
                    <MdCheck /> {success}
                </div>
            )}

            {/* Buttons */}
            <div className={styles.formButtons}>
                <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={onCancel}
                    disabled={isLoading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className={`${styles.dangerButton} ${!isFormValid() ? styles.disabled : ''}`}
                    disabled={isLoading || !isFormValid()}
                >
                    {isLoading ? 'Loading...' : 'Delete acoount'}
                </button>
            </div>
            </form>
            )}
            {step === 2 && ( 
                <VerifyEmailForm
                    email={currentUser?.email}
                    isLoading={isLoading}
                    error={error}
                    onVerify={handleVerifySubmit}
                    onBack={() => setStep(1)}
                />
            )}
        </>
    );
};

export default DeleteAccountConfirm;
