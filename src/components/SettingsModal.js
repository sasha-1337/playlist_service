// import React, { useState, useEffect } from 'react';
// import { MdClose } from 'react-icons/md';
// import { useAuth } from '../context/AuthContext';
// import ChangePasswordForm from './ChangePasswordForm';
// import DeleteAccountConfirm from './DeleteAccountConfirm';
// import styles from '../styles/SettingsModal.module.css';

// const SettingsModal = ({ onClose }) => {
//     const { currentUser, logout } = useAuth();
//     const [activeTab, setActiveTab] = useState('account');
//     const [showChangePassword, setShowChangePassword] = useState(false);
//     const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

//     // Скидаємо відкриті форми при перемиканні вкладок
//     useEffect(() => {
//         setShowChangePassword(false);
//         setShowDeleteConfirm(false);
//     }, [activeTab]);

//     const formatDate = (dateString) => {
//         if (!dateString) return 'Невідомо';
//         try {
//             const date = new Date(dateString);
//             return date.toLocaleDateString('uk-UA', {
//                 year: 'numeric',
//                 month: 'long',
//                 day: 'numeric',
//             });
//         } catch (error) {
//             return dateString;
//         }
//     };

//     const handlePasswordChangeSuccess = () => {
//         setShowChangePassword(false);
//     };

//     const handleDeleteSuccess = async () => {
//         await logout();
//         onClose();
//     };

//     return (
//         <div className={styles.modalOverlay} onClick={onClose}>
//             <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
//                 {/* Header */}
//                 <div className={styles.modalHeader}>
//                     <h2>Налаштування</h2>
//                     <button
//                         className={styles.closeButton}
//                         onClick={onClose}
//                         title="Закрити"
//                     >
//                         <MdClose />
//                     </button>
//                 </div>

//                 {/* Tabs */}
//                 <div className={styles.tabsContainer}>
//                     <button
//                         className={`${styles.tab} ${activeTab === 'account' ? styles.activeTab : ''}`}
//                         onClick={() => setActiveTab('account')}
//                     >
//                         Аккаунт
//                     </button>
//                     <button
//                         className={`${styles.tab} ${activeTab === 'security' ? styles.activeTab : ''}`}
//                         onClick={() => setActiveTab('security')}
//                     >
//                         Безпека
//                     </button>
//                 </div>

//                 {/* Content */}
//                 <div className={styles.content}>
//                     {/* Account Tab */}
//                     {activeTab === 'account' && (
//                         <div className={styles.tabContent}>
//                             <h3>Інформація про аккаунт</h3>

//                             <div className={styles.infoGroup}>
//                                 <label>ID користувача</label>
//                                 <div className={styles.infoValue}>
//                                     {currentUser?.id || currentUser?._id || 'Невідомо'}
//                                 </div>
//                             </div>

//                             <div className={styles.infoGroup}>
//                                 <label>Ім'я користувача</label>
//                                 <div className={styles.infoValue}>
//                                     {currentUser?.username || 'Невідомо'}
//                                 </div>
//                             </div>

//                             <div className={styles.infoGroup}>
//                                 <label>E-mail</label>
//                                 <div className={styles.infoValue}>
//                                     {currentUser?.email || 'Невідомо'}
//                                 </div>
//                             </div>

//                             <div className={styles.infoGroup}>
//                                 <label>Дата створення аккаунту</label>
//                                 <div className={styles.infoValue}>
//                                     {formatDate(currentUser?.createdAt)}
//                                 </div>
//                             </div>
//                         </div>
//                     )}

//                     {/* Security Tab */}
//                     {activeTab === 'security' && (
//                         <div className={styles.tabContent}>
//                             <h3>Безпека аккаунту</h3>

//                             {!showChangePassword && !showDeleteConfirm && (
//                                 <div className={styles.actionButtonsContainer}>
//                                     <button
//                                         className={styles.actionButton}
//                                         onClick={() => setShowChangePassword(true)}
//                                     >
//                                         Змінити пароль
//                                     </button>

//                                     <button
//                                         className={`${styles.actionButton} ${styles.dangerButton}`}
//                                         onClick={() => setShowDeleteConfirm(true)}
//                                     >
//                                         Видалити аккаунт
//                                     </button>
//                                 </div>
//                             )}

//                             {showChangePassword && (
//                                 <ChangePasswordForm
//                                     onCancel={() => setShowChangePassword(false)}
//                                     onSuccess={handlePasswordChangeSuccess}
//                                 />
//                             )}

//                             {showDeleteConfirm && (
//                                 <DeleteAccountConfirm
//                                     onCancel={() => setShowDeleteConfirm(false)}
//                                     onSuccess={handleDeleteSuccess}
//                                 />
//                             )}
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default SettingsModal;


import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MdClose } from 'react-icons/md';
import { useCurrentUser, useAppDispatch } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import ChangePasswordForm from '../forms/ChangePasswordForm';
import DeleteAccountConfirm from '../forms/DeleteAccountForm';
import styles from '../styles/SettingsModal.module.css';

const SettingsModal = ({ onClose }) => {
    const currentUser = useCurrentUser();
    const dispatch = useAppDispatch();
    const [activeTab, setActiveTab] = useState('account');
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Скидаємо відкриті форми при перемиканні вкладок
    useEffect(() => {
        setShowChangePassword(false);
        setShowDeleteConfirm(false);
    }, [activeTab]);

    // Закриваємо по Escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const formatDate = (dateString) => {
        if (!dateString) return 'Невідомо';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('uk-UA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch (error) {
            return dateString;
        }
    };

    const handlePasswordChangeSuccess = () => {
        setShowChangePassword(false);
    };

    const handleDeleteSuccess = async () => {
        await dispatch(logout());
        onClose();
    };

    const modalContent = (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className={styles.modalHeader}>
                    <h2>Налаштування</h2>
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                        title="Закрити"
                    >
                        <MdClose />
                    </button>
                </div>

                {/* Tabs */}
                <div className={styles.tabsContainer}>
                    <button
                        className={`${styles.tab} ${activeTab === 'account' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('account')}
                    >
                        Акаунт
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'security' ? styles.activeTab : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        Безпека
                    </button>
                </div>

                {/* Content */}
                <div className={styles.content}>
                    {/* Account Tab */}
                    {activeTab === 'account' && (
                        <div className={styles.tabContent}>
                            <h3>Інформація про акаунт</h3>

                            <div className={styles.infoGroup}>
                                <label>ID користувача</label>
                                <div className={styles.infoValue}>
                                    {currentUser?.id || currentUser?._id || 'Невідомо'}
                                </div>
                            </div>

                            <div className={styles.infoGroup}>
                                <label>Ім'я користувача</label>
                                <div className={styles.infoValue}>
                                    {currentUser?.username || 'Невідомо'}
                                </div>
                            </div>

                            <div className={styles.infoGroup}>
                                <label>E-mail</label>
                                <div className={styles.infoValue}>
                                    {currentUser?.email || 'Невідомо'}
                                </div>
                            </div>

                            <div className={styles.infoGroup}>
                                <label>Дата створення акаунту</label>
                                <div className={styles.infoValue}>
                                    {formatDate(currentUser?.createdAt)}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className={styles.tabContent}>
                            <h3>Безпека акаунту</h3>

                            {!showChangePassword && !showDeleteConfirm && (
                                <div className={styles.actionButtonsContainer}>
                                    <button
                                        className={styles.actionButton}
                                        onClick={() => setShowChangePassword(true)}
                                    >
                                        Змінити пароль
                                    </button>

                                    <button
                                        className={`${styles.actionButton} ${styles.dangerButton}`}
                                        onClick={() => setShowDeleteConfirm(true)}
                                    >
                                        Видалити акаунт
                                    </button>
                                </div>
                            )}

                            {showChangePassword && (
                                <ChangePasswordForm
                                    onCancel={() => setShowChangePassword(false)}
                                    onSuccess={handlePasswordChangeSuccess}
                                />
                            )}

                            {showDeleteConfirm && (
                                <DeleteAccountConfirm
                                    onCancel={() => setShowDeleteConfirm(false)}
                                    onSuccess={handleDeleteSuccess}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

export default SettingsModal;