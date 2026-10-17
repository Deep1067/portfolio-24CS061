/**
 * TaskManager.jsx – Practical 6: Full Stack Integration (React + Node + MongoDB)
 * Student: Deep Patel | Roll No: 24CS061 | CHARUSAT / CSPIT
 *
 * Full-stack task management dashboard consuming backend API through centralized api.js.
 * Features:
 *  - End-to-end CRUD synchronized with MongoDB database
 *  - Centralized api.js service methods (getTasks, createTask, updateTask, deleteTask)
 *  - Supplementary 1: Optimistic UI updates on task creation (reconciled on confirmation)
 *  - Supplementary 2: Confirmation dialog before deleting tasks
 *  - Supplementary 3: Toast notification system for success and error feedback
 *  - Live API testing console demonstrating CORS, validation, and error states
 */
import { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask, BASE_URL } from '../api';
import styles from './TaskManager.module.css';

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverOnline, setServerOnline] = useState(false);
  const [dbInfo, setDbInfo] = useState({ engine: 'MongoDB', odm: 'Mongoose', connected: false });

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);

  // Toast notification state (Supplementary Problem 3)
  const [toast, setToast] = useState(null);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => {
      setToast((current) => (current && current.text === text ? null : current));
    }, 4000);
  };

  // API Tester Console state
  const [testResult, setTestResult] = useState({
    method: 'GET',
    endpoint: '/tasks',
    status: 200,
    statusText: 'OK',
    data: null,
  });

  // Fetch tasks from MongoDB via centralized api.js
  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      // Check healthcheck
      const healthRes = await fetch(`${BASE_URL}/`).catch(() => null);
      if (healthRes && healthRes.ok) {
        const healthJson = await healthRes.json();
        setServerOnline(true);
        if (healthJson.database) setDbInfo(healthJson.database);
      } else {
        setServerOnline(false);
      }

      const json = await getTasks();
      setTasks(json.data || []);
      setServerOnline(true);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend.');
      setServerOnline(false);
      setDbInfo({ engine: 'MongoDB', odm: 'Mongoose', connected: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Handle Task Creation with Optimistic UI (Supplementary Problem 1)
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const optimisticId = `opt_${Date.now()}`;
    const newTaskPayload = {
      title: title.trim(),
      description: description.trim(),
      priority,
      completed: false,
    };

    const optimisticTask = {
      _id: optimisticId,
      id: optimisticId,
      ...newTaskPayload,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    // 1. Optimistic update: show immediately in UI before server confirms
    setTasks((prev) => [optimisticTask, ...prev]);
    setTitle('');
    setDescription('');
    setSubmitting(true);

    try {
      // 2. Perform write operation to MongoDB via api.js
      const res = await createTask(newTaskPayload);
      const serverTask = res.data;

      // 3. Reconcile optimistic item with persisted document from database
      setTasks((prev) =>
        prev.map((t) => (t._id === optimisticId ? serverTask : t))
      );

      showToast('✅ Task successfully created and saved in MongoDB!', 'success');
      setTestResult({
        method: 'POST',
        endpoint: '/tasks',
        status: 201,
        statusText: 'Created',
        data: res,
      });
    } catch (err) {
      // Rollback optimistic update on failure
      setTasks((prev) => prev.filter((t) => t._id !== optimisticId));
      showToast(`❌ Create failed: ${err.message}`, 'error');
      setTestResult({
        method: 'POST',
        endpoint: '/tasks',
        status: 400,
        statusText: 'Error',
        data: { error: err.message },
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Toggle Status (PUT /tasks/:id)
  const handleToggleStatus = async (task) => {
    const taskId = task._id || task.id;
    const nextCompleted = !task.completed;

    try {
      const res = await updateTask(taskId, { completed: nextCompleted });
      const updated = res.data;

      setTasks((prev) =>
        prev.map((t) => ((t._id || t.id) === taskId ? updated : t))
      );
      showToast(
        `✏️ Task marked as ${nextCompleted ? 'Completed' : 'Pending'}!`,
        'success'
      );
    } catch (err) {
      showToast(`❌ Failed to update task: ${err.message}`, 'error');
    }
  };

  // Handle Delete with Confirmation Dialog (Supplementary Problem 2)
  const handleDeleteTask = async (task) => {
    const taskId = task._id || task.id;

    // Confirmation dialog before deleting
    const confirmed = window.confirm(
      `Are you sure you want to delete task:\n"${task.title}"?\n\nThis will remove the document permanently from MongoDB.`
    );
    if (!confirmed) return;

    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => (t._id || t.id) !== taskId));
      showToast('🗑️ Task deleted from MongoDB database.', 'success');
    } catch (err) {
      showToast(`❌ Delete failed: ${err.message}`, 'error');
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
      const res = await fetch(`${BASE_URL}${path}`, options);
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

      if (method === 'GET' && path === '/tasks' && res.ok && data.data) {
        setTasks(data.data);
      }
    } catch (err) {
      setTestResult({
        method,
        endpoint: path,
        status: 'Network Error',
        statusText: 'Could not connect to Express server',
        data: { error: err.message, hint: 'Start backend in terminal: npm run server' },
      });
    }
  };

  const firstTaskId = tasks.length > 0 ? (tasks[0]._id || tasks[0].id) : '67b000000000000000000001';

  return (
    <div className={`section ${styles.taskPage}`}>
      <div className="container">
        <span className="badge">Practical 6: Full Stack Integration</span>
        <h2 className="section-title">Full Stack Task Management App</h2>
        <p className="section-subtitle">
          React SPA on <code>localhost:5173</code> integrated with Express REST API on <code>localhost:5000</code> and MongoDB database.
          Features centralized <code>api.js</code> service, optimistic UI updates, confirmation dialogs, and toast notifications.
        </p>

        {/* ── Toast Notification Banner (Supplementary 3) ── */}
        {toast && (
          <div
            style={{
              position: 'fixed',
              top: '24px',
              right: '24px',
              zIndex: 9999,
              padding: '14px 22px',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '0.92rem',
              color: '#ffffff',
              background: toast.type === 'error' ? '#ef4444' : '#10b981',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              animation: 'fadeIn 0.3s ease',
            }}
          >
            <span>{toast.text}</span>
            <button
              onClick={() => setToast(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '1rem',
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Server & Database Status Banner ── */}
        <div className={styles.serverStatusBar}>
          <div className={styles.statusIndicator}>
            <span className={serverOnline && dbInfo.connected ? styles.dotOnline : styles.dotOffline} />
            <span>
              Express Server: {serverOnline ? 'Online (Port 5000)' : 'Offline / Standby'} &nbsp;|&nbsp;
              Database: {dbInfo.connected ? `MongoDB (${dbInfo.odm} Connected)` : 'Standby / Disconnected'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className={styles.serverCommand}>npm run server</span>
            <button
              type="button"
              className={styles.taskActionBtn}
              onClick={loadTasks}
              title="Refresh connection & reload tasks"
            >
              🔄 Refresh Tasks
            </button>
          </div>
        </div>

        {error && (
          <div
            style={{
              marginBottom: '20px',
              padding: '12px 18px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              color: '#f87171',
              fontSize: '0.9rem',
            }}
          >
            ⚠️ {error} &nbsp;—&nbsp; Ensure Express server is running on port 5000 (<code>npm run server</code>).
          </div>
        )}

        <div className={styles.layout}>
          {/* ── Left Column: Create Task Form with Optimistic UI ── */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Create New Task</h3>
            <p className={styles.cardSubtitle}>
              Sends a <code>POST /tasks</code> via <code>api.createTask()</code>. Features optimistic UI: task appears immediately before server confirmation.
            </p>

            <form onSubmit={handleCreateTask}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Task Title * (Required)</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="e.g. Verify Full Stack Integration"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Description</label>
                <textarea
                  className={styles.textarea}
                  placeholder="Enter task details, notes, or implementation specifics..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  disabled={submitting}
                />
              </div>

              <div className={styles.rowInputs}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Priority</label>
                  <select
                    className={styles.select}
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    disabled={submitting}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className={styles.formGroup} style={{ justifyContent: 'flex-end' }}>
                  <button type="submit" className={styles.submitBtn} disabled={submitting}>
                    {submitting ? 'Saving...' : '+ Add Task (Optimistic)'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* ── Right Column: Persistent Tasks List ── */}
          <div className={styles.card}>
            <div className={styles.taskCountHeader}>
              <h3 className={styles.cardTitle}>Tasks in MongoDB Collection</h3>
              <span className={styles.badgePriority}>{tasks.length} Total</span>
            </div>
            <p className={styles.cardSubtitle}>
              Data persisted in MongoDB. Click button to update (<code>PUT</code>) or trash to delete (<code>DELETE</code> with confirmation dialog).
            </p>

            {loading ? (
              <p style={{ color: 'var(--color-text-muted)' }}>Loading documents from MongoDB via api.js...</p>
            ) : tasks.length === 0 ? (
              <p style={{ color: 'var(--color-text-dim)', fontStyle: 'italic' }}>
                No tasks found. Use the form on the left to add your first task!
              </p>
            ) : (
              <div>
                {tasks.map((task) => {
                  const id = task._id || task.id;
                  const isDone = task.completed === true || task.status === 'Completed';
                  const priorityVal = task.priority ? task.priority.toUpperCase() : 'MEDIUM';

                  return (
                    <div
                      key={id}
                      className={styles.taskItem}
                      style={task.isOptimistic ? { opacity: 0.65, borderStyle: 'dashed' } : {}}
                    >
                      <div className={styles.taskHeader}>
                        <span className={styles.taskTitle}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                            [{String(id).slice(-6)}]
                          </span>{' '}
                          {task.title}
                          {task.isOptimistic && (
                            <span style={{ fontSize: '0.72rem', color: '#fbbf24', marginLeft: '6px' }}>
                              (syncing...)
                            </span>
                          )}
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
                            onClick={() => handleDeleteTask(task)}
                            title="Delete Task with Confirmation (DELETE /tasks/:id)"
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

        {/* ── Bottom Section: Interactive API Console ── */}
        <div className={styles.testerSection}>
          <span className="badge">Interactive API Console</span>
          <h3 className={styles.cardTitle} style={{ fontSize: '1.4rem', marginTop: '8px' }}>
            Full-Stack HTTP Communication Console
          </h3>
          <p className={styles.cardSubtitle}>
            Fire requests directly against the Express backend on <code>localhost:5000</code> to observe CORS headers,
            Mongoose schema validation, and structured JSON responses.
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
              <span>/tasks/:id (Task by ID)</span>
            </button>

            <button
              type="button"
              className={styles.endpointBtn}
              onClick={() =>
                testEndpoint('POST', '/tasks', {
                  title: 'Full Stack Integration Task',
                  description: 'Created via console button',
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
                testEndpoint('PUT', `/tasks/${firstTaskId}`, {
                  title: 'Updated Task via Console',
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
              onClick={() =>
                testEndpoint('POST', '/tasks', {
                  description: 'Missing title field deliberately',
                })
              }
            >
              <span className={styles.methodPost}>POST</span>
              <span>/tasks (400 Missing Title)</span>
            </button>

            <button
              type="button"
              className={styles.endpointBtn}
              onClick={() =>
                testEndpoint('POST', '/tasks', {
                  title: 'Invalid Priority Enum',
                  priority: 'urgent',
                })
              }
            >
              <span className={styles.methodPost}>POST</span>
              <span>/tasks (400 Invalid Enum)</span>
            </button>

            <button
              type="button"
              className={styles.endpointBtn}
              onClick={() => testEndpoint('GET', '/tasks/507f1f77bcf86cd799439011')}
            >
              <span className={styles.methodGet}>GET</span>
              <span>/tasks/non-existent (404)</span>
            </button>

            <button
              type="button"
              className={styles.endpointBtn}
              onClick={() => testEndpoint('GET', '/undefined-route-test-404')}
            >
              <span className={styles.methodGet}>GET</span>
              <span>/undefined (404 Route)</span>
            </button>

            <button
              type="button"
              className={styles.endpointBtn}
              onClick={() => testEndpoint('GET', '/test-error')}
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
