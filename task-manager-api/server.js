/**
 * server.js – Practical 7: Authentication and Middleware Pipeline
 * Student: Deep Patel  |  Roll No: 24CS061
 * Course:  B.Tech Computer Engineering, CSPIT, CHARUSAT University
 *
 * Architecture & Middleware Pipeline:
 *  1. Request Logging Middleware (method, url, timestamp)
 *  2. CORS Middleware (allows browser client communication with Authorization header)
 *  3. Express JSON Body Parser (express.json())
 *  4. Content-Type Validation Middleware (rejects POST/PUT without application/json)
 *  5. Authentication Middleware (verifies JWT Bearer token on protected routes)
 *  6. Input Validation Middleware (checks required fields before reaching controllers)
 *  7. REST Router (Auth routes + Protected Task CRUD routes)
 *  8. 404 Route Not Found Middleware (structured JSON)
 *  9. Centralized Global Error Handler (handles Mongoose validation & JWT errors)
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config(); // fallback

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Task = require('./models/Task');
const User = require('./models/User');
const cache = require('./cache');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskmanager_24cs061';
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_24cs061_charusat_itue301';

// Practical 9: Cache Invalidation Helper for Write Operations (POST, PUT, DELETE)
const invalidateTasksCache = (taskId = null) => {
  const keys = cache.keys();
  keys.forEach((key) => {
    if (key === 'all_tasks' || key.startsWith('tasks_')) {
      cache.del(key);
    }
  });
  if (taskId) {
    cache.del(`task_${taskId}`);
  }
};


// ============================================================================
// 1. MONGODB CONNECTION SETUP
// ============================================================================
const seedDefaultDataIfEmpty = async () => {
  try {
    const taskCount = await Task.countDocuments();
    if (taskCount === 0) {
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
          completed: true,
          priority: 'high',
        },
        {
          title: 'Practical 6: Full Stack Integration',
          description: 'Wire React frontend to Node and MongoDB backend with api.js',
          completed: true,
          priority: 'high',
        },
        {
          title: 'Practical 7: JWT Authentication & Middleware Pipeline',
          description: 'Implement register, login, password hashing, and token verification',
          completed: false,
          priority: 'high',
        },
      ]);
      console.log('🌱 Seeded default tasks into MongoDB.');
    }

    // Seed default demo user if none exists
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({
        email: 'deep.patel@charusat.edu.in',
        password: hashedPassword,
        name: 'Deep Patel',
      });
      console.log('👤 Seeded demo user: deep.patel@charusat.edu.in / password123');
    }
  } catch (err) {
    console.warn('⚠️ Seeding note:', err.message);
  }
};

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully to:', MONGO_URI);
    seedDefaultDataIfEmpty();
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

// (E) Authentication Middleware (Verifies JWT from Authorization: Bearer <token>)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 401,
      error: 'Unauthorized',
      message: 'Access denied. Missing or malformed Authorization header. Expected format: Bearer <token>',
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      status: 401,
      error: 'Unauthorized',
      message: err.name === 'TokenExpiredError' ? 'Token expired. Please log in again.' : 'Invalid token signature.',
    });
  }
};

// (F) Server-Side Input Validation Middleware for Tasks
const validateTaskInput = (req, res, next) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: "Server input validation failed: 'title' is required and cannot be empty.",
    });
  }
  next();
};

// Helper: MongoDB ObjectId Validator
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ============================================================================
// 3. PUBLIC AUTHENTICATION ROUTES (Register & Login)
// ============================================================================

// Root welcome & healthcheck route with DB, Auth & Cache info
app.get('/', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  res.status(200).json({
    status: 200,
    message: 'Task Manager REST API with JWT Authentication & In-Memory Caching is running!',
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
    auth: {
      mechanism: 'JWT (JSON Web Token)',
      hashing: 'bcryptjs (salt rounds: 10)',
      expiry: '1 hour',
    },
    caching: {
      engine: 'node-cache',
      stdTTL: '60 seconds',
      invalidation: 'Automatic on POST, PUT, DELETE write operations',
      debugEndpoint: '/cache-stats',
    },
    endpoints: {
      'POST /register': 'Register a new user account (hashes password with bcrypt)',
      'POST /login': 'Login with email & password (returns signed JWT token)',
      'GET /me': 'Retrieve currently authenticated user details (Protected)',
      'GET /tasks': 'Retrieve all tasks (Protected with JWT & cached via node-cache)',
      'GET /tasks/:id': 'Retrieve task by ObjectId (Protected with JWT & cached separately)',
      'POST /tasks': 'Create task with input validation (Protected with JWT & invalidates cache)',
      'PUT /tasks/:id': 'Update task by ObjectId (Protected with JWT & invalidates cache)',
      'DELETE /tasks/:id': 'Delete task by ObjectId (Protected with JWT & invalidates cache)',
      'GET /cache-stats': 'Debug endpoint exposing cache-hit / cache-miss counters (Practical 9)',
      'GET /test-error': 'Deliberately trigger 500 error handler',
    },
  });
});

// Practical 9: Debug endpoint exposing cache-hit / cache-miss counters & stats
app.get('/cache-stats', (req, res) => {
  res.status(200).json({
    status: 200,
    message: 'Practical 9: In-Memory Cache Statistics (node-cache)',
    stats: cache.getHitMissStats(),
  });
});


// 1. POST /register – User registration with bcrypt hashing
app.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: 'Email and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: 'Password must be at least 6 characters long.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: 'An account with this email address already exists.',
      });
    }

    // Hash password with bcrypt before saving to MongoDB
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: cleanEmail,
      password: hashedPassword,
      name: name ? name.trim() : 'Deep Patel',
    });

    res.status(201).json({
      status: 201,
      message: 'User registered successfully.',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 2. POST /login – Authenticate user and issue JWT token
app.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: 'Email and password are required.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({
        status: 401,
        error: 'Unauthorized',
        message: 'Invalid email or password.',
      });
    }

    // Verify password using bcrypt.compare
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: 401,
        error: 'Unauthorized',
        message: 'Invalid email or password.',
      });
    }

    // Sign JWT token with 1 hour expiration
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      status: 200,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    next(err);
  }
});

// 3. GET /me (Supplementary Problem) – Returns logged-in user profile from decoded JWT
app.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: 'User profile not found.',
      });
    }

    res.status(200).json({
      status: 200,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================================
// 4. PROTECTED TASK ROUTES (Requires JWT via authenticateToken middleware)
// ============================================================================

// 1. GET /tasks – Retrieve all tasks (Protected & Cached via node-cache)
app.get('/tasks', authenticateToken, async (req, res, next) => {
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

    // Practical 9: Stable cache key based on query filters
    const hasFilters = Object.keys(filter).length > 0;
    const cacheKey = hasFilters ? `tasks_${JSON.stringify(req.query)}` : 'all_tasks';

    // Step 3: Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      res.set('X-Cache', 'HIT');
      return res.status(200).json(cachedData);
    }

    // Cache Miss -> query MongoDB
    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    const responsePayload = {
      status: 200,
      count: tasks.length,
      data: tasks,
      authenticatedUser: req.user.email,
    };

    // Store in cache with 60 seconds standard TTL
    cache.set(cacheKey, responsePayload);

    res.set('X-Cache', 'MISS');
    res.status(200).json(responsePayload);
  } catch (err) {
    next(err);
  }
});

// 2. GET /tasks/:id – Retrieve task by ID (Protected & Cached separately)
app.get('/tasks/:id', authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: `Invalid task ID format '${id}'. Task ID must be a valid 24-character MongoDB ObjectId.`,
      });
    }

    // Practical 9 Supplementary: Check single-task cache
    const cacheKey = `task_${id}`;
    const cachedTask = cache.get(cacheKey);
    if (cachedTask) {
      res.set('X-Cache', 'HIT');
      return res.status(200).json(cachedTask);
    }

    // Cache Miss -> query MongoDB
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        status: 404,
        error: 'Not Found',
        message: `Task with ID '${id}' not found.`,
      });
    }

    const responsePayload = {
      status: 200,
      data: task,
    };

    // Store in single-task cache with 60s TTL
    cache.set(cacheKey, responsePayload);

    res.set('X-Cache', 'MISS');
    res.status(200).json(responsePayload);
  } catch (err) {
    next(err);
  }
});

// 3. POST /tasks – Create new task (Protected + Input Validation Middleware)
app.post('/tasks', authenticateToken, validateTaskInput, async (req, res, next) => {
  try {
    const { title, description, completed, priority, status } = req.body;

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

    // Practical 9 Step 4: Invalidate cache after successful write
    invalidateTasksCache();

    res.status(201).json({
      status: 201,
      message: 'Task created successfully in MongoDB.',
      data: savedTask,
    });
  } catch (err) {
    next(err);
  }
});

// 4. PUT /tasks/:id – Update task by ID (Protected)
app.put('/tasks/:id', authenticateToken, async (req, res, next) => {
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

    // Practical 9 Step 4: Invalidate all tasks & single task cache after successful write
    invalidateTasksCache(id);

    res.status(200).json({
      status: 200,
      message: 'Task updated successfully in MongoDB.',
      data: updatedTask,
    });
  } catch (err) {
    next(err);
  }
});

// 5. DELETE /tasks/:id – Delete task by ID (Protected)
app.delete('/tasks/:id', authenticateToken, async (req, res, next) => {
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

    // Practical 9 Step 4: Invalidate all tasks & single task cache after successful write
    invalidateTasksCache(id);

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
// 5. 404 & CENTRALIZED ERROR HANDLING MIDDLEWARE
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
app.use((err, req, res, _next) => {
  console.error('[ERROR HANDLER CAUGHT]:', err.name, err.message);

  // Mongoose Schema Validation Error
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

  // Mongoose CastError
  if (err.name === 'CastError') {
    return res.status(400).json({
      status: 400,
      error: 'Bad Request',
      message: `Invalid ${err.kind} value '${err.value}' for field '${err.path}'.`,
    });
  }

  // JWT Token Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      status: 401,
      error: 'Unauthorized',
      message: 'Invalid authorization token.',
    });
  }

  // Default Server Error
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    status: statusCode,
    error: err.name || 'Internal Server Error',
    message: err.message || 'Something went wrong on the server.',
  });
});

// ============================================================================
// 6. SERVER INITIALIZATION
// ============================================================================
const server = app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Task Manager API Server Running on port ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🗄️  MongoDB URI: ${MONGO_URI}`);
  console.log(`🔐 JWT Auth: Enabled (Bearer Token Protected)`);
  console.log(`👨‍💻 Student: Deep Patel (Roll No: 24CS061)`);
  console.log(`🏫 CSPIT, CHARUSAT University`);
  console.log(`====================================================`);
});

module.exports = { app, server, mongoose, cache };
