# CampusConnect

CampusConnect is a React/Vite student campus portal with an Express API and MongoDB.

## Requirements
- Node.js LTS
- MongoDB Atlas or a local MongoDB instance

## Configure MongoDB
1. In `backend`, copy `.env.example` to `.env`.
2. Set `MONGODB_URI` to your MongoDB connection string. Keep `.env` private.
3. Optional: set `CLIENT_ORIGIN=http://localhost:5173`.

## Run locally
Open two terminals from the project root.

Terminal 1:
```bash
cd backend
npm install
npm run dev
```

Terminal 2:
```bash
cd CampusConnect
npm install
npm run dev
```

Open the Vite URL shown in Terminal 2 (usually http://localhost:5173). The API health endpoint is http://localhost:5000/api/health.

## Data behavior
- Starter events and clubs are inserted into MongoDB only when their collections are empty. The seed dates are generated relative to the day the database is first initialized.
- Admin event create/update/delete operations are database-only. If the API fails, the admin shows an error instead of creating a fake local event.
- Student Home, Events, Clubs, Workshops and Hackathons pages read from the API. Home and Calendar refresh periodically so admin changes become visible without restarting the frontend.
- Event registrations use a student profile entered once per browser; registration records are stored in MongoDB.
- Club follow/unfollow is stored in MongoDB by email and remains after refresh. The admin Clubs page supports create, edit and delete; Students lists users who registered for at least one event.
- Calendar dates are generated from the current month and actual event dates.

## Notes
Demo admin login: `admin@campusconnect.edu` / `campus2025`. The admin login in this college demo is a frontend demo gate, not production authentication. Student login, secure admin roles, photo storage, discussions/news/resources CRUD and email notifications are not implemented as complete backend features yet. Do not use this demo gate to protect real personal data.
