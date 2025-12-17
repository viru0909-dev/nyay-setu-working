import { useState, useEffect } from 'react';
import { Bell, X, Check } from 'lucide-react';
import NotificationService from '../services/NotificationService';

export default function NotificationBell() {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        // Subscribe to new notifications
        const unsubscribe = NotificationService.subscribe((notification) => {
            setNotifications(prev => [notification, ...prev]);
            if (!notification.read) {
                setUnreadCount(prev => prev + 1);
            }
        });

        return () => unsubscribe();
    }, []);

    const markAsRead = (id) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
        setUnreadCount(0);
    };

    const clearNotification = (id) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'relative',
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '0.75rem',
                    padding: '0.625rem',
                    cursor: 'pointer',
                    color: '#8b5cf6',
                    transition: 'all 0.2s'
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                }}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        background: '#ef4444',
                        color: 'white',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        border: '2px solid #0f172a'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.5rem)',
                    right: 0,
                    width: '380px',
                    maxHeight: '500px',
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    borderRadius: '1rem',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
                    zIndex: 1000,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '1rem 1.25rem',
                        borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <h3 style={{
                            color: 'white',
                            fontSize: '1.125rem',
                            fontWeight: '700',
                            margin: 0
                        }}>
                            Notifications
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#8b5cf6',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        maxHeight: '400px'
                    }}>
                        {notifications.length === 0 ? (
                            <div style={{
                                padding: '3rem 1.5rem',
                                textAlign: 'center',
                                color: '#64748b'
                            }}>
                                <Bell size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                                <p style={{ margin: 0 }}>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    style={{
                                        padding: '1rem 1.25rem',
                                        borderBottom: '1px solid rgba(139, 92, 246, 0.1)',
                                        background: notif.read ? 'transparent' : 'rgba(139, 92, 246, 0.05)',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                        display: 'flex',
                                        gap: '0.75rem'
                                    }}
                                    onClick={() => markAsRead(notif.id)}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.background = notif.read ? 'transparent' : 'rgba(139, 92, 246, 0.05)';
                                    }}
                                >
                                    {!notif.read && (
                                        <div style={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            background: '#8b5cf6',
                                            marginTop: '0.5rem',
                                            flexShrink: 0
                                        }} />
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <p style={{
                                            color: 'white',
                                            fontSize: '0.9rem',
                                            fontWeight: '500',
                                            margin: '0 0 0.25rem 0'
                                        }}>
                                            {notif.title}
                                        </p>
                                        <p style={{
                                            color: '#94a3b8',
                                            fontSize: '0.875rem',
                                            margin: '0 0 0.5rem 0'
                                        }}>
                                            {notif.message}
                                        </p>
                                        <span style={{
                                            color: '#64748b',
                                            fontSize: '0.75rem'
                                        }}>
                                            {notif.timestamp}
                                        </span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            clearNotification(notif.id);
                                        }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#64748b',
                                            cursor: 'pointer',
                                            padding: '0.25rem'
                                        }}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Click outside to close */}
            {isOpen && (
                <div
                    onClick={() => setIsOpen(false)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 999
                    }}
                />
            )}
        </div>
    );
}
