const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

console.log("🚀 Signaling Server starting...");

io.on("connection", (socket) => {
  console.log(`✅ User Connected: ${socket.id}`);

  // 1. Join a Class Room (Match Flutter 'join_room')
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  // 2. Ready Signal (Added to trigger the handshake)
  socket.on("ready", (roomId) => {
    console.log(`🚀 Room ${roomId} is ready for video`);
    socket.to(roomId).emit("ready");
  });

  // 3. Chat Messages
  socket.on("chat_message", (data) => {
    console.log(`📩 Message in ${data.room}: ${data.message}`);
    socket.to(data.room).emit("chat_message", data);
  });

  // 4. WebRTC Signaling (Matches Flutter 'offer' and 'answer')
  socket.on("offer", (data) => {
    console.log("📡 Offer received");
    socket.to(data.roomId).emit("offer", data);
  });

  socket.on("answer", (data) => {
    console.log("📡 Answer received");
    socket.to(data.roomId).emit("answer", data);
  });

  // 5. ICE Candidate (Fixed name to 'ice_candidate' to match Flutter)
  socket.on("ice_candidate", (data) => {
    socket.to(data.roomId).emit("ice_candidate", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ User Disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
