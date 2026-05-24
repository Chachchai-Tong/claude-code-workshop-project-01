const { v4: uuidv4 } = require("uuid");

/**
 * WebSocket Connection Handler
 *
 * 🐛 BUG 3 (Hard): Memory leak — when a client disconnects, the connection
 *    object is NOT removed from the connections Map. Over time, this causes
 *    memory to grow unboundedly as disconnected clients pile up.
 *
 *    Missing: ws.on('close', ...) and ws.on('error', ...) handlers
 *    that call connections.delete(id).
 */

const connections = new Map();

function handleConnection(ws, req) {
  const id = uuidv4();
  const connectionInfo = {
    id,
    ws,
    user: req.user || { id: "anonymous" },
    connectedAt: new Date().toISOString(),
  };

  connections.set(id, connectionInfo);

  ws.on("message", (raw) => {
    try {
      const message = JSON.parse(raw.toString());
      handleMessage(id, message);
    } catch (err) {
      ws.send(JSON.stringify({ error: "Invalid message format" }));
    }
  });

  ws.on("close", () => {
    connections.delete(id);
  });

  ws.on("error", () => {
    connections.delete(id);
  });

  ws.send(
    JSON.stringify({
      type: "connected",
      connectionId: id,
      message: "Welcome to the workshop WebSocket server!",
    })
  );
}

function handleMessage(connectionId, message) {
  const conn = connections.get(connectionId);
  if (!conn) return;

  switch (message.type) {
    case "broadcast":
      broadcastMessage(connectionId, message.content);
      break;
    case "ping":
      conn.ws.send(JSON.stringify({ type: "pong", timestamp: Date.now() }));
      break;
    default:
      conn.ws.send(JSON.stringify({ type: "echo", data: message }));
  }
}

function broadcastMessage(senderId, content) {
  for (const [id, conn] of connections) {
    if (id !== senderId && conn.ws.readyState === 1) {
      conn.ws.send(
        JSON.stringify({
          type: "broadcast",
          from: senderId,
          content,
          timestamp: Date.now(),
        })
      );
    }
  }
}

function getConnectionCount() {
  return connections.size;
}

function getConnections() {
  return connections;
}

module.exports = {
  handleConnection,
  getConnectionCount,
  getConnections,
  connections,
};
