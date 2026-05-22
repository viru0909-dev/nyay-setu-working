import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

class NotificationService {
    constructor() {
        this.token = token;
        this.ws = null;
        this.listeners = [];
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 3;
        this.API_BASE_URL = API_BASE_URL;
        this.isConnecting = false;
        this.connectionFailed = false;
    }

    /**
     * Connects to the WebSocket for real-time notifications
     * Silently fails if WebSocket is not available
     */
    connect(token) {
        // Skip if already connected, connecting, or permanently failed
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return;
        }
        if (this.isConnecting || this.connectionFailed) {
            return;
        }

        // Detect production environment
        const isProduction = !window.location.hostname.includes('localhost');

        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const host = new URL(this.API_BASE_URL).host;
            const wsUrl = `${protocol}//${host}/api/ws/notifications?token=${token}`;

            this.isConnecting = true;

            // Only log in development
            if (!isProduction) {
                if (import.meta.env.DEV) {
                      console.log('Connecting to WebSocket:', wsUrl);
                  }
                
            }

            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                if (!isProduction) {
                   if (import.meta.env.DEV) {
                       console.log('✅ WebSocket connected');
                  }
                    
                }
                this.reconnectAttempts = 0;
                this.isConnecting = false;
                 // Notify all subscribers that connection is restored
                (this.statusListeners || []).forEach(cb => {
                    try {
                        cb('CONNECTED');
                    } catch (_) {}
                });
            };

            this.ws.onmessage = (event) => {
                try {
                    const notification = JSON.parse(event.data);
                    this.notifyListeners(notification);
                } catch (error) {
                    // Silent fail on parse errors
                }
            };

            this.ws.onerror = () => {
                // Suppress error logs
                this.isConnecting = false;
            };

            this.ws.onclose = () => {
                this.isConnecting = false;

                // Notify subscribers that reconnecting has started
                (this.statusListeners || []).forEach(cb => {
                    try {
                        cb('RECONNECTING');
                    } catch (_) {}
                });

                if (!this.connectionFailed) {
                    this.attemptReconnect(token);
                }
            };
        } catch (error) {
            // Silent fail
            this.isConnecting = false;
            this.connectionFailed = true;
        }
    }

    /**
     * Reconnection logic with exponential backoff
     */
    attemptReconnect(token) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

            setTimeout(() => {
                this.connect(token);
            }, delay);
        } else {
            // Stop trying after max attempts
            this.connectionFailed = true;

            // Notify subscribers that connection is fully offline
            (this.statusListeners || []).forEach(cb => {
                try {
                    cb('OFFLINE');
                } catch (_) {}
            });
        }
    }

    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    notifyListeners(notification) {
        this.listeners.forEach(callback => {
            try {
                callback(notification);
            } catch (error) {
                // Silent fail
            }
        });
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.listeners = [];
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        this.connectionFailed = false;
    }

    subscribeToStatus(callback) {
        this.statusListeners = this.statusListeners || [];
        this.statusListeners.push(callback);
        callback(
            this.ws?.readyState === WebSocket.OPEN
                ? 'CONNECTED'
                : 'DISCONNECTED'
        );

        return () => {
            this.statusListeners =
                this.statusListeners.filter(cb => cb !== callback);
        };
    }

    reconnect() {
        this.connectionFailed = false;
        this.reconnectAttempts = 0;
        this.connect(this.token || localStorage.getItem('token'));
    }

    // --- REST API Methods ---

    async fetchNotifications(userId) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${this.API_BASE_URL}/api/notifications/user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            return [];
        }
    }

    async markRead(id) {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${this.API_BASE_URL}/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            // Silent fail
        }
    }
}

export default new NotificationService();
