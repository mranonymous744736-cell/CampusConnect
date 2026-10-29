# CampusConnect API

Node.js + Express API backed by MongoDB. This is a development/student-project foundation, not production-secure yet.

## Requirements
- Node.js 20 or newer
- MongoDB running locally, or a MongoDB Atlas connection string

## Setup
1. Open a terminal in the `backend` folder.
2. Run `npm install`.
3. Copy `.env.example` to `.env`.
4. Set `MONGODB_URI` to your local MongoDB URL or Atlas connection string.
5. Run `npm run dev`.
6. Test `http://localhost:5000/api/health`.

## Endpoints
- `GET /api/health`
- `GET /api/events` (optional `?category=Workshop&search=AI`)
- `GET /api/events/:id`
- `POST /api/events`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`
- `POST /api/events/:id/register` with `{ "participantName": "Student Name", "participantEmail": "student@example.com" }`
- `GET /api/clubs`
- `POST /api/clubs`
- `POST /api/clubs/:id/join` with `{ "studentEmail": "student@example.com" }`

## Important security note
Admin authentication in the existing frontend is only a demo gate. These API routes do not yet enforce authenticated student/admin roles. Do not deploy publicly or store real student information until authentication, authorization, rate limiting, and appropriate privacy protections are added.
