# Claude Code Workshop Project

## Project Overview
This is a Node.js REST API for a blog platform with users, posts, and comments.
Built with Express.js and an in-memory data store.

## Tech Stack
- Node.js 20, Express.js, JWT auth, WebSocket (ws)
- Testing: Jest + Supertest
- Database: In-memory store (src/models/database.js)
- Password hashing: Node.js crypto scrypt (src/utils/hash.js)

## Key Commands
- `npm test` — Run all tests (some will fail intentionally!)
- `npm run dev` — Start dev server with auto-reload
- `npm run db:seed` — Seed sample data

## Architecture
- Routes → Controllers → Services → Database
- Auth middleware uses JWT tokens (Bearer scheme)
- WebSocket server is attached to the HTTP server

## Known Issues
There are **3 intentional bugs** in this codebase. Run the tests to discover them.
Check `logs/error.log` for additional clues.

## Conventions
- All API responses use `{ data: ... }` wrapper format
- Pagination responses should include `{ data, meta: { total, page, perPage, totalPages } }`
- Errors return `{ error: "message" }` with appropriate HTTP status codes
- Passwords are never included in API responses
