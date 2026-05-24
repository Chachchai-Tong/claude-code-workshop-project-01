const userService = require("../services/userService");

/**
 * GET /users
 *
 * 🐛 BUG 1 (Easy): Does NOT return pagination metadata.
 *    The endpoint returns a raw array instead of { data, meta } format.
 *    Missing: total count, page, perPage, totalPages.
 */
function getUsers(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;

    const users = userService.getUsers({ page, perPage });
    const total = userService.getUserCount();
    const totalPages = Math.ceil(total / perPage);

    res.json({ data: users, meta: { total, page, perPage, totalPages } });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /users/:id
 */
function getUserById(req, res) {
  try {
    const user = userService.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ data: user });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /users
 */
function createUser(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    const user = userService.createUser({ name, email, password });
    res.status(201).json({ data: user });
  } catch (err) {
    if (err.status === 409) {
      return res.status(409).json({ error: err.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * PUT /users/:id
 */
function updateUser(req, res) {
  try {
    const user = userService.updateUser(req.params.id, req.body);
    res.json({ data: user });
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * DELETE /users/:id
 */
function deleteUser(req, res) {
  try {
    userService.deleteUser(req.params.id);
    res.status(204).send();
  } catch (err) {
    if (err.status === 404) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser };
