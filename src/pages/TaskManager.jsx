/**
 * TaskManager.jsx – Practical 4: Task Manager REST API Dashboard
 * Student: Deep Patel | Roll No: 24CS061 | CHARUSAT / CSPIT
 *
 * Integrates Practical 4 Node/Express REST API with the React Portfolio.
 * Provides live CRUD operations and an interactive API endpoint inspector.
 */
import { useState, useEffect } from 'react';
import styles from './TaskManager.module.css';

const API_BASE = 'http://localhost:5000';

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverOnline, setServerOnline] = useState(false);
  const [message, setMessage] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');

  // API Tester Console state
  const [testResult, setTestResult] = useState({
    method: 'GET',
    endpoint: '/tasks',
    status: 200,
    statusText: 'OK',
    data: null,
  });

  // Check backend server status & load initial tasks
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/tasks`);
      if (res.ok) {
        const json = await res.json();
        setTasks(json.data || []);
        setServerOnline(true);
      } else {
        setServerOnline(false);
      }
    } catch {
      setServerOnline(false);
      // Fallback local initial data if backend is not yet started in terminal
      setTasks((prev) => (prev.length > 0 ? prev : [
        {
          id: 1,
          title: 'Practical 1: Vite + React Portfolio',
          description: 'Build component-based portfolio with props and styling',
          status: 'Completed',
          priority: 'High',
        },
        {
          id: 2,
          title: 'Practical 2: React Router & useState',
          description: 'Multi-page navigation with controlled forms & theme toggle',
          status: 'Completed',
          priority: 'High',
        },
        {
          id: 3,
          title: 'Practical 3: GitHub REST API Integration',
          description: 'Fetch repositories asynchronously with loading and error states',
          status: 'Completed',
          priority: 'High',
        },
        {
          id: 4,
          title: 'Practical 4: Express REST API',
          description: 'Implement Task Manager backend with custom middleware pipeline',
          status: 'In Progress',
          priority: 'High',
        },
      ]));
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

    const payload = { title: title.trim(), description: description.trim(), priority };

    try {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const json = await res.json();
        setTasks((prev) => [...prev, json.data]);
        setMessage('✅ Task created successfully via POST /tasks (201 Created)!');
      } else {
        // Fallback local update
        const localNew = { id: Date.now(), ...payload, status: 'Pending' };
        setTasks((prev) => [...prev, localNew]);
        setMessage('ℹ️ Task added locally (Start Express server via npm run server for live persistence).');
      }
    } catch {
      const localNew = { id: Date.now(), ...payload, status: 'Pending' };
      setTasks((prev) => [...prev, localNew]);
      setMessage('ℹ️ Task added locally (Express server offline on port 5000).');
    }

    setTitle('');
    setDescription('');
    setTimeout(() => setMessage(''), 4000);
  };

  // Handle Toggle Status (PUT /tasks/:id)
  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === 'Completed' ? 'In Progress' : 'Completed';

    try {
      const res = await fetch(`${API_BASE}/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        const json = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === task.id ? json.data : t)));
      } else {
        setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)));
      }
    } catch {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: nextStatus } : t)));
    }
  };

  // Handle Delete Task (DELETE /tasks/:id)
  const handleDeleteTask = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      } else {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      }
    } catch {
      setTasks((prev) => prev.filter((t) => t.id !== id));
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
        statusText: res.statusText || (res.status === 200 ? 'OK' : res.status === 201 ? 'Created' : 'Error'),
        data,
      });
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

  return (
    <div className={`section ${styles.taskPage}`}>
      <div className="container">
        <span className="badge">Practical 4: Express.js REST API</span>
        <h2 className="section-title">Task Management REST API</h2>
        <p className="section-subtitle">
          Full-stack task manager backed by a Node.js Express server with custom logging, Content-Type
          validator, route-specific ID validation, and centralized error handling middleware.
        </p>

        {/* ── Server Status Banner ── */}
        <div className={styles.serverStatusBar}>
          <div className={styles.statusIndicator}>
            <span className={serverOnline ? styles.dotOnline : styles.dotOffline} />
            <span>
              Backend Server: {serverOnline ? 'Connected to http://localhost:5000' : 'Offline / Standby (Port 5000)'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className={styles.serverCommand}>npm run server</span>
            <button
              type="button"
              className={styles.taskActionBtn}
              onClick={fetchTasks}
              title="Refresh connection to Express API"
            >
              🔄 Check Connection
            </button>
          </div>
        </div>

        {message && (
          <div style={{ marginBottom: '20px', padding: '12px 18px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '8px', color: 'var(--color-primary-light)', fontSize: '0.9rem' }}>
            {message}
          </div>
        )}

        <div className={styles.layout}>
          {/* ── Left Column: Create Task Form (POST /tasks) ── */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Create New Task</h3>
            <p className={styles.cardSubtitle}>
              Sends a <code>POST /tasks</code> request with JSON body. Handled by Express body-parser &amp; custom logging middleware.
            </p>

            <form onSubmit={handleCreateTask}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Task Title *</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Test Express CRUD with Postman"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Description</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Provide task details or implementation notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className={styles.rowInputs}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Priority</label>
                  <select
                    className={styles.select}
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className={styles.formGroup} style={{ justifyContent: 'flex-end' }}>
                  <button type="submit" className={styles.submitBtn}>
                    + Add Task (POST)
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* ── Right Column: Tasks List (GET /tasks, PUT, DELETE) ── */}
          <div className={styles.card}>
            <div className={styles.taskCountHeader}>
              <h3 className={styles.cardTitle}>Tasks List (In-Memory Array)</h3>
              <span className={styles.badgePriority}>{tasks.length} Total</span>
            </div>
            <p className={styles.cardSubtitle}>
              Fetched via <code>GET /tasks</code>. Click status to update (<code>PUT</code>) or trash to delete (<code>DELETE</code>).
            </p>

            {loading ? (
              <p style={{ color: 'var(--color-text-muted)' }}>Loading tasks from Express API...</p>
            ) : tasks.length === 0 ? (
              <p style={{ color: 'var(--color-text-dim)', fontStyle: 'italic' }}>No tasks found in memory.</p>
            ) : (
              <div>
                {tasks.map((task) => (
                  <div key={task.id} className={styles.taskItem}>
                    <div className={styles.taskHeader}>
                      <span className={styles.taskTitle}>
                        #{task.id} {task.title}
                      </span>
                      <span
                        className={`${styles.badgeStatus} ${
                          task.status === 'Completed'
                            ? styles.statusCompleted
                            : task.status === 'In Progress'
                            ? styles.statusInProgress
                            : styles.statusPending
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>

                    {task.description && <p className={styles.taskDesc}>{task.description}</p>}

                    <div className={styles.taskMeta}>
                      <div className={styles.badgesGroup}>
                        <span className={styles.badgePriority}>{task.priority || 'Medium'} Priority</span>
                      </div>

                      <div className={styles.taskActions}>
                        <button
                          type="button"
                          className={styles.taskActionBtn}
                          onClick={() => handleToggleStatus(task)}
                          title="Toggle Status (PUT /tasks/:id)"
                        >
                          {task.status === 'Completed' ? 'Mark In Progress' : 'Mark Completed'}
                        </button>
                        <button
                          type="button"
                          className={`${styles.taskActionBtn} ${styles.deleteBtn}`}
                          onClick={() => handleDeleteTask(task.id)}
                          title="Delete Task (DELETE /tasks/:id)"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom Section: Interactive API Documentation & Endpoint Tester ── */}
        <div className={styles.testerSection}>
          <span className="badge">Interactive Endpoint Tester</span>
          <h3 className={styles.cardTitle} style={{ fontSize: '1.4rem', marginTop: '8px' }}>
            Express Middleware &amp; Endpoint Console
          </h3>
          <p className={styles.cardSubtitle}>
            Click any button below to fire requests directly against the Express backend and observe
            the HTTP status codes, middleware validation, and structured JSON responses in real time.
          </p>

          <div className={styles.endpointGrid}>
            <button
              type="button"
              className={styles.endpointBtn}
              onClick={() => testEndpoint('GET', '/tasks')}
            >
              <span className={styles.methodGet}>GET</span>
              <span>/tasks (All Tasks)</span>
            </button>

            <button
              type="button"
              className={styles.endpointBtn}
              onClick={() => testEndpoint('GET', '/tasks/1')}
            >
              <span className={styles.methodGet}>GET</span>
              <span>/tasks/1 (Task by ID)</span>
            </button>

            <button
              type="button"
              className={styles.endpointBtn}
              onClick={() =>
                testEndpoint('POST', '/tasks', {
                  title: 'Demo Task from Console',
                  description: 'Created via interactive tester',
                  priority: 'High',
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
                testEndpoint('PUT', '/tasks/1', {
                  title: 'Updated Practical 1 Title',
                  status: 'Completed',
                })
              }
            >
              <span className={styles.methodPut}>PUT</span>
              <span>/tasks/1 (200 OK)</span>
            </button>

            <button
              type="button"
              className={styles.endpointBtn}
              onClick={() => testEndpoint('DELETE', '/tasks/5')}
            >
              <span className={styles.methodDelete}>DELETE</span>
              <span>/tasks/5 (200 OK)</span>
            </button>

            {/* Validation & Middleware Error Tests */}
            <button
              type="button"
              className={styles.endpointBtn}
              onClick={() => testEndpoint('GET', '/tasks/invalid_id_abc')}
              title="Tests Route-Specific ID Validation Middleware"
            >
              <span className={styles.methodGet}>GET</span>
              <span>/tasks/invalid (400 Bad ID)</span>
            </button>

            <button
              type="button"
              className={styles.endpointBtn}
              onClick={() => testEndpoint('POST', '/tasks', { title: 'No Type Header' }, { 'Content-Type': 'text/plain' })}
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
              title="Tests Global Error Handling Middleware"
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
                <span>{testResult.method} {testResult.endpoint}</span>
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
