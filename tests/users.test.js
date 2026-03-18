const request = require("supertest");

process.env.NODE_ENV = "test";

const { app } = require("../src/app");
const { resetStore } = require("../src/models/database");
const { hashSync } = require("../src/utils/hash");
const { v4: uuidv4 } = require("uuid");
const { db } = require("../src/models/database");

beforeEach(() => {
  resetStore();

  const hash = hashSync("password123");

  for (let i = 1; i <= 25; i++) {
    db.users.create({
      id: uuidv4(),
      name: `User ${i}`,
      email: `user${i}@test.com`,
      password: hash,
      role: i === 1 ? "admin" : "user",
    });
  }
});

// ============================================================
// WORKING TESTS — These should pass
// ============================================================

describe("GET /users/:id", () => {
  test("should return a single user by ID", async () => {
    const user = db.users.findAll({ limit: 1 })[0];

    const res = await request(app).get(`/users/${user.id}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("id", user.id);
    expect(res.body.data).toHaveProperty("name");
    expect(res.body.data).toHaveProperty("email");
  });

  test("should return 404 for non-existent user", async () => {
    const res = await request(app).get("/users/non-existent-id");
    expect(res.status).toBe(404);
  });
});

describe("POST /users", () => {
  test("should create a new user", async () => {
    const res = await request(app)
      .post("/users")
      .send({ name: "New User", email: "new@test.com", password: "pass123" });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data.name).toBe("New User");
    expect(res.body.data.email).toBe("new@test.com");
  });

  test("should return 400 if fields are missing", async () => {
    const res = await request(app).post("/users").send({ name: "No Email" });
    expect(res.status).toBe(400);
  });
});

describe("DELETE /users/:id", () => {
  test("should return 401 without auth token", async () => {
    const user = db.users.findAll({ limit: 1 })[0];

    const res = await request(app).delete(`/users/${user.id}`);
    expect(res.status).toBe(401);
  });
});

// ============================================================
// 🐛 BUG 1 TEST — WILL FAIL until pagination bug is fixed
// ============================================================

describe("GET /users — Pagination", () => {
  test("should return pagination metadata", async () => {
    const res = await request(app).get("/users?page=1&perPage=5");

    expect(res.status).toBe(200);

    // These assertions WILL FAIL because the endpoint returns a raw array
    expect(res.body).toHaveProperty("data");
    expect(res.body).toHaveProperty("meta");
    expect(res.body.meta).toHaveProperty("total");
    expect(res.body.meta).toHaveProperty("page", 1);
    expect(res.body.meta).toHaveProperty("perPage", 5);
    expect(res.body.meta).toHaveProperty("totalPages");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeLessThanOrEqual(5);
  });

  test("should return correct total count", async () => {
    const res = await request(app).get("/users?page=1&perPage=10");

    expect(res.body.meta.total).toBe(25);
    expect(res.body.meta.totalPages).toBe(3);
  });

  test("should return correct page of results", async () => {
    const res = await request(app).get("/users?page=3&perPage=10");

    expect(res.body.data.length).toBe(5); // 25 users, page 3 of 10 = 5 remaining
    expect(res.body.meta.page).toBe(3);
  });
});

// ============================================================
// 🐛 BUG 2 TEST — WILL FAIL until race condition is fixed
// ============================================================

describe("POST /users — Duplicate Prevention", () => {
  test("should not create duplicate users on concurrent requests", async () => {
    const userData = {
      name: "Race Condition",
      email: "race@test.com",
      password: "password123",
    };

    // Send multiple concurrent requests with the same email
    const results = await Promise.allSettled([
      request(app).post("/users").send(userData),
      request(app).post("/users").send(userData),
      request(app).post("/users").send(userData),
    ]);

    const successes = results.filter(
      (r) => r.status === "fulfilled" && r.value.status === 201
    );
    const conflicts = results.filter(
      (r) => r.status === "fulfilled" && r.value.status === 409
    );

    // Only ONE request should succeed; the rest should get 409 Conflict
    expect(successes.length).toBe(1);
    expect(conflicts.length).toBe(2);
  });

  test("should return 409 for duplicate email after first creation", async () => {
    // First request — should succeed
    await request(app)
      .post("/users")
      .send({ name: "First", email: "dup@test.com", password: "pass123" });

    // Second request — should fail with 409
    const res = await request(app)
      .post("/users")
      .send({ name: "Second", email: "dup@test.com", password: "pass456" });

    expect(res.status).toBe(409);
    expect(res.body.error).toContain("already exists");
  });
});
