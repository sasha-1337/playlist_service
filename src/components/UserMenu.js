import React, { useState, useRef, useEffect } from 'react';
import { MdLogout, MdSettings } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import SettingsModal from './SettingsModal';
import '../styles/UserMenu.css';

const UserMenu = () => {
    const { currentUser, logout } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const menuRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDropdownOpen]);

    const handleLogout = async () => {
        await logout();
        setIsDropdownOpen(false);
    };

    const handleSettings = () => {
        // Open settings modal
        setShowSettings(true);
        setIsDropdownOpen(false);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    return (
        <>
            <div className="user-menu-container" ref={menuRef}>
                {/* Trigger button with user initial or icon */}
                <button
                    className="user-menu-trigger"
                    onClick={toggleDropdown}
                    title={currentUser?.username || 'User'}
                >
                    <span className="user-initial">
                        {currentUser?.username?.charAt(0).toUpperCase() || 'U' }
                    </span>
                </button>

                {/* Dropdown menu */}
                {isDropdownOpen && (
                    <div className="user-menu-dropdown">
                        {/* User email display */}
                        <div className="menu-header">
                            <div className="user-email">
                                {currentUser?.email || 'user@example.com'}
                            </div>
                        </div>

                        <div className="menu-divider"></div>

                        {/* Settings button */}
                        <button
                            className="menu-item settings-item"
                            onClick={handleSettings}
                        >
                            <MdSettings className="menu-icon" />
                            <span>Налаштування</span>
                        </button>

                        <div className="menu-divider"></div>

                        {/* Logout button */}
                        <button
                            className="menu-item logout-item"
                            onClick={handleLogout}
                        >
                            <MdLogout className="menu-icon" />
                            <span>Вийти</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Settings Modal */}
            {showSettings && (
                <SettingsModal onClose={() => setShowSettings(false)} />
            )}
        </>
    );
};

export default UserMenu;
