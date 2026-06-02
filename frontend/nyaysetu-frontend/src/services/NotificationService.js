import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

class NotificationService {
    constructor() {
        this.ws = null;
        this.listeners = [];
        this.statusListeners = [];
        this.reconnectAttempts = 0;
        this.maxBackoffDelay = 30000;
        this.API_BASE_URL = API_BASE_URL;
        this.pingInterval = null;
        this.reconnectTimer = null;

        // Connection status: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'failed'
        this.status = 'disconnected';
    }

    getStatus() {
        return this.status;
    }

    subscribeToStatus(callback) {
        this.statusListeners.push(callback);
        return () => {
            this.statusListeners = this.statusListeners.filter(cb => cb !== callback);
        };
    }

    _setStatus(newStatus) {
        if (this.status === newStatus) return;
        this.status = newStatus;
        this.statusListeners.forEach(cb => {
            try { cb(newStatus); } catch (e) { /* silent */ }
        });
    }

    _startHeartbeat() {
        this._stopHeartbeat();
        this.pingInterval = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                try {
                    this.ws.send('ping');
                } catch (e) {
                    // Connection likely died; onclose will clean up
                }
            }
        }, 30000);
    }

    _stopHeartbeat() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
    }

    _clearReconnectTimer() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    connect(token) {
        // Skip if already connected
        if (this.ws && this.ws.readyState === WebSocket.OPEN) return;
        if (this.status === 'connecting') return;
        if (!token || token === 'null' || token === 'undefined') return;

        const isProduction = !window.location.hostname.includes('localhost');

        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const host = new URL(this.API_BASE_URL).host;

            const wsUrl = `${protocol}//${host}/api/ws/notifications`;

            this._setStatus('connecting');

            if (!isProduction && import.meta.env.DEV) {
                console.log('Connecting to WebSocket:', wsUrl);
            }

            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                this.reconnectAttempts = 0;
                this._setStatus('connected');
                this._startHeartbeat();

                if (!isProduction && import.meta.env.DEV) {
                    console.log('WebSocket connected');
                }

                this.ws.send(JSON.stringify({
                    type: 'AUTH',
                    token: token
                }));
            };

            this.ws.onmessage = (event) => {
                if (event.data === 'pong') return;
                try {
                    const message = JSON.parse(event.data);

                    if (message.type === 'AUTH_SUCCESS') {
                        if (!isProduction && import.meta.env.DEV) {
                            console.log('Notification WebSocket authenticated');
                        }
                        this.reconnectAttempts = 0;
                        return;
                    }

                    if (message.type === 'AUTH_ERROR') {
                        this._setStatus('failed');
                        this.disconnect();
                        return;
                    }

                    if (message.type === 'NOTIFICATION') {
                        this.notifyListeners(message.payload);
                        return;
                    }

                    this.notifyListeners(message);
                } catch (error) {
                    if (!isProduction && import.meta.env.DEV) {
                        console.warn('Invalid notification WebSocket message format received');
                    }
                }
            };

            this.ws.onerror = () => {
                // Suppress error logs; onclose will fire next
            };

            this.ws.onclose = (event) => {
                this._stopHeartbeat();
                this._setStatus('disconnected');
                this.ws = null;

                if (event.code === 1008) {
                    this._setStatus('failed');
                    return;
                }

                this._attemptReconnect();
            };
        } catch (error) {
            this._setStatus('failed');
        }
    }

    _attemptReconnect() {
        this._clearReconnectTimer();

        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), this.maxBackoffDelay);
        this.reconnectAttempts++;
        this._setStatus('reconnecting');

        this.reconnectTimer = setTimeout(() => {
            const token = localStorage.getItem('token');
            if (token) {
                this.connect(token);
            } else {
                this._setStatus('failed');
            }
        }, delay);
    }

    disconnect() {
        this._clearReconnectTimer();
        this._stopHeartbeat();
        if (this.ws) {
            this.ws.onclose = null;
            this.ws.close();
            this.ws = null;
        }
        this.reconnectAttempts = 0;
        this.listeners = [];
        this._setStatus('disconnected');
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
                // Silent catch to keep listener loops active
            }
        });
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
            // Suppress error responses
        }
    }
}

export default new NotificationService();
