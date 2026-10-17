/**
 * TaskManager.jsx – Practical 5: MongoDB Integration & Schema Design with Mongoose
 * Student: Deep Patel | Roll No: 24CS061 | CHARUSAT / CSPIT
 *
 * Integrates Practical 5 Node/Express REST API backed by MongoDB & Mongoose.
 * Features:
 *  - Live MongoDB CRUD operations
 *  - Mongoose Schema Validation demonstration (required fields, enum restriction)
 *  - Pre-save hook whitespace trimming
 *  - Structured JSON validation responses
 *  - Interactive API Endpoint Console
 */
import { useState, useEffect } from 'react';
import styles from './TaskManager.module.css';

const API_BASE = 'http://localhost:5000';

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverOnline, setServerOnline] = useState(false);
  const [dbInfo, setDbInfo] = useState({ engine: 'MongoDB', odm: 'Mongoose', connected: false });
  const [message, setMessage] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');

  // API Tester Console state
  const [testResult, setTestResult] = useState({
    method: 'GET',
    endpoint: '/tasks',
    status: 200,
    statusText: 'OK',
    data: null,
  });

  // Check backend server status, database info & load initial tasks
  const fetchTasks = async () => {
    setLoading(true);
    try {
      // 1. Fetch Root / Healthcheck for DB Info
      const rootRes = await fetch(`${API_BASE}/`);
      if (rootRes.ok) {
        const rootJson = await rootRes.json();
        setServerOnline(true);
        if (rootJson.database) {
          setDbInfo(rootJson.database);
        }
      } else {
        setServerOnline(false);
      }

      // 2. Fetch Tasks from MongoDB
      const res = await fetch(`${API_BASE}/tasks`);
      if (res.ok) {
        const json = await res.json();
        setTasks(json.data || []);
      } else {
        setTasks([]);
      }
    } catch {
      setServerOnline(false);
      setDbInfo({ engine: 'MongoDB', odm: 'Mongoose', connected: false });
      // Fallback local preview data if server is offline
      setTasks((prev) =>
        prev.length > 0
          ? prev
          : [
              {
                _id: '67b000000000000000000001',
                id: '67b000000000000000000001',
                title: 'Practical 1: Vite + React Portfolio',
                description: 'Component-based portfolio with props and styling',
                completed: true,
                priority: 'high',
                status: 'Completed',
              },
              {
                _id: '67b000000000000000000002',
                id: '67b000000000000000000002',
                title: 'Practical 2: React Router & useState',
                description: 'Multi-route SPA navigation, controlled form, theme state',
                completed: true,
                priority: 'high',
                status: 'Completed',
              },
              {
                _id: '67b000000000000000000003',
                id: '67b00000000000000000003',
                title: 'Practical 3: GitHub REST API Integration',
                description: 'Asynchronous repository fetching with spinner & error states',
                completed: true,
                priority: 'high',
                status: 'Completed',
              },
              {
                _id: '67b000000000000000000004',
                id: '67b00000000000000000004',
                title: 'Practical 4: Express RESTful API',
                description: 'CRUD backend with request logging & content-type middleware',
                completed: true,
                priority: 'high',
                status: 'Completed',
              },
              {
                _id: '67b000000000000000000005',
                id: '67b000000000000000000005',
                title: 'Practical 5: MongoDB & Mongoose Integration',
                description: 'Mongoose schema validation, pre-save hook, and structured errors',
                completed: false,
                priority: 'high',
                status: 'Pending',
              },
            ]
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Handle Create Task (POST /tasks)
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      description: description.trim(),
      priority,
      completed: false,
    };

    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (res.ok) {
        setTasks((prev) => [json.data, ...prev]);
        setMessage('✅ Task created and saved in MongoDB (201 Created)!');
        setTestResult({
          method: 'POST',
          endpoint: '/tasks',
          status: res.status,
          statusText: 'Created',
          data: json,
        });
      } else {
        setMessage(`❌ Validation error: ${json.message || 'Failed to save'}`);
        setTestResult({
          method: 'POST',
          endpoint: '/tasks',
          status: res.status,
          statusText: 'Validation Error',
          data: json,
        });
      }
    } catch {
      const localId = `local_${Date.now()}`;
      const localNew = { _id: localId, id: localId, ...payload, status: 'Pending' };
      setTasks((prev) => [localNew, ...prev]);
      setMessage('ℹ️ Express server offline. Task added to local state.');
    }

    setTitle('');
    setDescription('');
    setTimeout(() => setMessage(''), 4500);
  };

  // Handle Toggle Status (PUT /tasks/:id)
  const handleToggleStatus = async (task) => {
    const taskId = task._id || task.id;
    const nextCompleted = !task.completed;

    try {
      const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: nextCompleted }),
      });

      if (res.ok) {
        const json = await res.json();
        setTasks((prev) =>
          prev.map((t) => ((t._id || t.id) === taskId ? json.data : t))
        );
      } else {
        setTasks((prev) =>
          prev.map((t) =>
            (t._id || t.id) === taskId
              ? { ...t, completed: nextCompleted, status: nextCompleted ? 'Completed' : 'Pending' }
              : t
          )
        );
      }
    } catch {
      setTasks((prev) =>
        prev.map((t) =>
          (t._id || t.id) === taskId
            ? { ...t, completed: nextCompleted, status: nextCompleted ? 'Completed' : 'Pending' }
            : t
        )
      );
    }
  };

  // Handle Delete Task (DELETE /tasks/:id)
  const handleDeleteTask = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => (t._id || t.id) !== id));
      } else {
        setTasks((prev) => prev.filter((t) => (t._id || t.id) !== id));
      }
    } catch {
      setTasks((prev) => prev.filter((t) => (t._id || t.id) !== id));
    }
  };

  // Interactive Live Endpoint Tester
  const testEndpoint = async (method, path, body = null, customHeaders = {}) => {
    const headers = { ...customHeaders };
    const options = { method, headers };

    if (body) {
      if (headers['Content-Type'] === undefined && !headers['omit-type']) {
        headers['Content-Type'] = 'application/json';
      }
      options.body = typeof body === 'object' ? JSON.stringify(body) : body;
    }

    try {
      const res = await fetch(`${API_BASE}${path}`, options);
      let data = null;
      try {
        data = await res.json();
      } catch {
        data = await res.text();
      }

      setTestResult({
        method,
        endpoint: path,
        status: res.status,
        statusText:
          res.statusText ||
          (res.status === 200 ? 'OK' : res.status === 201 ? 'Created' : res.status === 400 ? 'Bad Request' : 'Error'),
        data,
      });

      // If GET /tasks was clicked, refresh tasks list
      if (method === 'GET' && path === '/tasks' && res.ok && data.data) {
        setTasks(data.data);
      }
    } catch (err) {
      setTestResult({
        method,
        endpoint: path,
        status: 'Offline / Network Error',
        statusText: 'Could not connect to http://localhost:5000',
        data: { error: err.message, hint: 'Start backend in terminal: npm run server' },
      });
    }
  };

  const firstTaskId = tasks.length > 0 ? (tasks[0]._id || tasks[0].id) : '67b000000000000000000001';

  return (
    <div className={`section ${styles.taskPage}`}>
      <div className="container">
        <span className="badge">Practical 5: MongoDB &amp; Mongoose</span>
        <h2 className="section-title">MongoDB Integration &amp; Schema Design</h2>
        <p className="section-subtitle">
          Express REST API connected to MongoDB database with Mongoose ODM. Enforces strict schema validation,
          pre-save title whitespace trimming, enum restrictions, and clean structured JSON error responses.
        </p>

        {/* ── Server & Database Status Banner ── */}
        <div className={styles.serverStatusBar}>
          <div className={styles.statusIndicator}>
            <span className={serverOnline && dbInfo.connected ? styles.dotOnline : styles.dotOffline} />
            <span>
              Express Server: {serverOnline ? 'Online (Port 5000)' : 'Offline / Standby'} &nbsp;|&nbsp;
              Database: {dbInfo.connected ? `MongoDB (${dbInfo.odm} Connected)` : 'Disconnected / Standby'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className={styles.serverCommand}>npm run server</span>
            <button
              type="button"
              className={styles.taskActionBtn}
              onClick={fetchTasks}
              title="Refresh connection to Express API & MongoDB"
            >
              🔄 Refresh Connection
            </button>
          </div>
        </div>

        {message && (
          <div
            style={{
              marginBottom: '20px',
              padding: '12px 18px',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '8px',
              color: 'var(--color-primary-light)',
              fontSize: '0.9rem',
            }}
          >
            {message}
          </div>
        )}

        <div className={styles.layout}>
          {/* ── Left Column: Create Task Form (POST /tasks) ── */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Create Task (Mongoose Validation)</h3>
            <p className={styles.cardSubtitle}>
              Sends a <code>POST /tasks</code> request. Enforces <code>title</code> required constraint,
              <code>priority</code> enum validation, and pre-save trimming.
            </p>

            <form onSubmit={handleCreateTask}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Task Title * (Required, Pre-save Trimmed)</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Design Mongoose Task Schema"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Description</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Enter task details, notes, or implementation references..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className={styles.rowInputs}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Priority (Enum: low, medium, high)</label>
                  <select
                    className={styles.select}
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className={styles.formGroup} style={{ justifyContent: 'flex-end' }}>
                  <button type="submit" className={styles.submitBtn}>
                    + Save to MongoDB
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* ── Right Column: Tasks List (GET /tasks from MongoDB) ── */}
          <div className={styles.card}>
            <div className={styles.taskCountHeader}>
              <h3 className={styles.cardTitle}>Tasks in MongoDB Collection</h3>
              <span className={styles.badgePriority}>{tasks.length} Documents</span>
            </div>
            <p className={styles.cardSubtitle}>
              Retrieved via <code>Task.find()</code> from MongoDB. Updates and deletes run against the live database.
            </p>

            {loading ? (
              <p style={{ color: 'var(--color-text-muted)' }}>Loading documents from MongoDB...</p>
            ) : tasks.length === 0 ? (
              <p style={{ color: 'var(--color-text-dim)', fontStyle: 'italic' }}>No documents found in tasks collection.</p>
            ) : (
              <div>
                {tasks.map((task) => {
                  const id = task._id || task.id;
                  const isDone = task.completed === true || task.status === 'Completed';
                  const priorityVal = task.priority ? task.priority.toUpperCase() : 'MEDIUM';

                  return (
                    <div key={id} className={styles.taskItem}>
                      <div className={styles.taskHeader}>
                        <span className={styles.taskTitle}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                            [{String(id).slice(-6)}]
                          </span>{' '}
                          {task.title}
                        </span>
                        <span
                          className={`${styles.badgeStatus} ${
                            isDone ? styles.statusCompleted : styles.statusPending
                          }`}
                        >
                          {isDone ? 'Completed' : 'Pending'}
                        </span>
                      </div>

                      {task.description && <p className={styles.taskDesc}>{task.description}</p>}

                      <div className={styles.taskMeta}>
                        <div className={styles.badgesGroup}>
                          <span className={styles.badgePriority}>{priorityVal}</span>
                          {task.createdAt && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                              {new Date(task.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>

                        <div className={styles.taskActions}>
                          <button
                            type="button"
                            className={styles.taskActionBtn}
                            onClick={() => handleToggleStatus(task)}
                            title="Toggle Completed (PUT /tasks/:id)"
                          >
                            {isDone ? 'Mark Pending' : 'Mark Completed'}
                          </button>
                          <button
                            type="button"
                            className={`${styles.taskActionBtn} ${styles.deleteBtn}`}
                            onClick={() => handleDeleteTask(id)}
                            title="Delete Document (DELETE /tasks/:id)"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom Section: Interactive API Documentation & Endpoint Tester ── */}
        <div className={styles.testerSection}>
          <span className="badge">Interactive API Console</span>
          <h3 className={styles.cardTitle} style={{ fontSize: '1.4rem', marginTop: '8px' }}>
            MongoDB &amp; Mongoose Endpoint Inspector
          </h3>
          <p className={styles.cardSubtitle}>
            Test Mongoose schema validation, pre-save hook trimming, enum constraints, and 404 responses
            directly against the live Express server.
          </p>

          <div className={styles.endpointGrid}>
            <button
              type="button"
              className={styles.endpointBtn}
              onClick={() => testEndpoint('GET', '/tasks')}
            >
              <span className={styles.methodGet}>GET</span>
              <span>/tasks (All Documents)</span>
            </button>

            <button
              type="button"
              className={styles.endpointBtn}
              onClick={() => testEndpoint('GET', `/tasks/${firstTaskId}`)}
            >
              <span className={styles.methodGet}>GET</span>
              <span>/tasks/:id (Valid ObjectId)</span>
            </button>

            <button
              type="button"
              className={styles.endpointBtn}
              onClick={() =>
                testEndpoint('POST', '/tasks', {
                  title: 'New Task via API Console',
                  description: 'Persisted to MongoDB collection',
                  priority: 'high',
                  completed: false,
                })
              }
            >
              <span className={styles.methodPost}>POST</span>
              <span>/tasks (201 Created)</span>
            </button>

            <button
              type="button"
              className={styles.endpointBtn}
              onClick={() =>
                testEndpoint('POST', '/tasks', {
                  title: '   Untrimmed Title With Extra Spaces   ',
                  description: 'Tests pre-save hook trimming',
                  priority: 'low',
                })
              }
              title="Supplementary 2: Pre-save hook trims title whitespace"
            >
              <span className={styles.methodPost}>POST</span>
              <span>/tasks (Pre-save Trim Test)</span>
            </button>

            {/* Validation Error: Missing Title */}
            <button
              type="button"
              className={styles.endpointBtn}
              onClick={() =>
                testEndpoint('POST', '/tasks', {
                  description: 'Missing title field deliberately',
                })
              }
              title="Schema Validation: required title constraint"
            >
              <span className={styles.methodPost}>POST</span>
              <span>/tasks (400 Missing Title)</span>
            </button>

            {/* Validation Error: Invalid Priority Enum */}
            <button
              type="button"
              className={styles.endpointBtn}
              onClick={() =>
                testEndpoint('POST', '/tasks', {
                  title: 'Invalid Priority Enum Test',
                  priority: 'urgent',
                })
              }
              title="Supplementary 1: Enum validation ['low', 'medium', 'high']"
            >
              <span className={styles.methodPost}>POST</span>
              <span>/tasks (400 Invalid Enum)</span>
            </button>

            <button
              type="button"
              className={styles.endpointBtn}
              onClick={() =>
                testEndpoint('PUT', `/tasks/${firstTaskId}`, {
                  title: 'Updated Task Title via Mongoose',
                  completed: true,
                  priority: 'medium',
                })
              }
            >
              <span className={styles.methodPut}>PUT</span>
              <span>/tasks/:id (200 OK)</span>
            </button>

            <button
              type="button"
              className={styles.endpointBtn}
              onClick={() => testEndpoint('GET', '/tasks/507f1f77bcf86cd799439011')}
              title="Supplementary 3: Non-existent ObjectId returns 404 JSON"
            >
              <span className={styles.methodGet}>GET</span>
              <span>/tasks/non-existent (404 JSON)</span>
            </button>

            <button
              type="button"
              className={styles.endpointBtn}
              onClick={() => testEndpoint('GET', '/tasks/malformed_id_123')}
              title="Tests ObjectId format validator"
            >
              <span className={styles.methodGet}>GET</span>
              <span>/tasks/malformed (400 Bad ID)</span>
            </button>

            <button
              type="button"
              className={styles.endpointBtn}
              onClick={() =>
                testEndpoint(
                  'POST',
                  '/tasks',
                  { title: 'No Content-Type Header' },
                  { 'Content-Type': 'text/plain' }
                )
              }
              title="Tests Content-Type Validation Middleware"
            >
              <span className={styles.methodPost}>POST</span>
              <span>/tasks (415 Media Type)</span>
            </button>

            <button
              type="button"
              className={styles.endpointBtn}
              onClick={() => testEndpoint('GET', '/undefined-route-test-404')}
              title="Tests 404 Route Not Found Middleware"
            >
              <span className={styles.methodGet}>GET</span>
              <span>/undefined (404 Not Found)</span>
            </button>

            <button
              type="button"
              className={styles.endpointBtn}
              onClick={() => testEndpoint('GET', '/test-error')}
              title="Tests Centralized Error Handling Middleware"
            >
              <span className={styles.methodGet}>GET</span>
              <span>/test-error (500 Error)</span>
            </button>
          </div>

          {/* Console Output Display */}
          <div className={styles.consoleBox}>
            <div className={styles.consoleHeader}>
              <div>
                <strong>RESPONSE: </strong>
                <span>
                  {testResult.method} {testResult.endpoint}
                </span>
              </div>
              <div>
                STATUS:{' '}
                <span
                  className={
                    testResult.status === 200
                      ? styles.status200
                      : testResult.status === 201
                      ? styles.status201
                      : testResult.status === 400
                      ? styles.status400
                      : testResult.status === 404
                      ? styles.status404
                      : testResult.status === 415
                      ? styles.status415
                      : styles.status500
                  }
                >
                  {testResult.status} {testResult.statusText}
                </span>
              </div>
            </div>

            <pre style={{ margin: 0, overflow: 'auto' }}>
              {JSON.stringify(testResult.data, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
