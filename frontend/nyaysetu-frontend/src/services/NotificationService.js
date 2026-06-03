import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

class NotificationService {
    constructor() {
        this.ws = null;
        this.listeners = [];
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 3;
        this.API_BASE_URL = API_BASE_URL;
        this.isConnecting = false;
        this.connectionFailed = false;
    }

    /**
     * Connects to the WebSocket for real-time notifications securely
     */
    connect() {
        // Skip if already connected, connecting, or permanently failed
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return;
        }
        if (this.isConnecting || this.connectionFailed) {
            return;
        }

        const isProduction = !window.location.hostname.includes('localhost');

        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const host = new URL(this.API_BASE_URL).host;
            
            // Secure URL without query parameters - cookies handled automatically by browser
            const wsUrl = `${protocol}//${host}/api/ws/notifications`;

            this.isConnecting = true;

            if (import.meta.env.DEV) {
                console.log('Connecting to WebSocket:', wsUrl);
            }

            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                if (import.meta.env.DEV) {
                    console.log('✅ WebSocket connected');
                }
                this.reconnectAttempts = 0;
                this.isConnecting = false;
                
                // No manual AUTH frame needed - backend handles cookie-based auth in handshake
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
                
                // Code 1008 means server sandbox kicked the connection due to auth timeout/failure
                if (event.code === 1008) {
                    this.connectionFailed = true;
                    return;
                }

                if (!this.connectionFailed) {
                    this.attemptReconnect();
                }
            };
        } catch (error) {
            this.isConnecting = false;
            this.connectionFailed = true;
        }
    }

    /**
     * Reconnection logic with exponential backoff
     */
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

            setTimeout(() => {
                this.connect();
            }, delay);
        } else {
            this.connectionFailed = true;
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

    // --- REST API Methods ---

    async fetchNotifications(userId) {
        try {
            const response = await axios.get(`${this.API_BASE_URL}/api/notifications/user/${userId}`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            return [];
        }
    }

    async markRead(id) {
        try {
            await axios.post(`${this.API_BASE_URL}/api/notifications/${id}/read`, {}, {
                withCredentials: true
            });
        } catch (error) {
            // Suppress error responses
        }
    }
}

export default new NotificationService();