# Task Manager API – Practical 5: MongoDB Integration & Schema Design with Mongoose

**Student:** Deep Patel | **Roll No:** 24CS061  
**Course:** ITUE301 – Advanced Web Development Frameworks  
**Institute:** CSPIT, CHARUSAT University  
**GitHub:** [https://github.com/Deep1067](https://github.com/Deep1067)  
**LinkedIn:** [https://www.linkedin.com/in/deep-patel-6711aa360/](https://www.linkedin.com/in/deep-patel-6711aa360/)  

---

## 1. Overview & Objectives

- **Course Outcomes:** CO2, CO3 / PO3, PO5
- **Objective:** Connect a MongoDB database to an Express server and enforce strict data validation through a Mongoose schema.
- **Key Concepts:** NoSQL document modeling, Mongoose ODM, Schema validation constraints, Enums, Pre-save middleware hooks, and structured error formatting.

---

## 2. Architecture & Data Flow

```
Client (Postman / Thunder Client / React Frontend)
       │
       ▼
 [1. Request Logger]                   ──> Logs method, url, timestamp
       │
       ▼
 [2. CORS Middleware]                  ──> Enables cross-origin calls
       │
       ▼
 [3. express.json()]                   ──> Parses JSON request body
       │
       ▼
 [4. Content-Type Validator]           ──> Rejects non-JSON payloads on POST/PUT (415)
       │
       ▼
 Express Router & Controllers
 ├── GET    /                          ──> API & Database healthcheck (200 OK)
 ├── GET    /tasks                     ──> Task.find() with filters & search (200 OK)
 ├── GET    /tasks/:id                 ──> Task.findById() with 404 & ObjectId validation
 ├── POST   /tasks                     ──> Task.create() / save() with Mongoose validation
 ├── PUT    /tasks/:id                 ──> Task.findByIdAndUpdate() with runValidators: true
 ├── DELETE /tasks/:id                 ──> Task.findByIdAndDelete() (200 OK / 404)
 └── GET    /test-error                ──> Deliberately triggers centralized 500 error handler
       │
       ▼
 Mongoose ODM Schema Layer
 ├── Pre-save Hook                     ──> Automatically trims title whitespace
 ├── Schema Validation                 ──> Validates required title & priority enum
 └── Virtuals & Serialization          ──> Exposes string id & status
       │
       ▼
 MongoDB Database
 └── Collection: tasks
     └── { _id, title, description, completed, priority, createdAt, updatedAt }
       │
       ▼
 [5. Centralized Error Handler]        ──> Catches ValidationError & returns clean JSON (400)
```

---

## 3. Mongoose Schema Design (`models/Task.js`)

| Field | Type | Validation / Constraints | Default Value | Description |
|---|---|---|---|---|
| `title` | `String` | `required: true`, pre-save trimmed | – | Mandatory task title |
| `description` | `String` | Optional, trimmed | `""` | Optional task description |
| `completed` | `Boolean` | Boolean | `false` | Completion status flag |
| `priority` | `String` | Enum: `['low', 'medium', 'high']` | `'medium'` | Restricts priority values (Supplementary 1) |
| `createdAt` | `Date` | Date object | `Date.now` | Creation timestamp |

### Supplementary Features:
1. **Enum Restriction:** Restricts `priority` strictly to `'low'`, `'medium'`, or `'high'`.
2. **Pre-Save Hook:** Trims leading and trailing whitespace from the `title` before saving.
3. **Structured Validation Errors:** Raw Mongoose `ValidationError` objects are intercepted by the global error handler and formatted into a clear `{ error: "Validation Error", message: "...", errors: { field: "message" } }` payload.
4. **404 on Missing ObjectId:** `GET /tasks/:id` returns a structured 404 JSON when the ObjectId is not found.

---

## 4. Key Questions & Theoretical Analysis

### Q1: What is the purpose of a schema in a NoSQL database like MongoDB, given that MongoDB itself is schema-less?
**Analysis:**  
While MongoDB's engine is inherently schema-less (allowing flexible, polymorphic documents in the same collection), production applications require **data integrity, predictable contracts, and business rule enforcement**. Mongoose schemas introduce an application-level modeling layer that enforces required fields, data types, default values, custom sanitization, and lifecycle hooks before documents reach the database, preventing corrupt or irregular records.

### Q2: Why is it important to define required fields and default values at the schema level rather than relying on frontend validation alone?
**Analysis:**  
Frontend validation provides responsive UI feedback, but it can be completely bypassed by attackers, API clients (Postman, curl), third-party consumers, or network scripts. Schema-level validation acts as the **server-side single source of truth**, guaranteeing that no invalid data can enter persistent storage regardless of the client or interface used.

### Q3: What happens internally when a document fails Mongoose validation — where is the request stopped?
**Analysis:**  
When `document.save()` or `Model.create()` is executed, Mongoose runs internal validation validators on every schema path before constructing the MongoDB driver wire command. If any field fails validation:
1. Validation halts immediately without sending any network command to the MongoDB server.
2. Mongoose generates a `ValidationError` populated with path-specific `ValidatorError` instances.
3. The promise rejects, triggering the `catch` block in the controller route.
4. The route passes the error to Express's centralized error handler (`next(err)`), returning a structured HTTP 400 Bad Request response to the client.

---

## 5. Endpoints Reference

| Method | Endpoint | Description | Expected Status Codes |
|---|---|---|---|
| `GET` | `/` | API & MongoDB healthcheck | `200 OK` |
| `GET` | `/tasks` | Retrieve all tasks (supports `?search=`, `?priority=`, `?completed=`) | `200 OK` |
| `GET` | `/tasks/:id` | Retrieve task by 24-character ObjectId | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `POST` | `/tasks` | Create new task (requires `title`) | `201 Created`, `400 Validation Error`, `415 Media Type` |
| `PUT` | `/tasks/:id` | Update task with `runValidators: true` | `200 OK`, `400 Validation Error`, `404 Not Found` |
| `DELETE` | `/tasks/:id` | Delete task document by ObjectId | `200 OK`, `400 Bad Request`, `404 Not Found` |
| `GET` | `/test-error` | Deliberately trigger centralized 500 error handler | `500 Internal Server Error` |
| `*` | Any undefined | Custom 404 JSON handler | `404 Not Found` |

---

## 6. How to Run Locally

### Environment Setup
Create a `.env` file (copied from `.env.example`):
```bash
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/taskmanager_24cs061
```

### Start Server
```bash
# From task-manager-api directory:
npm install
npm start

# Or from root portfolio-24CS061 directory:
npm run server
```

### Run Automated Test Suite (17 Assertions)
```bash
npm run test:api
```
All 17 checks verify CRUD persistence, schema validation, enum restriction, pre-save hook trimming, and error formatting.
