/**
 * PWA Helper Utilities
 * Functions to support Progressive Web App features
 */

/**
 * Check if the app is running as an installed PWA
 */
export const isPWAInstalled = () => {
    // Check if running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
        return true;
    }
    // Check for iOS standalone mode
    if (window.navigator.standalone === true) {
        return true;
    }
    // Check if launched from home screen
    if (document.referrer.includes('android-app://')) {
        return true;
    }
    return false;
};

/**
 * Check if the browser is online
 */
export const isOnline = () => {
    return navigator.onLine;
};

/**
 * Get storage usage information
 */
export const getStorageUsage = async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
            const estimate = await navigator.storage.estimate();
            const usage = estimate.usage || 0;
            const quota = estimate.quota || 0;
            const percentUsed = quota > 0 ? (usage / quota) * 100 : 0;

            return {
                usage, // bytes used
                quota, // total bytes available
                percentUsed, // percentage used
                usageMB: (usage / (1024 * 1024)).toFixed(2), // MB used
                quotaMB: (quota / (1024 * 1024)).toFixed(2), // MB available
            };
        } catch (error) {
            console.error('Error getting storage estimate:', error);
            return null;
        }
    }
    return null;
};

/**
 * Clear all service worker caches
 */
export const clearAllCaches = async () => {
    if ('caches' in window) {
        try {
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames.map(cacheName => caches.delete(cacheName))
            );
            console.log('All caches cleared successfully');
            return true;
        } catch (error) {
            console.error('Error clearing caches:', error);
            return false;
        }
    }
    return false;
};

/**
 * Request notification permissions
 */
export const registerForNotifications = async () => {
    if (!('Notification' in window)) {
        console.warn('This browser does not support notifications');
        return 'unsupported';
    }

    if (Notification.permission === 'granted') {
        return 'granted';
    }

    if (Notification.permission !== 'denied') {
        try {
            const permission = await Notification.requestPermission();
            return permission;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return 'denied';
        }
    }

    return Notification.permission;
};

/**
 * Store an offline action to retry when online
 * Uses localStorage for simplicity
 */
export const queueOfflineAction = (action) => {
    try {
        const queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
        queue.push({
            ...action,
            timestamp: Date.now(),
        });
        localStorage.setItem('offlineQueue', JSON.stringify(queue));
        return true;
    } catch (error) {
        console.error('Error queuing offline action:', error);
        return false;
    }
};

/**
 * Get all queued offline actions
 */
export const getOfflineQueue = () => {
    try {
        return JSON.parse(localStorage.getItem('offlineQueue') || '[]');
    } catch (error) {
        console.error('Error getting offline queue:', error);
        return [];
    }
};

/**
 * Clear the offline action queue
 */
export const clearOfflineQueue = () => {
    try {
        localStorage.removeItem('offlineQueue');
        return true;
    } catch (error) {
        console.error('Error clearing offline queue:', error);
        return false;
    }
};

/**
 * Check if the app can be installed (installable PWA)
 */
export const canInstallPWA = () => {
    // This will be set by the beforeinstallprompt event
    return window.deferredPrompt !== undefined;
};

/**
 * Format bytes to human readable format
 */
export const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
