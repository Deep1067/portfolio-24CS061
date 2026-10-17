/**
 * server.js – Practical 5: MongoDB Integration and Schema Design with Mongoose
 * Student: Deep Patel  |  Roll No: 24CS061
 * Course:  B.Tech Computer Engineering, CSPIT, CHARUSAT University
 *
 * Architecture & Middleware Pipeline:
 *  1. Request Logging Middleware (method, url, timestamp)
 *  2. CORS Middleware (allows browser client communication)
 *  3. Express JSON Body Parser (express.json())
 *  4. Content-Type Validation Middleware (rejects POST/PUT without application/json)
 *  5. REST Router with Mongoose ODM Model Operations
 *  6. 404 Route Not Found Middleware (structured JSON for undefined paths)
 *  7. Centralized Global Error Handler (converts Mongoose errors to structured JSON)
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config(); // fallback

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Task = require('./models/Task');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskmanager_24cs061';

// ============================================================================
// 1. MONGODB CONNECTION SETUP
// ============================================================================
const seedDefaultTasksIfEmpty = async () => {
  try {
    const count = await Task.countDocuments();
    if (count === 0) {
      await Task.insertMany([
        {
          title: 'Practical 1: Vite + React Portfolio',
          description: 'Build component-based portfolio with props and styling',
          completed: true,
          priority: 'high',
        },
        {
          title: 'Practical 2: React Router & useState',
          description: 'Implement multi-route SPA navigation, controlled form, and theme state',
          completed: true,
          priority: 'high',
        },
        {
          title: 'Practical 3: GitHub REST API Integration',
          description: 'Fetch repositories asynchronously with loading spinner and error handling',
          completed: true,
          priority: 'high',
        },
        {
          title: 'Practical 4: Express RESTful API',
          description: 'Build task management CRUD backend with custom middleware pipeline',
          completed: true,
          priority: 'high',
        },
        {
          title: 'Practical 5: MongoDB & Mongoose Integration',
          description: 'Connect Express to MongoDB, enforce schema validation & pre-save hooks',
          completed: false,
          priority: 'high',
        },
      ]);
      console.log('🌱 Seeded default tasks into MongoDB.');
    }
  } catch (err) {
    console.warn('⚠️ Seeding note:', err.message);
  }
};

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully to:', MONGO_URI);
    seedDefaultTasksIfEmpty();
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });

// ============================================================================
// 2. GLOBAL MIDDLEWARE PIPELINE
// ============================================================================

// (A) Request Logging Middleware (method, URL, ISO timestamp)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[REQUEST] ${req.method} ${req.originalUrl || req.url} - ${timestamp}`);
  next();
});

// (B) CORS Middleware
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// (C) Built-in JSON Body Parsing Middleware
app.use(express.json());

// (D) Content-Type Validation Middleware for POST / PUT / PATCH
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

// (E) Route-specific MongoDB ObjectId Validator Helper
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ============================================================================
// 3. RESTful API ROUTES (MongoDB Mongoose CRUD)
// ============================================================================

// Root welcome & healthcheck route with DB connection status
app.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  res.status(200).json({
    status: 200,
    message: 'Task Manager REST API with MongoDB & Mongoose is running!',
    student: {
      name: 'Deep Patel',
      rollNo: '24CS061',
      institute: 'CSPIT, CHARUSAT University',
    },
    database: {
      engine: 'MongoDB',
      odm: 'Mongoose',
      status: states[dbState] || 'Unknown',
      connected: dbState === 1,
    },
    endpoints: {
      'GET /tasks': 'Retrieve all tasks from MongoDB (supports ?status=, ?priority=, ?search=)',
      'GET /tasks/:id': 'Retrieve task by MongoDB ObjectId (returns 404 if not found, 400 if invalid ObjectId)',
      'POST /tasks': 'Create new task in MongoDB (enforces schema validation & pre-save trimming)',
      'PUT /tasks/:id': 'Update task by MongoDB ObjectId (with runValidators: true)',
      'DELETE /tasks/:id': 'Delete task from MongoDB by ObjectId',
      'GET /test-error': 'Deliberately trigger 500 error handler for testing',
    },
  });
});

// 1. GET /tasks – Retrieve all tasks from MongoDB (Status: 200 OK)
app.get('/tasks', async (req, res, next) => {
  try {
    const { status, completed, priority, search } = req.query;
    const filter = {};

    if (completed !== undefined) {
      filter.completed = completed === 'true';
    } else if (status) {
      filter.completed = status.toLowerCase() === 'completed';
    }

    if (priority) {
      filter.priority = priority.toLowerCase();
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      status: 200,
      count: tasks.length,
      data: tasks,
    });
  } catch (err) {
    next(err);
  }
});

// 2. GET /tasks/:id – Retrieve task by ID (Status: 200 OK / 400 Bad Request / 404 Not Found)
app.get('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: `Invalid task ID format '${id}'. Task ID must be a valid 24-character MongoDB ObjectId.`,
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Task with ID '${id}' not found.`,
      });
    }

    res.status(200).json({
      status: 200,
      data: task,
    });
  } catch (err) {
    next(err);
  }
});

// 3. POST /tasks – Create new task in MongoDB (Status: 201 Created / 400 Validation Error)
app.post('/tasks', async (req, res, next) => {
  try {
    const { title, description, completed, priority, status } = req.body;

    // Resolve completed flag from either boolean or status string
    let isCompleted = false;
    if (typeof completed === 'boolean') {
      isCompleted = completed;
    } else if (typeof status === 'string') {
      isCompleted = status.toLowerCase() === 'completed';
    }

    const task = new Task({
      title,
      description,
      completed: isCompleted,
      priority,
    });

    const savedTask = await task.save();

    res.status(201).json({
      status: 201,
      message: 'Task created successfully in MongoDB.',
      data: savedTask,
    });
  } catch (err) {
    next(err);
  }
});

// 4. PUT /tasks/:id – Update task by ID (Status: 200 OK / 400 Bad Request / 404 Not Found)
app.put('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: `Invalid task ID format '${id}'. Task ID must be a valid 24-character MongoDB ObjectId.`,
      });
    }

    const { title, description, completed, priority, status } = req.body;
    const updateData = {};

    if (title !== undefined) updateData.title = typeof title === 'string' ? title.trim() : title;
    if (description !== undefined) updateData.description = typeof description === 'string' ? description.trim() : description;
    if (completed !== undefined) {
      updateData.completed = Boolean(completed);
    } else if (status !== undefined) {
      updateData.completed = status.toLowerCase() === 'completed';
    }
    if (priority !== undefined) {
      updateData.priority = typeof priority === 'string' ? priority.toLowerCase() : priority;
    }

    const updatedTask = await Task.findByIdAndUpdate(id, updateData, {
      returnDocument: 'after',
      runValidators: true,
    });

    if (!updatedTask) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Cannot update: Task with ID '${id}' does not exist.`,
      });
    }

    res.status(200).json({
      status: 200,
      message: 'Task updated successfully in MongoDB.',
      data: updatedTask,
    });
  } catch (err) {
    next(err);
  }
});

// 5. DELETE /tasks/:id – Delete task by ID (Status: 200 OK / 400 Bad Request / 404 Not Found)
app.delete('/tasks/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: `Invalid task ID format '${id}'. Task ID must be a valid 24-character MongoDB ObjectId.`,
      });
    }

    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Cannot delete: Task with ID '${id}' does not exist.`,
      });
    }

    res.status(200).json({
      status: 200,
      message: `Task with ID '${id}' deleted successfully from MongoDB.`,
      deletedTask,
    });
  } catch (err) {
    next(err);
  }
});

// 6. Test Route: Deliberately throw error to test Global Error Handler
app.get('/test-error', (req, res, next) => {
  const err = new Error('Demonstration error deliberately thrown to test global error handling middleware.');
  err.status = 500;
  next(err);
});

// ============================================================================
// 4. 404 & CENTRALIZED ERROR HANDLING MIDDLEWARE
// ============================================================================

// (A) Custom 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    status: 404,
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}. Route does not exist on this Task Manager API server.`,
  });
});

// (B) Centralized Global Error Handling Middleware
// Defined strictly last with 4 arguments: (err, req, res, _next)
// Transforms raw Mongoose errors into clean, structured JSON responses
app.use((err, req, res, _next) => {
  console.error('[ERROR HANDLER CAUGHT]:', err.name, err.message);

  // 1. Mongoose Schema Validation Error (Required fields, enum violations, min/max length)
  if (err.name === 'ValidationError') {
    const errors = {};
    if (err.errors) {
      Object.keys(err.errors).forEach((key) => {
        errors[key] = err.errors[key].message;
      });
    }
    return res.status(400).json({
      status: 400,
      error: 'Validation Error',
      message: 'Mongoose schema validation failed.',
      errors,
    });
  }

  // 2. Mongoose CastError (e.g. malformed ObjectId, wrong type)
  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: `Invalid ${err.kind} value '${err.value}' for field '${err.path}'.`,
    });
  }

  // 3. Default Server Error
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    status: statusCode,
    error: err.name || 'Internal Server Error',
    message: err.message || 'Something went wrong on the server.',
  });
});

// ============================================================================
// 5. SERVER INITIALIZATION
// ============================================================================
const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Task Manager API Server Running on port ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🗄️  MongoDB URI: ${MONGO_URI}`);
  console.log(`👨‍💻 Student: Deep Patel (Roll No: 24CS061)`);
  console.log(`🏫 CSPIT, CHARUSAT University`);
  console.log(`====================================================`);
});

module.exports = { app, server, mongoose };
