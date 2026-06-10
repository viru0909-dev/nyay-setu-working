import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

class NotificationService {
    constructor() {
        this.ws = null;
        this.listeners = [];
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;
        this.API_BASE_URL = API_BASE_URL;
        this.isConnecting = false;
        this.connectionFailed = false;
    }

    /**
     * Connects to the WebSocket for real-time notifications securely
     */
    connect(token) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return;
        }
        if (this.isConnecting) {
            return;
        }
        if (!token || token === 'null' || token === 'undefined') {
            return;
        }

        const isProduction = !window.location.hostname.includes('localhost');

        try {
            const parsedUrl = new URL(this.API_BASE_URL);
            const protocol = parsedUrl.protocol === 'https:' ? 'wss:' : 'ws:';
            const wsUrl = `${protocol}//${parsedUrl.host}/api/ws/notifications`;

            this.isConnecting = true;
            this.connectionFailed = false;

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

                this.ws.send(JSON.stringify({
                    type: 'AUTH',
                    token: token
                }));
            };

            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);

                    if (message.type === 'AUTH_SUCCESS') {
                        if (!isProduction) {
                            if (import.meta.env.DEV) {
                                console.log('✅ Notification WebSocket authenticated');
                            }
                        }
                        this.reconnectAttempts = 0;
                        this.isConnecting = false;
                        this.connectionFailed = false;
                        return;
                    }

                    if (message.type === 'AUTH_ERROR') {
                        this.isConnecting = false;
                        this.connectionFailed = true;
                        this.disconnect();
                        return;
                    }

                    if (message.type === 'NOTIFICATION') {
                        this.notifyListeners(message.payload);
                        return;
                    }

                    this.notifyListeners(message);
                } catch (error) {
                    if (!isProduction) {
                        if (import.meta.env.DEV) {
                            console.warn('Invalid notification WebSocket message format received');
                        }
                    }
                }
            };

            this.ws.onerror = () => {
                this.isConnecting = false;
            };

            this.ws.onclose = (event) => {
                this.isConnecting = false;
                this.ws = null;

                if (event.code === 1008) {
                    this.connectionFailed = true;
                    return;
                }

                if (this.connectionFailed) {
                    return;
                }

                this.attemptReconnect(token);
            };
        } catch (error) {
            this.isConnecting = false;
            this.connectionFailed = false;
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
            this.reconnectAttempts = 0;
            setTimeout(() => {
                this.connect(token);
            }, 60000);
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
                // Silent catch to keep listener loops active
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

    resetConnection() {
        this.disconnect();
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