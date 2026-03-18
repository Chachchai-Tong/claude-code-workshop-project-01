const { db } = require("../models/database");
const { v4: uuidv4 } = require("uuid");
const { hashSync, compareSync } = require("../utils/hash");

/**
 * Get all users with optional pagination
 */
function getUsers({ page = 1, perPage = 10 } = {}) {
  const offset = (page - 1) * perPage;

  const users = db.users.findAll({ limit: perPage, offset });

  // Return safe user objects (no password)
  return users.map(({ password, ...rest }) => rest);
}

/**
 * Get total user count
 */
function getUserCount() {
  return db.users.count();
}

/**
 * Get a single user by ID
 */
function getUserById(id) {
  const user = db.users.findById(id);
  if (!user) return null;
  const { password, ...safe } = user;
  return safe;
}

/**
 * Create a new user
 *
 * 🐛 BUG 2 (Medium): Race condition — checks for existing email with a lookup
 *    before inserting, but there's no atomic operation. Concurrent requests
 *    can both pass the check and both insert successfully.
 */
function createUser({ name, email, password }) {
  // Check if email already exists (vulnerable to race condition!)
  const existing = db.users.findByEmail(email);
  if (existing) {
    const error = new Error("Email already exists");
    error.status = 409;
    throw error;
  }

  // There's a gap here where another request could insert the same email

  const id = uuidv4();
  const hashedPassword = hashSync(password);

  db.users.create({ id, name, email, password: hashedPassword, role: "user" });

  return { id, name, email, role: "user" };
}

/**
 * Update a user
 */
function updateUser(id, { name, email }) {
  const user = getUserById(id);
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  const updated = db.users.update(id, {
    name: name || user.name,
    email: email || user.email,
  });

  const { password, ...safe } = updated;
  return safe;
}

/**
 * Delete a user
 */
function deleteUser(id) {
  const user = getUserById(id);
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }

  db.users.delete(id);
  return { deleted: true };
}

/**
 * Authenticate user by email and password
 */
function authenticateUser(email, password) {
  const user = db.users.findByEmail(email);

  if (!user || !compareSync(password, user.password)) {
    const error = new Error("Invalid email or password");
    error.status = 401;
    throw error;
  }

  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

module.exports = {
  getUsers,
  getUserCount,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  authenticateUser,
};
