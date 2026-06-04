// import React, { useState } from 'react';
// import styles from '../styles/RegisterForm.module.css';
// import {useAuth} from '../context/AuthContext';

// function RegisterForm({ onClose, onSuccess }) {
//     const [formData, setFormData] = useState({
//         username: '',
//         email: '',
//         password: '',
//         confirmPassword: '',
//     });

//     const [errors, setErrors] = useState({});
//     const [isLoading, setIsLoading] = useState(false);
//     const [successMessage, setSuccessMessage] = useState('');
//     const { register } = useAuth();

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));
//         // Clear error for this field when user starts typing
//         if (errors[name]) {
//             setErrors(prev => ({
//                 ...prev,
//                 [name]: ''
//             }));
//         }
//     };

//     const validateForm = () => {
//         const newErrors = {};

//         if (!formData.username.trim()) {
//             newErrors.username = 'Username is required';
//         } else if (formData.username.length < 3) {
//             newErrors.username = 'Username must be at least 3 characters';
//         } else if (formData.username.length > 50) {
//             newErrors.username = 'Username must be less than 50 characters';
//         }

//         if (!formData.email.trim()) {
//             newErrors.email = 'Email is required';
//         } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
//             newErrors.email = 'Invalid email format';
//         }

//         if (!formData.password) {
//             newErrors.password = 'Password is required';
//         } else if (formData.password.length < 8) {
//             newErrors.password = 'Password must be at least 8 characters';
//         }

//         if (!formData.confirmPassword) {
//             newErrors.confirmPassword = 'Please confirm your password';
//         } else if (formData.password !== formData.confirmPassword) {
//             newErrors.confirmPassword = 'Passwords do not match';
//         }

//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (!validateForm()) {
//             return;
//         }

//         setIsLoading(true);
//         setSuccessMessage('');

//         const result = await register(
//             formData.username,
//             formData.email,
//             formData.password,
//             formData.confirmPassword
//         );

//         setIsLoading(false);

//         if (result.success) {
//             setSuccessMessage('Registration successful! Redirecting...');
//             setTimeout(() => {
//                 if (onSuccess) {
//                     onSuccess(result);
//                 }
//             });
//         } else {
//             setErrors({ submit: result.message });
//         }
//     };

//     return (
//         <div className={styles.registerFormContainer}>
//             <div className={styles.registerFormContent}>
//                 <h2>Create Account</h2>

//                 {successMessage && (
//                     <div className={styles.successMessage}>{successMessage}</div>
//                 )}

//                 {errors.submit && (
//                     <div className={styles.errorMessage}>{errors.submit}</div>
//                 )}

//                 <form onSubmit={handleSubmit}>
//                     <div className={styles.formGroup}>
//                         <label htmlFor="username">Username:</label>
//                         <input
//                             type="text"
//                             id="username"
//                             name="username"
//                             value={formData.username}
//                             onChange={handleChange}
//                             placeholder="Enter your username"
//                             disabled={isLoading}
//                         />
//                         {errors.username && (
//                             <span className={styles.error}>{errors.username}</span>
//                         )}
//                     </div>

//                     <div className={styles.formGroup}>
//                         <label htmlFor="email">Email:</label>
//                         <input
//                             type="email"
//                             id="email"
//                             name="email"
//                             value={formData.email}
//                             onChange={handleChange}
//                             placeholder="Enter your email"
//                             disabled={isLoading}
//                         />
//                         {errors.email && (
//                             <span className={styles.error}>{errors.email}</span>
//                         )}
//                     </div>

//                     <div className={styles.formGroup}>
//                         <label htmlFor="password">Password:</label>
//                         <input
//                             type="password"
//                             id="password"
//                             name="password"
//                             value={formData.password}
//                             onChange={handleChange}
//                             placeholder="Enter your password (min 8 characters)"
//                             disabled={isLoading}
//                         />
//                         {errors.password && (
//                             <span className={styles.error}>{errors.password}</span>
//                         )}
//                     </div>

//                     <div className={styles.formGroup}>
//                         <label htmlFor="confirmPassword">Confirm Password:</label>
//                         <input
//                             type="password"
//                             id="confirmPassword"
//                             name="confirmPassword"
//                             value={formData.confirmPassword}
//                             onChange={handleChange}
//                             placeholder="Confirm your password"
//                             disabled={isLoading}
//                         />
//                         {errors.confirmPassword && (
//                             <span className={styles.error}>{errors.confirmPassword}</span>
//                         )}
//                     </div>

//                     <div className={styles.buttonContainer}>
//                         <button
//                             type="submit"
//                             disabled={isLoading}
//                             className={styles.submitButton}
//                         >
//                             {isLoading ? 'Registering...' : 'Register'}
//                         </button>
//                         <button
//                             type="button"
//                             onClick={onClose}
//                             disabled={isLoading}
//                             className={styles.cancelButton}
//                         >
//                             Cancel
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// }

// export default RegisterForm;

import React, { useState } from 'react';
import styles from '../styles/RegisterForm.module.css';
import { useAuth } from '../context/AuthContext';
import VerifyEmailForm from './VerifyEmailForm';

function RegisterForm({ onClose, onSuccess }) {
    // Додаємо стейт для контролю кроку
    const [step, setStep] = useState(1);
    const [verificationCode, setVerificationCode] = useState('');

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Достаємо новий метод з контексту
    const { register, verifyEmail } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        // ... ваш старий код validateForm без змін ...
        const newErrors = {};
        if (!formData.username.trim()) newErrors.username = 'Username is required';
        else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters';
        else if (formData.username.length > 50) newErrors.username = 'Username must be less than 50 characters';

        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';

        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';

        if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
        else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Обробка Кроку 1
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        setSuccessMessage('');
        setErrors({});

        const result = await register(
            formData.username,
            formData.email,
            formData.password,
            formData.confirmPassword
        );

        setIsLoading(false);

        if (result.success) {
            // Перемикаємо на форму вводу коду
            setStep(2);
            setSuccessMessage(result.message || 'Code sent to your email!');
        } else {
            setErrors({ submit: result.message });
        }
    };

    // Обробка Кроку 2
    const handleVerifySubmit = async (e) => {
        e.preventDefault();

        if (!verificationCode.trim()) {
            setErrors({ submit: 'Please enter the verification code' });
            return;
        }

        setIsLoading(true);
        setErrors({});

        const result = await verifyEmail(formData.email, verificationCode);

        setIsLoading(false);

        if (result.success) {
            setSuccessMessage('Registration completed successfully! Redirecting...');
            setTimeout(() => {
                if (onSuccess) onSuccess(result);
            }, 1500);
        } else {
            setErrors({ submit: result.message });
        }
    };

    return (
        <div className={styles.registerFormContainer}>
            <div className={styles.registerFormContent}>

                {/* Рендеримо заголовок залежно від кроку */}
                <h2>{step === 1 ? 'Create Account' : 'Verify Email'}</h2>

                {successMessage && (
                    <div className={styles.successMessage}>{successMessage}</div>
                )}

                {errors.submit && (
                    <div className={styles.errorMessage}>{errors.submit}</div>
                )}

                {/* КРОК 1: Форма реєстрації */}
                {step === 1 && (
                    <form onSubmit={handleRegisterSubmit}>
                        <div className={styles.formGroup}>
                            <label htmlFor="username">Username:</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Enter your username"
                                disabled={isLoading}
                            />
                            {errors.username && <span className={styles.error}>{errors.username}</span>}
                        </div>

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
                            {errors.email && <span className={styles.error}>{errors.email}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="password">Password:</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password (min 8 characters)"
                                disabled={isLoading}
                            />
                            {errors.password && <span className={styles.error}>{errors.password}</span>}
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="confirmPassword">Confirm Password:</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                disabled={isLoading}
                            />
                            {errors.confirmPassword && <span className={styles.error}>{errors.confirmPassword}</span>}
                        </div>

                        <div className={styles.buttonContainer}>
                            <button type="submit" disabled={isLoading} className={styles.submitButton}>
                                {isLoading ? 'Registering...' : 'Register'}
                            </button>
                            <button type="button" onClick={onClose} disabled={isLoading} className={styles.cancelButton}>
                                Cancel
                            </button>
                        </div>
                    </form>
                )}

                {/* КРОК 2: Форма підтвердження */}
                {step === 2 && (
                    <VerifyEmailForm
                        email={formData.email}
                        isLoading={isLoading}
                        error={errors.submit}
                        onVerify={handleVerifySubmit} // Передайте сюди вашу функцію з батьківського компонента
                        onBack={() => setStep(1)}
                    />
                )}
            </div>
        </div>
    );
}

export default RegisterForm;
