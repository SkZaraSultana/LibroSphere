# LibroSphere

Backend and frontend scaffold for LibroSphere — a production-quality Library Management SaaS.

## Quick start

Requirements:
- Node 18+
- MongoDB (local or Atlas)

From workspace root:

```powershell
# Install server deps
cd server
npm install

# Start server (ensure MongoDB is running or set MONGO_URI)
node server.js

# In another terminal, install and run client
cd ../client
npm install
npm run dev
```

Environment:
- Copy `server/.env.example` to `server/.env` and update `MONGO_URI` and `JWT_SECRET` before starting the server.
- Client uses `VITE_API_BASE_URL` in `.env` (defaults to `http://localhost:5000/api`).

What was implemented:
- Full backend authentication (register/login/me) with JWT
- User model with password hashing and secure JSON output
- Centralized error handling
- Express app configured with CORS, morgan, cookie-parser, and security headers

Next suggested steps:
- Implement frontend auth flows and protected routes
- Add unit/integration tests for auth
- Add rate-limiting and input sanitization for production
