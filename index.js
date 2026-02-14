const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

// Initialize Socket.io with CORS enabled (allows all connections)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

console.log("🚀 Signaling Server starting...");

// --- MAIN CONNECTION BLOCK ---
io.on("connection", (socket) => {
  console.log(`✅ User Connected: ${socket.id}`);

  // 1. Join a Class Room
  socket.on("join_class", (classId) => {
    socket.join(classId);
    console.log(`User ${socket.id} joined class: ${classId}`);
  });

  // 2. Chat Messages (FIXED: Now inside the connection block)
  socket.on("chat_message", (data) => {
    console.log(`📩 Message in ${data.room}: ${data.message}`);
    // Send to everyone in the room EXCEPT the sender
    socket.to(data.room).emit("chat_message", data);
  });

  // 3. WebRTC Signaling (For Video Calls)
  socket.on("offer", (data) => {
    console.log("📡 Offer received");
    socket.to(data.room).emit("offer", data);
  });

  socket.on("answer", (data) => {
    console.log("📡 Answer received");
    socket.to(data.room).emit("answer", data);
  });

  socket.on("ice-candidate", (data) => {
    // console.log("❄️ ICE Candidate received"); // Uncomment to see all candidates
    socket.to(data.room).emit("ice-candidate", data);
  });

  // 4. Disconnect
  socket.on("disconnect", () => {
    console.log("❌ User Disconnected", socket.id);
  });
});

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`👉 Local: http://localhost:${PORT}`);
});