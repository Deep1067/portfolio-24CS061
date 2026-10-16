/**
 * server.js – Practical 4: Building a RESTful API with Node.js and Express
 * Student: Deep Patel  |  Roll No: 24CS061
 * Course:  B.Tech Computer Engineering, CSPIT, CHARUSAT University
 *
 * Architecture & Middleware Pipeline:
 *  1. Request Logging Middleware (method, url, timestamp)
 *  2. Express JSON Body Parser (express.json())
 *  3. CORS Middleware (allows browser client communication)
 *  4. Content-Type Validation Middleware (rejects POST/PUT without application/json)
 *  5. REST Router (/tasks CRUD with route-specific ID validator)
 *  6. 404 Route Not Found Middleware (structured JSON for undefined paths)
 *  7. Centralized Global Error Handler Middleware (final middleware in pipeline)
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// ── In-Memory Task Storage (no database yet, as required by Practical 4) ──
let tasks = [
  {
    id: 1,
    title: 'Practical 1: Vite + React Portfolio',
    description: 'Build component-based portfolio with props and styling',
    status: 'Completed',
    priority: 'High',
    createdAt: '2026-10-16T10:00:00.000Z',
    updatedAt: '2026-10-16T10:00:00.000Z',
  },
  {
    id: 2,
    title: 'Practical 2: React Router & useState',
    description: 'Implement multi-route SPA navigation, controlled form, and theme state',
    status: 'Completed',
    priority: 'High',
    createdAt: '2026-10-16T11:00:00.000Z',
    updatedAt: '2026-10-16T11:00:00.000Z',
  },
  {
    id: 3,
    title: 'Practical 3: GitHub REST API Integration',
    description: 'Fetch repositories asynchronously with loading spinner and error handling',
    status: 'Completed',
    priority: 'High',
    createdAt: '2026-10-16T12:00:00.000Z',
    updatedAt: '2026-10-16T12:00:00.000Z',
  },
  {
    id: 4,
    title: 'Practical 4: Express RESTful API',
    description: 'Build task management CRUD backend with custom middleware pipeline',
    status: 'In Progress',
    priority: 'High',
    createdAt: '2026-10-16T13:00:00.000Z',
    updatedAt: '2026-10-16T13:00:00.000Z',
  },
  {
    id: 5,
    title: 'Submit Lab Evidence on MS Teams',
    description: 'Prepare lab documentation and capture required screenshot proofs',
    status: 'Pending',
    priority: 'Medium',
    createdAt: '2026-10-16T14:00:00.000Z',
    updatedAt: '2026-10-16T14:00:00.000Z',
  },
];

let nextId = 6;

// ============================================================================
// 1. GLOBAL MIDDLEWARE PIPELINE
// ============================================================================

// (A) Request Logging Middleware (Step 3 & Problem Statement)
// Logs method, URL, and ISO timestamp for EVERY incoming request
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[REQUEST] ${req.method} ${req.originalUrl || req.url} - ${timestamp}`);
  next();
});

// (B) CORS Middleware
// Enables cross-origin requests from the React frontend running on port 5173
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// (C) Built-in JSON Body Parsing Middleware (Step 2)
app.use(express.json());

// (D) Supplementary Middleware 1: Content-Type Validation on POST / PUT
// Rejects any POST or PUT request that is missing Content-Type: application/json
const validateContentType = (req, res, next) => {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('application/json')) {
      return res.status(415).json({
        status: 415,
        error: 'Unsupported Media Type',
        message: "Requests with a body (POST/PUT) must include 'Content-Type: application/json' header.",
      });
    }
  }
  next();
};
app.use(validateContentType);

// (E) Supplementary Middleware 2: Route-specific Task ID Validator
// Validates that :id parameter is a valid positive integer before controller execution
const validateTaskId = (req, res, next) => {
  const rawId = req.params.id;
  const parsedId = Number(rawId);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: `Invalid task ID '${rawId}'. Task ID must be a positive integer.`,
    });
  }

  req.taskId = parsedId;
  next();
};

// ============================================================================
// 2. RESTful API ROUTES (CRUD)
// ============================================================================

// Root welcome / healthcheck route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 200,
    message: 'Task Manager REST API is running!',
    student: {
      name: 'Deep Patel',
      rollNo: '24CS061',
      institute: 'CSPIT, CHARUSAT University',
    },
    endpoints: {
      'GET /tasks': 'Retrieve all tasks (supports ?status= and ?search=)',
      'GET /tasks/:id': 'Retrieve task by ID',
      'POST /tasks': 'Create a new task (requires JSON body with title)',
      'PUT /tasks/:id': 'Update task by ID',
      'DELETE /tasks/:id': 'Delete task by ID',
      'GET /test-error': 'Deliberately trigger 500 error handler for testing',
    },
  });
});

// 1. GET /tasks – Retrieve all tasks (Status: 200 OK)
app.get('/tasks', (req, res) => {
  const { status, search } = req.query;
  let result = [...tasks];

  if (status) {
    result = result.filter(
      (t) => t.status.toLowerCase() === status.toLowerCase()
    );
  }

  if (search) {
    result = result.filter((t) =>
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase())
    );
  }

  res.status(200).json({
    status: 200,
    count: result.length,
    data: result,
  });
});

// 2. GET /tasks/:id – Retrieve task by ID (Status: 200 OK / 404 Not Found)
app.get('/tasks/:id', validateTaskId, (req, res) => {
  const task = tasks.find((t) => t.id === req.taskId);

  if (!task) {
    return res.status(404).json({
      status: 404,
      error: 'Not Found',
      message: `Task with ID ${req.taskId} not found.`,
    });
  }

  res.status(200).json({
    status: 200,
    data: task,
  });
});

// 3. POST /tasks – Create new task (Status: 201 Created / 400 Bad Request)
app.post('/tasks', (req, res) => {
  const { title, description, status, priority } = req.body;

  // Validation: Title is mandatory
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: "Validation failed: 'title' is required and cannot be empty.",
    });
  }

  const newTask = {
    id: nextId++,
    title: title.trim(),
    description: (description && typeof description === 'string') ? description.trim() : '',
    status: status || 'Pending',
    priority: priority || 'Medium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  tasks.push(newTask);

  res.status(201).json({
    status: 201,
    message: 'Task created successfully.',
    data: newTask,
  });
});

// 4. PUT /tasks/:id – Update task by ID (Status: 200 OK / 404 Not Found / 400 Bad Request)
app.put('/tasks/:id', validateTaskId, (req, res) => {
  const taskIndex = tasks.findIndex((t) => t.id === req.taskId);

  if (taskIndex === -1) {
    return res.status(404).json({
      status: 404,
      error: 'Not Found',
      message: `Cannot update: Task with ID ${req.taskId} does not exist.`,
    });
  }

  const existingTask = tasks[taskIndex];
  const { title, description, status, priority } = req.body;

  // If title is provided, ensure it's not empty
  if (title !== undefined && (!title || typeof title !== 'string' || !title.trim())) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: "Validation failed: 'title' cannot be an empty string.",
    });
  }

  const updatedTask = {
    ...existingTask,
    title: title !== undefined ? title.trim() : existingTask.title,
    description: description !== undefined ? description.trim() : existingTask.description,
    status: status !== undefined ? status : existingTask.status,
    priority: priority !== undefined ? priority : existingTask.priority,
    updatedAt: new Date().toISOString(),
  };

  tasks[taskIndex] = updatedTask;

  res.status(200).json({
    status: 200,
    message: 'Task updated successfully.',
    data: updatedTask,
  });
});

// 5. DELETE /tasks/:id – Delete task by ID (Status: 200 OK / 404 Not Found)
app.delete('/tasks/:id', validateTaskId, (req, res) => {
  const taskIndex = tasks.findIndex((t) => t.id === req.taskId);

  if (taskIndex === -1) {
    return res.status(404).json({
      status: 404,
      error: 'Not Found',
      message: `Cannot delete: Task with ID ${req.taskId} does not exist.`,
    });
  }

  const [deletedTask] = tasks.splice(taskIndex, 1);

  res.status(200).json({
    status: 200,
    message: `Task with ID ${req.taskId} deleted successfully.`,
    deletedTask,
  });
});

// 6. Test Route: Deliberately throw error to demonstrate Global Error Handler
app.get('/test-error', (req, res, next) => {
  const err = new Error('Demonstration error deliberately thrown to test global error handling middleware.');
  err.status = 500;
  next(err);
});

// ============================================================================
// 3. 404 & CENTRALIZED ERROR HANDLING MIDDLEWARE
// ============================================================================

// (A) Supplementary Middleware 3: Custom 404 handler for undefined routes
// Placed after all valid routes
app.use((req, res) => {
  res.status(404).json({
    status: 404,
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}. Route does not exist on this Task Manager API server.`,
  });
});

// (B) Step 5: Global Error Handling Middleware
// Defined strictly last with 4 arguments: (err, req, res, next)
// Centralizes error catching and prevents raw stack traces from reaching clients
app.use((err, req, res, next) => {
  console.error('[ERROR HANDLER CAUGHT]:', err.stack || err.message);

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    status: statusCode,
    error: err.name || 'Internal Server Error',
    message: err.message || 'Something went wrong on the server.',
  });
});

// ============================================================================
// 4. SERVER INITIALIZATION
// ============================================================================
const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Task Manager API Server Running on port ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`👨‍💻 Student: Deep Patel (Roll No: 24CS061)`);
  console.log(`🏫 CSPIT, CHARUSAT University`);
  console.log(`====================================================`);
});

module.exports = { app, server };
