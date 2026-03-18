# Claude Code Workshop — Sample Project

A simple REST API for a blog platform with users, posts, and comments.
Built with Express.js for the **Claude Code Workshop**.

> ⚠️ **This project contains intentional bugs!** Some tests will fail by design.
> Your mission: use Claude Code to find and fix them.

## Quick Start

```bash
# Install dependencies
npm install

# Seed the database with sample data
npm run db:seed

# Start the development server
npm run dev

# Run tests
npm test
```

## Tech Stack

- **Runtime:** Node.js 20
- **Framework:** Express.js
- **Database:** In-memory store (no external DB required)
- **Auth:** JWT (jsonwebtoken) + crypto (Node.js built-in)
- **WebSocket:** ws
- **Testing:** Jest + Supertest

## API Endpoints

| Method | Path | Description | Auth Required |
|--------|------|-------------|---------------|
| GET | /health | Health check | No |
| GET | /users | List users (paginated) | No |
| GET | /users/:id | Get user by ID | No |
| POST | /users | Create user | No |
| PUT | /users/:id | Update user | Yes |
| DELETE | /users/:id | Delete user | Yes |
| POST | /auth/login | Login | No |
| POST | /auth/register | Register | No |
| WS | /ws | WebSocket connection | No |

## Project Structure

```
src/
├── app.js              # Express app + WebSocket server
├── routes/
│   ├── userRoutes.js   # /users endpoints
│   └── authRoutes.js   # /auth endpoints
├── controllers/
│   ├── userController.js
│   └── authController.js
├── services/
│   └── userService.js  # Business logic
├── models/
│   ├── database.js     # In-memory data store
│   └── seed.js         # Seed script
├── middleware/
│   └── auth.js         # JWT authentication
├── handlers/
│   └── websocketHandler.js  # WebSocket logic
└── utils/
    ├── hash.js         # Password hashing (scrypt)
    └── errors.js       # Error handling
tests/
├── setup.js            # Test environment setup
├── users.test.js       # User endpoint tests
├── auth.test.js        # Auth endpoint tests
└── websocket.test.js   # WebSocket tests
logs/
└── error.log           # Application error log (check for clues!)
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | Server port |
| JWT_SECRET | workshop-secret-key-2026 | JWT signing secret |
| NODE_ENV | development | Environment mode |

## Workshop Challenge

This project has **3 bugs** at increasing difficulty:

1. **Bug 1 (Easy):** A failing test reveals a missing feature — find the endpoint that doesn't return the expected response format
2. **Bug 2 (Medium):** A concurrency issue — the test sends simultaneous requests and expects proper conflict handling
3. **Bug 3 (Hard):** A resource management problem — the test checks cleanup behavior that isn't implemented

### Hints

- Run `npm test` to see which tests fail
- Check `logs/error.log` for clues
- Use Claude Code to explore the codebase: `claude "run the tests and explain what's failing"`

## Notes

- This project is designed for learning purposes
- The database resets on each server restart (in-memory store)
- Some tests are **intentionally failing** — that's your job to fix!
- Use Claude Code to explore, debug, and improve this codebase
