const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const PORT = Number.parseInt(process.env.SIGNALING_PORT || '3001', 10);
const CORS_ORIGIN = process.env.SIGNALING_CORS_ORIGIN || 'http://localhost:5173';
const DEFAULT_JWT_SECRET = 'nyaysetu-2024-secure-jwt-signing-key-minimum-256-bits-required';
const JWT_SECRET = process.env.JWT_SECRET || DEFAULT_JWT_SECRET;
const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL; // e.g. http://localhost:8080

if (!process.env.JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET environment variable is required in production.');
    }
    console.warn('⚠️  JWT_SECRET is not set; using default dev secret. Set JWT_SECRET in your environment for a safer setup.');
}

// Create Socket.IO server
const io = new Server(PORT, {
    cors: {
        origin: CORS_ORIGIN,
        methods: ['GET', 'POST'],
        credentials: true
    }
});

console.log(`🚀 WebRTC Signaling Server started on port ${PORT}`);

// Store active rooms and participants
const rooms = new Map();
// Track which room a socket is currently in (single-room model)
const socketRooms = new Map();

function getBearerToken(socket) {
    // Preferred: socket.io auth payload
    const authToken = socket.handshake?.auth?.token;
    if (typeof authToken === 'string' && authToken.trim()) return authToken.trim();

    // Fallback: Authorization header
    const header = socket.handshake?.headers?.authorization || socket.handshake?.headers?.Authorization;
    if (typeof header === 'string') {
        const match = header.match(/^\s*Bearer\s+(.+)\s*$/i);
        if (match) return match[1].trim();
    }

    // Fallback: query param
    const queryToken = socket.handshake?.query?.token;
    if (typeof queryToken === 'string' && queryToken.trim()) return queryToken.trim();

    return null;
}

io.use((socket, next) => {
    try {
        const token = getBearerToken(socket);
        if (!token) return next(new Error('unauthorized'));

        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded?.sub || decoded?.userId || decoded?.id;
        if (!userId) return next(new Error('unauthorized'));

        socket.user = {
            userId: String(userId),
            token,
            claims: decoded
        };

        return next();
    } catch (err) {
        return next(new Error('unauthorized'));
    }
});

async function assertAuthorizedForRoom({ roomId, token }) {
    if (!BACKEND_BASE_URL) return;

    // Room authorization is enforced by backend policies (HearingController#join).
    // We call it here to ensure only hearing participants can join the signaling room.
    const url = `${BACKEND_BASE_URL.replace(/\/+$/, '')}/api/hearings/${roomId}/join`;

    if (typeof fetch !== 'function') {
        throw new Error('Global fetch is not available in this Node runtime. Set BACKEND_BASE_URL only when fetch is supported.');
    }

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });

    if (!res.ok) {
        throw new Error(`not_authorized_for_room:${res.status}`);
    }
}

io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id} (userId=${socket.user?.userId})`);

    // Join a hearing room
    socket.on('join-room', async (roomId, userId, userName) => {
        try {
            if (!roomId) return;

            // Enforce that the userId cannot be spoofed.
            const authedUserId = socket.user?.userId;
            if (!authedUserId) {
                socket.emit('error', 'unauthorized');
                return;
            }
            if (userId && String(userId) !== String(authedUserId)) {
                socket.emit('error', 'unauthorized');
                return;
            }

            // Optional: enforce room-level authorization via backend.
            await assertAuthorizedForRoom({ roomId, token: socket.user.token });

            console.log(`👤 User ${userName || ''} (${authedUserId}) joining room ${roomId}`);

            socket.join(roomId);
            socketRooms.set(socket.id, roomId);

            // Track room participants
            if (!rooms.has(roomId)) {
                rooms.set(roomId, new Set());
            }
            rooms.get(roomId).add(socket.id);

            // Notify others in the room
            socket.to(roomId).emit('user-connected', authedUserId, userName);

            // Send list of existing participants to the new user
            const participants = Array.from(rooms.get(roomId)).filter(id => id !== socket.id);
            socket.emit('existing-participants', participants);

            console.log(`📊 Room ${roomId} now has ${rooms.get(roomId).size} participants`);
        } catch (err) {
            socket.emit('error', 'not_authorized');
        }
    });

    // Handle WebRTC signaling (offer/answer/ICE candidates)
    socket.on('signal', (data) => {
        const fromRoom = socketRooms.get(socket.id);
        const toRoom = data?.to ? socketRooms.get(data.to) : null;

        // Only allow signaling within the same room.
        if (!fromRoom || !toRoom || fromRoom !== toRoom) {
            socket.emit('error', 'invalid_signal_target');
            return;
        }

        console.log(`📡 Relaying signal from ${socket.id} to ${data.to} (room=${fromRoom})`);
        io.to(data.to).emit('signal', {
            signal: data.signal,
            from: socket.id,
            userName: data.userName
        });
    });

    // Handle participant leaving
    socket.on('leave-room', (roomId) => {
        const actualRoom = socketRooms.get(socket.id) || roomId;
        if (!actualRoom) return;
        console.log(`👋 Client ${socket.id} leaving room ${actualRoom}`);
        handleLeaveRoom(socket, actualRoom);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);

        // Remove from all rooms
        rooms.forEach((participants, roomId) => {
            if (participants.has(socket.id)) {
                handleLeaveRoom(socket, roomId);
            }
        });
    });

    // Mute/unmute events
    socket.on('toggle-audio', (roomId, isAudioOn) => {
        const actualRoom = socketRooms.get(socket.id) || roomId;
        if (!actualRoom) return;
        socket.to(actualRoom).emit('user-audio-toggle', socket.id, isAudioOn);
    });

    socket.on('toggle-video', (roomId, isVideoOn) => {
        const actualRoom = socketRooms.get(socket.id) || roomId;
        if (!actualRoom) return;
        socket.to(actualRoom).emit('user-video-toggle', socket.id, isVideoOn);
    });
});

function handleLeaveRoom(socket, roomId) {
    socketRooms.delete(socket.id);
    if (rooms.has(roomId)) {
        rooms.get(roomId).delete(socket.id);

        // Clean up empty rooms
        if (rooms.get(roomId).size === 0) {
            rooms.delete(roomId);
            console.log(`🗑️  Room ${roomId} deleted (empty)`);
        } else {
            // Notify others
            socket.to(roomId).emit('user-disconnected', socket.id);
            console.log(`📊 Room ${roomId} now has ${rooms.get(roomId).size} participants`);
        }
    }

    socket.leave(roomId);
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down signaling server...');
    io.close(() => {
        console.log('👋 Server closed');
        process.exit(0);
    });
});
