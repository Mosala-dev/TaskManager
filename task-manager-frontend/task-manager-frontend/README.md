# Task Manager Frontend

React + Vite frontend for the Java Spring Boot Task Management API.

## Requirements

- Node.js 20+ recommended
- Java/Spring Boot backend running on `http://localhost:8080`

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` if you need a different backend URL:

```env
VITE_API_URL=http://localhost:8080
```

Run the frontend:

```bash
npm run dev
```

Open the URL shown by Vite, normally:

`http://localhost:5173`

## Backend endpoints used

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`

### Tasks

- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`

The frontend stores the JWT returned by the login endpoint in browser localStorage and sends it as:

`Authorization: Bearer <token>`

## Expected task status values

- `TODO`
- `IN_PROGRESS`
- `DONE`

## Production

Set `VITE_API_URL` to the deployed Spring Boot API URL when building for production.
