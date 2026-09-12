# Task Manager

A full-stack personal task management app with secure JWT authentication, built as part of the **EncoderX Full Stack Development Internship**.

**Live app:** https://task-manager-murex-five-61.vercel.app
**API:** https://taskmanager-2-nipy.onrender.com

---

## Features

- 🔐 Secure authentication with JWT (register, login, protected routes)
- ✅ Personal task management — each user only sees their own tasks
- 📋 Three-column workflow: **Todo → In Progress → Done**
- ⚡ Fast, responsive React + Vite frontend
- 🔒 Passwords hashed with BCrypt; stateless session-free API

## Tech Stack

**Backend**
- Java 17, Spring Boot 4
- Spring Security + JWT (jjwt)
- Spring Data JPA / Hibernate
- MySQL (hosted on Aiven)
- Deployed on Render (Docker)

**Frontend**
- React 19
- Vite 7
- Deployed on Vercel

## Project Structure

```
TaskManager/
├── Taskmanager/              # Spring Boot backend (REST API)
│   ├── src/main/java/com/mosala/taskmanager/
│   │   ├── controller/       # REST endpoints (auth, tasks)
│   │   ├── service/          # Business logic
│   │   ├── security/         # JWT filter, Spring Security config
│   │   ├── model/            # JPA entities
│   │   ├── repository/       # Spring Data repositories
│   │   └── dto/              # Request/response objects
│   └── Dockerfile
│
└── task-manager-frontend/    # React frontend
    └── src/
        ├── App.jsx           # All pages/components
        ├── api.js            # API client
        └── styles.css
```

## Running Locally

### Backend

```bash
cd Taskmanager/Taskmanager

# Required environment variables
export DB_URL="jdbc:mysql://<host>:<port>/<database>?sslMode=REQUIRED"
export DB_USERNAME="<username>"
export DB_PASSWORD="<password>"
export JWT_SECRET="<a long random string>"

./mvnw clean package -DskipTests
java -jar target/Taskmanager-0.0.1-SNAPSHOT.jar
```

The API runs on `http://localhost:8080` by default.

### Frontend

```bash
cd task-manager-frontend/task-manager-frontend

npm install

# Point the frontend at your local backend
echo "VITE_API_URL=http://localhost:8080" > .env

npm run dev
```

Open `http://localhost:5173` in your browser.

## API Endpoints

| Method | Endpoint             | Description               | Auth required |
|--------|-----------------------|----------------------------|----------------|
| POST   | `/api/auth/register`  | Create a new account       | No             |
| POST   | `/api/auth/login`     | Log in, returns a JWT      | No             |
| GET    | `/api/tasks`          | List the current user's tasks | Yes         |
| POST   | `/api/tasks`          | Create a task              | Yes            |
| PUT    | `/api/tasks/:id`      | Update a task               | Yes            |
| DELETE | `/api/tasks/:id`      | Delete a task               | Yes            |

Authenticated requests send the JWT as:
`Authorization: Bearer <token>`

## Author

**Mosala Mohlabi**
Built as part of the EncoderX Full Stack Development Internship.
