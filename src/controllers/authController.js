const userService = require("../services/userService");
const { generateToken } = require("../middleware/auth");

/**
 * POST /auth/login
 */
function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = userService.authenticateUser(email, password);
    const token = generateToken(user);

    res.json({ data: { user, token } });
  } catch (err) {
    if (err.status === 401) {
      return res.status(401).json({ error: err.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /auth/register
 */
function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const user = userService.createUser({ name, email, password });
    const token = generateToken(user);

    res.status(201).json({ data: { user, token } });
  } catch (err) {
    if (err.status === 409) {
      return res.status(409).json({ error: err.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { login, register };
