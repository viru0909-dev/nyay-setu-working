import { useState, useEffect, useRef } from 'react';
import { Bell, X, Check, CheckCheck, Loader2 } from 'lucide-react';
import NotificationService from '../services/NotificationService';
import useAuthStore from '../store/authStore';

export default function NotificationBell() {
    const { user } = useAuthStore();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Connect to WebSocket and fetch initial history
    useEffect(() => {
        if (!user) return;

        const token = localStorage.getItem('token');

        // 1. Fetch History
        const loadHistory = async () => {
            setLoading(true);
            try {
                const history = await NotificationService.fetchNotifications(user.id);
                // Sort by date descending
                const sorted = history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                setNotifications(sorted);
                setUnreadCount(sorted.filter(n => !n.read).length);
            } catch (err) {
                console.error("Failed to load notifications", err);
            } finally {
                setLoading(false);
            }
        };

        // 2. Connect WebSocket
        NotificationService.connect(token);
        loadHistory();

        // 3. Subscribe to new events
        const unsubscribe = NotificationService.subscribe((notification) => {
            // Check if duplicate
            setNotifications(prev => {
                const exists = prev.some(n => n.id === notification.id);
                if (exists) return prev;
                return [notification, ...prev];
            });
            // Increment unread count for new notifications
            setUnreadCount(prev => prev + 1);
        });

        return () => {
            unsubscribe();
            // Optimization: We don't disconnect immediately on unmount to keep connection alive during nav
        };
    }, [user]); // Removed unreadCount to prevent refetch loop

    const markAsRead = async (id) => {
        // Optimistic update
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));

        // API Call
        await NotificationService.markRead(id);
    };

    const markAllAsRead = async () => {
        // Optimistic update
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
        setUnreadCount(0);

        // Parallel API calls (ideally backend should support bulk read)
        unreadIds.forEach(id => NotificationService.markRead(id));
    };

    const clearNotification = (id) => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
    };

    // Helper for time ago
    const timeAgo = (dateStr) => {
        if (!dateStr) return 'Just now';
        const date = new Date(dateStr);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'relative',
                    background: isOpen ? 'rgba(139, 92, 246, 0.2)' : 'var(--bg-glass-strong)',
                    border: '1px solid var(--border-glass)',
                    borderRadius: '12px',
                    padding: '0.625rem',
                    cursor: 'pointer',
                    color: isOpen ? '#8b5cf6' : 'var(--text-secondary)',
                    transition: 'all 0.2s',
                    boxShadow: isOpen ? '0 0 0 2px rgba(139, 92, 246, 0.2)' : 'none'
                }}
                onMouseOver={(e) => {
                    if (!isOpen) e.currentTarget.style.color = 'var(--text-main)';
                }}
                onMouseOut={(e) => {
                    if (!isOpen) e.currentTarget.style.color = 'var(--text-secondary)';
                }}
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: 'white',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.65rem',
                        fontWeight: '800',
                        border: '2px solid var(--bg-main)',
                        boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.75rem)',
                    right: -50, // Slightly offset to align under user area
                    width: '380px',
                    maxHeight: '520px',
                    background: 'var(--bg-glass-strong)',
                    backdropFilter: 'var(--glass-blur)',
                    border: '1px solid var(--border-glass-strong)',
                    borderRadius: '1.25rem',
                    boxShadow: 'var(--shadow-glass-strong)',
                    zIndex: 1000,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    animation: 'slideDown 0.2s ease-out'
                }}>
                    {/* Header */}
                    <div style={{
                        padding: '1.25rem',
                        borderBottom: '1px solid var(--border-glass)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'var(--bg-glass)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <h3 style={{
                                color: 'var(--text-main)',
                                fontSize: '1rem',
                                fontWeight: '700',
                                margin: 0
                            }}>
                                Notifications
                            </h3>
                            {unreadCount > 0 && (
                                <span style={{
                                    background: 'rgba(139, 92, 246, 0.15)',
                                    color: '#8b5cf6',
                                    fontSize: '0.7rem',
                                    fontWeight: '800',
                                    padding: '0.15rem 0.5rem',
                                    borderRadius: '9999px'
                                }}>
                                    {unreadCount} NEW
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-secondary)',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    transition: 'color 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.color = '#8b5cf6'}
                                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                            >
                                <CheckCheck size={14} />
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        maxHeight: '400px',
                        padding: '0.5rem'
                    }}>
                        {loading && notifications.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                <Loader2 size={24} className="spin" style={{ margin: '0 auto 0.5rem' }} />
                                <span style={{ fontSize: '0.85rem' }}>Syncing...</span>
                                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } .spin { animation: spin 1s linear infinite; }`}</style>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div style={{
                                padding: '3rem 1.5rem',
                                textAlign: 'center',
                                color: 'var(--text-secondary)'
                            }}>
                                <div style={{
                                    width: '48px', height: '48px', margin: '0 auto 1rem',
                                    borderRadius: '50%', background: 'var(--bg-glass)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <Bell size={24} style={{ opacity: 0.4 }} />
                                </div>
                                <h4 style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', color: 'var(--text-main)' }}>All caught up!</h4>
                                <p style={{ margin: 0, fontSize: '0.8rem' }}>No new notifications for now.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                {notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        style={{
                                            padding: '1rem',
                                            borderRadius: '1rem',
                                            background: notif.read ? 'transparent' : 'var(--bg-glass)',
                                            border: notif.read ? '1px solid transparent' : '1px solid rgba(139, 92, 246, 0.1)',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            gap: '0.75rem',
                                            position: 'relative'
                                        }}
                                        onClick={() => markAsRead(notif.id)}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.background = 'var(--bg-glass-hover)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.background = notif.read ? 'transparent' : 'var(--bg-glass)';
                                        }}
                                    >
                                        {!notif.read && (
                                            <div style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                background: '#8b5cf6',
                                                marginTop: '0.5rem',
                                                flexShrink: 0,
                                                boxShadow: '0 0 8px rgba(139, 92, 246, 0.5)'
                                            }} />
                                        )}
                                        <div style={{ flex: 1, paddingRight: '1.5rem' }}>
                                            <p style={{
                                                color: 'var(--text-main)',
                                                fontSize: '0.9rem',
                                                fontWeight: notif.read ? '500' : '700',
                                                margin: '0 0 0.25rem 0',
                                                lineHeight: 1.4
                                            }}>
                                                {notif.title}
                                            </p>
                                            <p style={{
                                                color: 'var(--text-secondary)',
                                                fontSize: '0.8rem',
                                                margin: '0 0 0.5rem 0',
                                                lineHeight: 1.5
                                            }}>
                                                {notif.message}
                                            </p>
                                            <span style={{
                                                color: 'var(--text-tertiary)',
                                                fontSize: '0.7rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem'
                                            }}>
                                                {timeAgo(notif.timestamp)}
                                            </span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                clearNotification(notif.id);
                                            }}
                                            style={{
                                                position: 'absolute',
                                                top: '0.75rem',
                                                right: '0.75rem',
                                                background: 'none',
                                                border: 'none',
                                                color: 'var(--text-tertiary)',
                                                cursor: 'pointer',
                                                padding: '0.25rem',
                                                opacity: 0.5,
                                                transition: 'opacity 0.2s'
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                                            onMouseOut={(e) => e.currentTarget.style.opacity = 0.5}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Click outside and Overlay */}
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
            <style>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
