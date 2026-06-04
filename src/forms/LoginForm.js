import React, { useState } from 'react';
import styles from '../styles/LoginForm.module.css';
//import AuthService from '../services/AuthService';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';

function LoginForm({ onClose, onSuccess }) {
    const { login } = useAuth();

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

        const result = await login(
            formData.email,
            formData.password
        );

        setIsLoading(false);

        if (result.success) {
            setSuccessMessage('Login successful! Redirecting...');
            setTimeout(() => {
                //login(result.user);
                if (onSuccess) {
                    onSuccess(result.user);
                    window.location.href = '/';
                }
                onClose();
            }, 1500); 
        } else {
            setErrors({ submit: result.message });
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
                    <GoogleAuthButton />
                </div>
            </div>
        </div>
    );
}

export default LoginForm;
