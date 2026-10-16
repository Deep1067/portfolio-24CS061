# task-manager-api-24CS061

**Practical 4: Building a RESTful API with Node.js and Express**  
**Student:** Deep Patel | Roll No: 24CS061  
**Course:** ITUE301 – Advanced Web Development Frameworks  
**Institute:** CSPIT, CHARUSAT University  

---

## Architecture & Middleware Pipeline

```
Client (Postman / Browser / Thunder Client / React)
        │
        ▼
  [1. Logging Middleware]                     ──> Logs method, url, timestamp
        │
        ▼
  [2. CORS Middleware]                        ──> Enables cross-origin requests
        │
        ▼
  [3. express.json() Body Parser]             ──> Parses incoming JSON payload
        │
        ▼
  [4. Content-Type Validation Middleware]     ──> Rejects POST/PUT lacking application/json (415)
        │
        ▼
  Express Router
  ├── GET    /tasks                           ──> getAllTasks (200 OK)
  ├── GET    /tasks/:id                       ──> [validateTaskId] ──> getTaskById (200 / 404 / 400)
  ├── POST   /tasks                           ──> createTask (201 Created / 400)
  ├── PUT    /tasks/:id                       ──> [validateTaskId] ──> updateTask (200 / 404 / 400)
  ├── DELETE /tasks/:id                       ──> [validateTaskId] ──> deleteTask (200 / 404)
  └── GET    /test-error                      ──> Deliberately throws error to test 500 handler
        │
        ▼
  [5. 404 Route Not Found Middleware]         ──> Structured JSON for undefined paths (404)
        │
        ▼
  [6. Centralized Global Error Handler]       ──> Last in chain (err, req, res, next) (500)
```

---

## Endpoints Specification

| Method | Endpoint | Description | Status Codes |
|---|---|---|---|
| `GET` | `/` | API status and student info | `200 OK` |
| `GET` | `/tasks` | Retrieve all tasks in memory (supports `?status=` and `?search=`) | `200 OK` |
| `GET` | `/tasks/:id` | Retrieve task by numeric ID | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `POST` | `/tasks` | Create new task (body: `title` required, `description`, `priority`) | `201 Created`, `400 Bad Request`, `415 Unsupported Media Type` |
| `PUT` | `/tasks/:id` | Update existing task by ID | `200 OK`, `400 Bad Request`, `404 Not Found`, `415 Unsupported Media Type` |
| `DELETE` | `/tasks/:id` | Remove task by ID | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `GET` | `/test-error` | Deliberately trigger global 500 error handler | `500 Internal Server Error` |
| `*` | Any undefined | Custom 404 handler returning structured JSON | `404 Not Found` |

---

## Running the Server

### Standalone (Inside `task-manager-api`):
```bash
cd task-manager-api
npm install
npm start
```

### From Root Project (`portfolio-24CS061`):
```bash
npm run server
```

The server listens on `http://localhost:5000`.

---

## Automated Verification Suite

Run all 12 automated test assertions:
```bash
node task-manager-api/test-runner.js
# or from root:
npm run test:api
```
