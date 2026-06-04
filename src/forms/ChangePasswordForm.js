import React, { useState } from 'react';
import { MdVisibility, MdVisibilityOff, MdCheck, MdError } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/SettingsModal.module.css';
import VerifyEmailForm from './VerifyEmailForm';

const ChangePasswordForm = ({ onCancel, onSuccess }) => {
    // Додаємо verifyEmail з вашого AuthContext
    const { changePassword, verifyEmail, currentUser } = useAuth();

    const [formData, setFormData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [showPasswords, setShowPasswords] = useState({
        old: false,
        new: false,
        confirm: false,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [step, setStep] = useState(1);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const togglePasswordVisibility = (field) => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const validateForm = () => {
        if (!formData.oldPassword.trim() || !formData.newPassword.trim() || !formData.confirmPassword.trim()) {
            setError('Fullfill all fields');
            return false;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords dont matches');
            return false;
        }
        if (formData.newPassword.length < 8) {
            setError('Minimum 8 chars');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setError('');

        try {
            const result = await changePassword(formData.oldPassword, formData.newPassword);
            if (result.success) {
                setSuccess('Verification code sent to your email address');
                setStep(2);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Error while chaneging password');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifySubmit = async (code) => {
        setIsLoading(true);
        setError('');

        const result = await verifyEmail(currentUser.email, code);

        setIsLoading(false);

        if (result.success) {
            setSuccess('Paswsword changed successfully');
            setTimeout(() => onSuccess && onSuccess(), 1500);
        } else {
            setError(result.message);
        }
    };

    return (
        <>
            {step === 1 && (
                <form className={styles.formContainer} onSubmit={handleSubmit}>
                    {/* Old Password */}
                    <div className={styles.passwordField}>
                        <label htmlFor="oldPassword">Current password</label>
                        <div className={styles.passwordInputWrapper}>
                            <input
                                type={showPasswords.old ? 'text' : 'password'}
                                id="oldPassword"
                                name="oldPassword"
                                value={formData.oldPassword}
                                onChange={handleInputChange}
                                placeholder="Enter current password"
                                disabled={isLoading}
                                className={styles.input}
                            />
                            <button
                                type="button"
                                className={styles.toggleButton}
                                onClick={() => togglePasswordVisibility('old')}
                                disabled={isLoading}
                            >
                                {showPasswords.old ? <MdVisibilityOff /> : <MdVisibility />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div className={styles.passwordField}>
                        <label htmlFor="newPassword">New password</label>
                        <div className={styles.passwordInputWrapper}>
                            <input
                                type={showPasswords.new ? 'text' : 'password'}
                                id="newPassword"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                placeholder="Enter new password"
                                disabled={isLoading}
                                className={styles.input}
                            />
                            <button
                                type="button"
                                className={styles.toggleButton}
                                onClick={() => togglePasswordVisibility('new')}
                                disabled={isLoading}
                            >
                                {showPasswords.new ? <MdVisibilityOff /> : <MdVisibility />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div className={styles.passwordField}>
                        <label htmlFor="confirmPassword">Confirm new password</label>
                        <div className={styles.passwordInputWrapper}>
                            <input
                                type={showPasswords.confirm ? 'text' : 'password'}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Repeat new password"
                                disabled={isLoading}
                                className={styles.input}
                            />
                            <button
                                type="button"
                                className={styles.toggleButton}
                                onClick={() => togglePasswordVisibility('confirm')}
                                disabled={isLoading}
                            >
                                {showPasswords.confirm ? <MdVisibilityOff /> : <MdVisibility />}
                            </button>
                        </div>
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
                            className={styles.submitButton}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Loading...' : 'Change password'}
                        </button>
                    </div>
                </form>
            )}

            {step === 2 && (
                <VerifyEmailForm
                    email={currentUser?.email} // Використовуємо email з контексту
                    isLoading={isLoading}
                    error={error} // Передаємо єдиний стан помилки
                    onVerify={handleVerifySubmit}
                    onBack={() => setStep(1)}
                />
            )}
        </>
    );
};

export default ChangePasswordForm;