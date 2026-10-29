# CampusConnect project

CampusConnect contains a React/Vite frontend and an Express/MongoDB backend.

## Frontend
```bash
cd CampusConnect
npm install
npm run dev
```
Open the Vite URL shown in the terminal (usually http://localhost:5173). The admin demo is at `/admin`.

## Backend
In a second terminal:
```bash
cd backend
npm install
```
Copy `backend/.env.example` to `backend/.env`, set `MONGODB_URI`, then run `npm run dev` from the `backend` folder. The API defaults to http://localhost:5000.

See `backend/README.md` for routes and requirements. Frontend pages use mock data as a fallback if the API is not running; events can use the API when the backend and MongoDB are available.

**Demo credentials (frontend-only, not secure authentication):** `admin@campusconnect.edu` / `campus2025`.
