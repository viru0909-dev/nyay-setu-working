import { useEffect, useState } from 'react';
import { db } from '../db/offlineDB';

export function useOfflineSync() {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = async () => {
            setIsOffline(false);
            console.log('App is online. Attempting to sync offline data...');
            
            try {
                // Fetch all unsynced outbox items
                const unsyncedItems = await db.outbox.toArray();
                
                if (unsyncedItems.length > 0) {
                    for (const item of unsyncedItems) {
                        try {
                            // Re-attempt the fetch request
                            await fetch(item.url, {
                                method: item.method,
                                headers: { 'Content-Type': 'application/json' },
                                body: item.payload
                            });
                            
                            // Remove from IndexedDB on success
                            await db.outbox.delete(item.id);
                        } catch (err) {
                            console.error('Failed to sync item:', item, err);
                        }
                    }
                    console.log('Sync completed.');
                }
            } catch (err) {
                console.error('Error accessing IndexedDB for sync:', err);
            }
        };

        const handleOffline = () => {
            setIsOffline(true);
            console.warn('App is offline. Data will be saved locally using IndexedDB.');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return { isOffline };
}
