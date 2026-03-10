import React, { useEffect } from 'react';
import './Notification.css';

const Notification = ({ message, type = 'success', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div className="notification-overlay">
            <div className={`notification-popup ${type}`}>
                <div className="notification-icon">
                    {type === 'success' ? (
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                            <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    ) : type === 'error' ? (
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                            <path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    ) : (
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                            <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    )}
                </div>
                <div className="notification-message">{message}</div>
                <button className="notification-close" onClick={onClose}>×</button>
            </div>
        </div>
    );
};

export default Notification;
