import React, { useState } from 'react';
import styles from '../styles/LoginForm.module.css';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { useAppDispatch } from '../store/hooks';
import { login } from '../store/slices/authSlice';

function LoginForm({ onClose, onSuccess }) {
    const dispatch = useAppDispatch();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setSuccessMessage('');

        const resultAction = await dispatch(login({
            email: formData.email,
            password: formData.password
        }));

        setIsLoading(false);

        if (login.fulfilled.match(resultAction)) {
            const result = resultAction.payload;
            setSuccessMessage('Login successful!');

            if (onSuccess) {
                onSuccess(result.user);
            }
            if (onClose) {
                onClose();
            }

        } else {
            setErrors({ submit: resultAction.payload });
        }
    };

    return (
        <div className={styles.loginFormContainer}>
            <div className={styles.loginFormContent}>
                <h2>Sign In</h2>

                {successMessage && (
                    <div className={styles.successMessage}>{successMessage}</div>
                )}

                {errors.submit && (
                    <div className={styles.errorMessage}>{errors.submit}</div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label htmlFor="email">Email:</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            disabled={isLoading}
                        />
                        {errors.email && (
                            <span className={styles.error}>{errors.email}</span>
                        )}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="password">Password:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            disabled={isLoading}
                        />
                        {errors.password && (
                            <span className={styles.error}>{errors.password}</span>
                        )}
                    </div>

                    <div className={styles.buttonContainer}>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={styles.submitButton}
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className={styles.cancelButton}
                        >
                            Cancel
                        </button>
                    </div>
                </form>

                <div className={styles.divider}>
                    <span>OR</span>
                </div>

                <div className={styles.googleAuthContainer}>
                    <GoogleAuthButton onSuccess={onSuccess} onClose={onClose} />
                </div>
            </div>
        </div>
    );
}

export default LoginForm;
