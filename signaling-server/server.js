const { Server } = require("socket.io");

function createSignalingServer(port = 3001) {
  const io = new Server(port, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const isTest = process.env.NODE_ENV === "test";
  const log = (...args) => {
    if (!isTest) console.log(...args);
  };

  log(`🚀 WebRTC Signaling Server started on port ${port}`);

  // Store active rooms and participants
  const rooms = new Map();

  io.on("connection", (socket) => {
    log(`✅ Client connected: ${socket.id}`);

    // Join a hearing room
    socket.on("join-room", (roomId, userId, userName) => {
      log(`👤 User ${userName} (${userId}) joining room ${roomId}`);

      socket.join(roomId);

      // Track room participants
      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId).add(socket.id);

      // Notify others in the room
      socket.to(roomId).emit("user-connected", userId, userName);

      // Send list of existing participants to the new user
      const participants = Array.from(rooms.get(roomId)).filter(
        (id) => id !== socket.id,
      );
      socket.emit("existing-participants", participants);

      log(`📊 Room ${roomId} now has ${rooms.get(roomId).size} participants`);
    });

    // Handle WebRTC signaling (offer/answer/ICE candidates)
    socket.on("signal", (data) => {
      log(`📡 Relaying signal from ${socket.id} to ${data.to}`);
      io.to(data.to).emit("signal", {
        signal: data.signal,
        from: socket.id,
        userName: data.userName,
      });
    });

    // Handle participant leaving
    socket.on("leave-room", (roomId) => {
      log(`👋 Client ${socket.id} leaving room ${roomId}`);
      handleLeaveRoom(socket, roomId);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      log(`❌ Client disconnected: ${socket.id}`);

      // Remove from all rooms
      rooms.forEach((participants, roomId) => {
        if (participants.has(socket.id)) {
          handleLeaveRoom(socket, roomId);
        }
      });
    });

    // Mute/unmute events
    socket.on("toggle-audio", (roomId, isAudioOn) => {
      socket.to(roomId).emit("user-audio-toggle", socket.id, isAudioOn);
    });

    socket.on("toggle-video", (roomId, isVideoOn) => {
      socket.to(roomId).emit("user-video-toggle", socket.id, isVideoOn);
    });
  });

  function handleLeaveRoom(socket, roomId) {
    if (rooms.has(roomId)) {
      rooms.get(roomId).delete(socket.id);

      // Clean up empty rooms
      if (rooms.get(roomId).size === 0) {
        rooms.delete(roomId);
        log(`🗑️  Room ${roomId} deleted (empty)`);
      } else {
        // Notify others
        socket.to(roomId).emit("user-disconnected", socket.id);
        log(`📊 Room ${roomId} now has ${rooms.get(roomId).size} participants`);
      }
    }

    socket.leave(roomId);
  }

  return {
    io,
    close: (cb) => io.close(cb),
  };
}

// If run directly, start the server. Otherwise export factory for tests.
if (require.main === module) {
  const srv = createSignalingServer(3001);
  // Graceful shutdown
  process.on("SIGINT", () => {
    console.log("\n🛑 Shutting down signaling server...");
    srv.close(() => {
      console.log("👋 Server closed");
      process.exit(0);
    });
  });
  module.exports = srv;
} else {
  module.exports = createSignalingServer;
}
