const EventEmitter = require("events");

// We test the handler logic directly (no network needed)
const {
  handleConnection,
  getConnectionCount,
  connections,
} = require("../src/handlers/websocketHandler");

// Mock WebSocket object
function createMockWs() {
  const ws = new EventEmitter();
  ws.readyState = 1; // OPEN
  ws.send = jest.fn();
  return ws;
}

beforeEach(() => {
  // Clear all connections before each test
  connections.clear();
});

// ============================================================
// WORKING TESTS — These should pass
// ============================================================

describe("WebSocket — Connection", () => {
  test("should register a new connection", () => {
    const ws = createMockWs();
    handleConnection(ws, { user: { id: "user-1" } });

    expect(getConnectionCount()).toBe(1);
    expect(ws.send).toHaveBeenCalledWith(
      expect.stringContaining('"type":"connected"')
    );
  });

  test("should handle multiple connections", () => {
    const ws1 = createMockWs();
    const ws2 = createMockWs();
    const ws3 = createMockWs();

    handleConnection(ws1, { user: { id: "user-1" } });
    handleConnection(ws2, { user: { id: "user-2" } });
    handleConnection(ws3, { user: { id: "user-3" } });

    expect(getConnectionCount()).toBe(3);
  });

  test("should echo messages back", () => {
    const ws = createMockWs();
    handleConnection(ws, { user: { id: "user-1" } });

    // Clear the "connected" message
    ws.send.mockClear();

    // Send a message
    ws.emit("message", Buffer.from(JSON.stringify({ type: "unknown", data: "hello" })));

    expect(ws.send).toHaveBeenCalledWith(
      expect.stringContaining('"type":"echo"')
    );
  });

  test("should respond to ping with pong", () => {
    const ws = createMockWs();
    handleConnection(ws, { user: { id: "user-1" } });
    ws.send.mockClear();

    ws.emit("message", Buffer.from(JSON.stringify({ type: "ping" })));

    expect(ws.send).toHaveBeenCalledWith(
      expect.stringContaining('"type":"pong"')
    );
  });

  test("should handle invalid JSON gracefully", () => {
    const ws = createMockWs();
    handleConnection(ws, { user: { id: "user-1" } });
    ws.send.mockClear();

    ws.emit("message", Buffer.from("not json at all"));

    expect(ws.send).toHaveBeenCalledWith(
      expect.stringContaining("Invalid message format")
    );
  });
});

// ============================================================
// 🐛 BUG 3 TEST — WILL FAIL until memory leak is fixed
// ============================================================

describe("WebSocket — Connection Cleanup (Memory Leak Bug)", () => {
  test("should remove connection when client disconnects", () => {
    const ws = createMockWs();
    handleConnection(ws, { user: { id: "user-1" } });

    expect(getConnectionCount()).toBe(1);

    // Simulate client disconnect
    ws.emit("close");

    // After disconnect, connection should be removed
    expect(getConnectionCount()).toBe(0);
  });

  test("should remove connection on error", () => {
    const ws = createMockWs();
    handleConnection(ws, { user: { id: "user-1" } });

    expect(getConnectionCount()).toBe(1);

    // Simulate error
    ws.emit("error", new Error("Connection lost"));

    // After error, connection should be removed
    expect(getConnectionCount()).toBe(0);
  });

  test("should correctly track count after multiple connect/disconnect cycles", () => {
    const ws1 = createMockWs();
    const ws2 = createMockWs();
    const ws3 = createMockWs();

    handleConnection(ws1, { user: { id: "user-1" } });
    handleConnection(ws2, { user: { id: "user-2" } });
    handleConnection(ws3, { user: { id: "user-3" } });
    expect(getConnectionCount()).toBe(3);

    ws1.emit("close");
    expect(getConnectionCount()).toBe(2);

    ws2.emit("error", new Error("broken"));
    expect(getConnectionCount()).toBe(1);

    ws3.emit("close");
    expect(getConnectionCount()).toBe(0);
  });

  test("should not leak memory with 100 connect/disconnect cycles", () => {
    for (let i = 0; i < 100; i++) {
      const ws = createMockWs();
      handleConnection(ws, { user: { id: `user-${i}` } });
      ws.emit("close");
    }

    // After 100 cycles, all connections should be cleaned up
    expect(getConnectionCount()).toBe(0);
  });
});
