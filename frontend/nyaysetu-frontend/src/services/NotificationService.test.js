import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import axios from 'axios';
import NotificationService from './NotificationService';
import { API_BASE_URL } from '../config/apiConfig';

vi.mock('axios', () => ({
    default: {
        get: vi.fn(),
        post: vi.fn()
    }
}));

describe('NotificationService REST endpoints', () => {
    beforeEach(() => {
        const storage = new Map();
        vi.clearAllMocks();
        vi.stubGlobal('localStorage', {
            getItem: vi.fn((key) => storage.get(key) ?? null),
            setItem: vi.fn((key, value) => storage.set(key, value)),
            clear: vi.fn(() => storage.clear())
        });
        localStorage.setItem('token', 'test-token');
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('uses versioned notification endpoints for fetch and mark-read calls', async () => {
        axios.get.mockResolvedValue({ data: [{ id: 7 }] });
        axios.post.mockResolvedValue({});

        await NotificationService.fetchNotifications(42);
        await NotificationService.markRead(7);

        expect(axios.get).toHaveBeenCalledWith(
            `${API_BASE_URL}/api/v1/notifications/user/42`,
            { headers: { Authorization: 'Bearer test-token' } }
        );
        expect(axios.post).toHaveBeenCalledWith(
            `${API_BASE_URL}/api/v1/notifications/7/read`,
            {},
            { headers: { Authorization: 'Bearer test-token' } }
        );
    });
});
