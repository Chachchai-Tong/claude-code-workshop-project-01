const request = require("supertest");

process.env.NODE_ENV = "test";

const { app } = require("../src/app");
const { db, resetStore } = require("../src/models/database");
const { hashSync } = require("../src/utils/hash");
const { v4: uuidv4 } = require("uuid");

beforeEach(() => {
  resetStore();

  const hash = hashSync("password123");
  db.users.create({
    id: uuidv4(),
    name: "Test Admin",
    email: "admin@test.com",
    password: hash,
    role: "admin",
  });
});

describe("POST /auth/register", () => {
  test("should register a new user and return token", async () => {
    const res = await request(app).post("/auth/register").send({
      name: "New User",
      email: "newuser@test.com",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty("user");
    expect(res.body.data).toHaveProperty("token");
    expect(res.body.data.user.email).toBe("newuser@test.com");
  });

  test("should return 400 for short password", async () => {
    const res = await request(app).post("/auth/register").send({
      name: "Short Pass",
      email: "short@test.com",
      password: "123",
    });

    expect(res.status).toBe(400);
  });

  test("should return 400 for missing fields", async () => {
    const res = await request(app).post("/auth/register").send({
      email: "noname@test.com",
    });

    expect(res.status).toBe(400);
  });
});

describe("POST /auth/login", () => {
  test("should login with valid credentials", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "admin@test.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("token");
    expect(res.body.data.user.email).toBe("admin@test.com");
  });

  test("should return 401 for wrong password", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "admin@test.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
  });

  test("should return 401 for non-existent email", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "nobody@test.com",
      password: "password123",
    });

    expect(res.status).toBe(401);
  });
});

describe("Protected Routes", () => {
  test("should access protected route with valid token", async () => {
    const loginRes = await request(app).post("/auth/login").send({
      email: "admin@test.com",
      password: "password123",
    });
    const token = loginRes.body.data.token;

    const user = db.users.findByEmail("admin@test.com");

    const res = await request(app)
      .put(`/users/${user.id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Updated Admin" });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Updated Admin");
  });
});
