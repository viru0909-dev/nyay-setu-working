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
    connect(token) {
        // Skip if already connected, connecting, or permanently failed
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return;
        }
        if (this.isConnecting || this.connectionFailed) {
            return;
        }
        if (!token || token === 'null' || token === 'undefined') {
            return;
        }

        const isProduction = !window.location.hostname.includes('localhost');

        try {
            const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            const host = new URL(this.API_BASE_URL).host;
            
            // Secure URL without query parameters
            const wsUrl = `${protocol}//${host}/api/ws/notifications`;

            this.isConnecting = true;

            // Merged environment log routing rules - CONFLICT 1 RESOLVED
            if (!isProduction) {
                if (import.meta.env.DEV) {
                    console.log('Connecting to WebSocket:', wsUrl);
                }
            }

            this.ws = new WebSocket(wsUrl);

            // In-band Authentication frame payload dispatch - CONFLICT 2 RESOLVED
            this.ws.onopen = () => {
                if (!isProduction) {
                    if (import.meta.env.DEV) {
                        console.log('✅ WebSocket connected');
                    }
                }
                this.reconnectAttempts = 0;
                this.isConnecting = false;
                
                // Securely transmit token in the body frame immediately on open
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
                
                // Code 1008 means server sandbox kicked the connection due to auth timeout/failure
                if (event.code === 1008) {
                    this.connectionFailed = true;
                    return;
                }

                if (!this.connectionFailed) {
                    this.attemptReconnect(token);
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
    attemptReconnect(token) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

            setTimeout(() => {
                this.connect(token);
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