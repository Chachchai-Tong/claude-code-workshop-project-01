const express = require("express");
const cors = require("cors");
const http = require("http");
const { WebSocketServer } = require("ws");

const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const { errorHandler } = require("./utils/errors");
const { handleConnection } = require("./handlers/websocketHandler");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/users", userRoutes);
app.use("/auth", authRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// Error handler
app.use(errorHandler);

// Create HTTP + WebSocket server
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws, req) => {
  handleConnection(ws, req);
});

// Start server (only when run directly, not in tests)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`WebSocket available at ws://localhost:${PORT}/ws`);
  });
}

module.exports = { app, server, wss };
