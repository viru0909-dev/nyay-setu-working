import axios from 'axios';

class NotificationService {
    constructor() {
        this.ws = null;
        this.listeners = [];
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
    }

    /**
     * Connects to the WebSocket for real-time notifications
     */
    connect(token) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            return; // Already connected
        }

        // Use standard WebSocket URL
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = new URL(this.API_BASE_URL).host;
        const wsUrl = `${protocol}//${host}/api/ws/notifications?token=${token}`;

        try {
            console.log('Connecting to WebSocket:', wsUrl);
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('✅ WebSocket connected');
                this.reconnectAttempts = 0;
            };

            this.ws.onmessage = (event) => {
                try {
                    const notification = JSON.parse(event.data);
                    this.notifyListeners(notification);
                } catch (error) {
                    console.error('Failed to parse notification:', error);
                }
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            this.ws.onclose = () => {
                console.log('WebSocket disconnected');
                this.attemptReconnect(token);
            };
        } catch (error) {
            console.error('Failed to create WebSocket:', error);
        }
    }

    /**
     * Reconnection logic with exponential backoff
     */
    attemptReconnect(token) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
            console.log(`Reconnecting in ${delay}ms... (attempt ${this.reconnectAttempts})`);

            setTimeout(() => {
                this.connect(token);
            }, delay);
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
                console.error('Listener error:', error);
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
    }

    // --- REST API Methods ---

    /**
     * Fetch past notifications for the user
     */
    async fetchNotifications(userId) {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${this.API_BASE_URL}/api/notifications/user/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            return [];
        }
    }

    /**
     * Mark a notification as read
     */
    async markRead(id) {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${this.API_BASE_URL}/api/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    }
}

export default new NotificationService();
