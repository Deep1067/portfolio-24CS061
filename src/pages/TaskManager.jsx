/**
 * TaskManager.jsx – Practical 7: Authentication & Protected Middleware Pipeline
 * Student: Deep Patel | Roll No: 24CS061 | CHARUSAT / CSPIT
 *
 * Full-stack task management dashboard with JWT Authentication and Protected Routes.
 * Features:
 *  - User registration & login with bcrypt password verification
 *  - JWT token storage and Authorization Bearer header injection
 *  - Protected Task CRUD operations
 *  - Token expiry handling (401 automatic redirect / prompt)
 *  - Logout mechanism clearing client token
 *  - Interactive API console testing 401 Unauthorized, /me, and validation middleware
 */
import { useState, useEffect } from 'react';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  register,
  login,
  logout,
  getMe,
  getToken,
  BASE_URL,
} from '../api';
import styles from './TaskManager.module.css';

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [serverOnline, setServerOnline] = useState(false);
  const [dbInfo, setDbInfo] = useState({ engine: 'MongoDB', odm: 'Mongoose', connected: false });

  // Auth states
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authEmail, setAuthEmail] = useState('deep.patel@charusat.edu.in');
  const [authPassword, setAuthPassword] = useState('password123');
  const [authName, setAuthName] = useState('Deep Patel');
  const [authLoading, setAuthLoading] = useState(false);

  // Task Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [submitting, setSubmitting] = useState(false);

  // Toast notification state
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

  // Fetch tasks for authenticated user
  const loadTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await getTasks();
      setTasks(json.data || []);
      setServerOnline(true);
    } catch (err) {
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        setCurrentUser(null);
        showToast('⚠️ Session expired or unauthorized. Please log in.', 'error');
      } else {
        setError(err.message || 'Failed to fetch tasks.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Verify server status and check logged-in user on mount
  useEffect(() => {
    const init = async () => {
      try {
        const healthRes = await fetch(`${BASE_URL}/`).catch(() => null);
        if (healthRes && healthRes.ok) {
          const healthJson = await healthRes.json();
          setServerOnline(true);
          if (healthJson.database) setDbInfo(healthJson.database);
        } else {
          setServerOnline(false);
        }

        // Check if existing token is valid
        if (getToken()) {
          try {
            const meRes = await getMe();
            setCurrentUser(meRes.user);
            await loadTasks();
          } catch {
            // Token invalid or expired
            setCurrentUser(null);
          }
        }
      } catch (err) {
        setServerOnline(false);
        console.error(err);
      }
    };
    init();
  }, []);

  // Handle Authentication (Login / Register)
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      if (authMode === 'register') {
        await register(authEmail, authPassword, authName);
        showToast('🎉 Registered successfully! Now logging in...', 'success');
        const loginRes = await login(authEmail, authPassword);
        setCurrentUser(loginRes.user);
        await loadTasks();
      } else {
        const loginRes = await login(authEmail, authPassword);
        setCurrentUser(loginRes.user);
        showToast('🔓 Login successful! JWT token saved.', 'success');
        await loadTasks();
      }
    } catch (err) {
      showToast(`❌ Auth error: ${err.message}`, 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    setTasks([]);
    showToast('🔒 Logged out successfully. Token cleared.', 'success');
  };

  // Handle Task Creation with Optimistic UI & JWT Auth
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (!currentUser) {
      showToast('⚠️ Please log in to create tasks.', 'error');
      return;
    }

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

    setTasks((prev) => [optimisticTask, ...prev]);
    setTitle('');
    setDescription('');
    setSubmitting(true);

    try {
      const res = await createTask(newTaskPayload);
      const serverTask = res.data;

      setTasks((prev) =>
        prev.map((t) => (t._id === optimisticId ? serverTask : t))
      );

      showToast('✅ Task saved in MongoDB with JWT authorization!', 'success');
      setTestResult({
        method: 'POST',
        endpoint: '/tasks',
        status: 201,
        statusText: 'Created',
        data: res,
      });
    } catch (err) {
      setTasks((prev) => prev.filter((t) => t._id !== optimisticId));
      showToast(`❌ Create failed: ${err.message}`, 'error');
      if (err.message.includes('401')) {
        setCurrentUser(null);
      }
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
      showToast(`❌ Update failed: ${err.message}`, 'error');
      if (err.message.includes('401')) setCurrentUser(null);
    }
  };

  // Handle Delete with Confirmation Dialog
  const handleDeleteTask = async (task) => {
    const taskId = task._id || task.id;
    const confirmed = window.confirm(
      `Delete task "${task.title}"?\nThis action requires JWT authentication and removes the document from MongoDB.`
    );
    if (!confirmed) return;

    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => (t._id || t.id) !== taskId));
      showToast('🗑️ Task deleted from MongoDB.', 'success');
    } catch (err) {
      showToast(`❌ Delete failed: ${err.message}`, 'error');
      if (err.message.includes('401')) setCurrentUser(null);
    }
  };

  // Interactive Live Endpoint Tester
  const testEndpoint = async (method, path, body = null, useAuth = true) => {
    const headers = { 'Content-Type': 'application/json' };
    if (useAuth && getToken()) {
      headers['Authorization'] = `Bearer ${getToken()}`;
    }

    const options = { method, headers };
    if (body) {
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
          (res.status === 200 ? 'OK' : res.status === 201 ? 'Created' : res.status === 401 ? 'Unauthorized' : 'Error'),
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
        data: { error: err.message },
      });
    }
  };

  return (
    <div className={`section ${styles.taskPage}`}>
      <div className="container">
        <span className="badge">Practical 7: JWT Authentication &amp; Middleware Pipeline</span>
        <h2 className="section-title">Protected Task Management API</h2>
        <p className="section-subtitle">
          Express REST API secured with bcrypt password hashing and JWT token verification middleware.
          All task CRUD operations require a valid <code>Authorization: Bearer &lt;token&gt;</code> header.
        </p>

        {/* ── Toast Notification Banner ── */}
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
            }}
          >
            <span>{toast.text}</span>
            <button
              onClick={() => setToast(null)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1rem' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Status Banner & User Profile Bar ── */}
        <div className={styles.serverStatusBar}>
          <div className={styles.statusIndicator}>
            <span className={serverOnline && dbInfo.connected ? styles.dotOnline : styles.dotOffline} />
            <span>
              Express: {serverOnline ? 'Port 5000 Online' : 'Offline'} &nbsp;|&nbsp;
              MongoDB: {dbInfo.connected ? 'Connected' : 'Disconnected'} &nbsp;|&nbsp;
              Auth: {currentUser ? `👤 ${currentUser.email}` : '🔒 Not Logged In'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {currentUser ? (
              <button
                type="button"
                className={styles.taskActionBtn}
                onClick={handleLogout}
                style={{ borderColor: '#ef4444', color: '#ef4444' }}
              >
                🚪 Logout
              </button>
            ) : (
              <span className={styles.serverCommand}>JWT Auth Active</span>
            )}
            <button
              type="button"
              className={styles.taskActionBtn}
              onClick={loadTasks}
              disabled={!currentUser}
              title="Refresh Tasks"
            >
              🔄 Refresh
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
            ⚠️ {error}
          </div>
        )}

        {/* ── Authentication Section if Not Logged In ── */}
        {!currentUser ? (
          <div className={styles.card} style={{ maxWidth: '480px', margin: '0 auto 36px auto' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '18px' }}>
              <button
                type="button"
                className={styles.actionBtn}
                style={{
                  background: authMode === 'login' ? 'var(--color-primary)' : 'transparent',
                  color: authMode === 'login' ? '#fff' : 'var(--color-text)',
                  borderColor: 'var(--color-primary)',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontWeight: '600',
                }}
                onClick={() => setAuthMode('login')}
              >
                Sign In (Login)
              </button>
              <button
                type="button"
                className={styles.actionBtn}
                style={{
                  background: authMode === 'register' ? 'var(--color-primary)' : 'transparent',
                  color: authMode === 'register' ? '#fff' : 'var(--color-text)',
                  borderColor: 'var(--color-primary)',
                  padding: '6px 16px',
                  borderRadius: '20px',
                  fontWeight: '600',
                }}
                onClick={() => setAuthMode('register')}
              >
                Create Account (Register)
              </button>
            </div>

            <p className={styles.cardSubtitle} style={{ textAlign: 'center' }}>
              {authMode === 'login'
                ? 'Sign in to obtain a JWT token and access protected task routes.'
                : 'Register a new account. Passwords are securely hashed with bcrypt.'}
            </p>

            <form onSubmit={handleAuthSubmit}>
              {authMode === 'register' && (
                <div className={styles.formGroup}>
                  <label className={styles.label}>Full Name</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address</label>
                <input
                  type="email"
                  className={styles.input}
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Password</label>
                <input
                  type="password"
                  className={styles.input}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div style={{ marginTop: '18px' }}>
                <button
                  type="submit"
                  className={styles.submitBtn}
                  style={{ width: '100%' }}
                  disabled={authLoading}
                >
                  {authLoading
                    ? 'Processing...'
                    : authMode === 'login'
                    ? '🔐 Sign In (Get JWT Token)'
                    : '📝 Register & Sign In'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ── Main Protected Task Dashboard ── */
          <div className={styles.layout}>
            {/* ── Left Column: Create Task Form (Protected) ── */}
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Create Task (Protected Route)</h3>
              <p className={styles.cardSubtitle}>
                Sends a <code>POST /tasks</code> with <code>Authorization: Bearer &lt;token&gt;</code>.
                Verified by server auth and input validation middlewares.
              </p>

              <form onSubmit={handleCreateTask}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Task Title * (Required)</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="e.g. Implement JWT Verification Middleware"
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
                    placeholder="Task details and authorization notes..."
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
                      {submitting ? 'Saving...' : '+ Add Protected Task'}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* ── Right Column: Persistent Tasks List ── */}
            <div className={styles.card}>
              <div className={styles.taskCountHeader}>
                <h3 className={styles.cardTitle}>Protected Task Collection</h3>
                <span className={styles.badgePriority}>{tasks.length} Documents</span>
              </div>
              <p className={styles.cardSubtitle}>
                Fetched via <code>GET /tasks</code> using JWT Bearer token authentication.
              </p>

              {loading ? (
                <p style={{ color: 'var(--color-text-muted)' }}>Loading documents from MongoDB with JWT...</p>
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
        )}

        {/* ── Bottom Section: Interactive API Console (Practical 7 Auth Tests) ── */}
        <div className={styles.testerSection}>
          <span className="badge">Interactive API Console</span>
          <h3 className={styles.cardTitle} style={{ fontSize: '1.4rem', marginTop: '8px' }}>
            Authentication &amp; Protected Middleware Console
          </h3>
          <p className={styles.cardSubtitle}>
            Test public auth routes, protected endpoints, and 401 Unauthorized middleware rejections.
          </p>

          <div className={styles.endpointGrid}>
            <button
              type="button"
              className={styles.endpointBtn}
              onClick={() =>
                testEndpoint(
                  'POST',
                  '/login',
                  { email: 'deep.patel@charusat.edu.in', password: 'password123' },
                  false
                )
              }
            >
              <span className={styles.methodPost}>POST</span>
              <span>/login (Obtain JWT)</span>
            </button>

            <button
              type="button"
              className={styles.endpointBtn}
              onClick={() => testEndpoint('GET', '/me', null, true)}
              title="Supplementary 1: Decode JWT and return user details"
            >
              <span className={styles.methodGet}>GET</span>
              <span>/me (Current User Details)</span>
            </button>

            <button
              type="button"
              className={styles.endpointBtn}
              onClick={() => testEndpoint('GET', '/tasks', null, false)}
              title="Tests Auth Middleware: Rejects with 401 when token is missing"
            >
              <span className={styles.methodGet}>GET</span>
              <span>/tasks (No Token → 401)</span>
            </button>

            <button
              type="button"
              className={styles.endpointBtn}
              onClick={() => testEndpoint('GET', '/tasks', null, true)}
              title="Tests Auth Middleware: Accepts valid Bearer token"
            >
              <span className={styles.methodGet}>GET</span>
              <span>/tasks (With Token → 200)</span>
            </button>

            <button
              type="button"
              className={styles.endpointBtn}
              onClick={() =>
                testEndpoint(
                  'POST',
                  '/tasks',
                  { description: 'Missing title field deliberately' },
                  true
                )
              }
              title="Tests Server-Side Input Validation Middleware"
            >
              <span className={styles.methodPost}>POST</span>
              <span>/tasks (Missing Title → 400)</span>
            </button>

            <button
              type="button"
              className={styles.endpointBtn}
              onClick={() =>
                testEndpoint(
                  'POST',
                  '/tasks',
                  { title: 'Auth-Protected Task from Console', priority: 'high' },
                  true
                )
              }
            >
              <span className={styles.methodPost}>POST</span>
              <span>/tasks (Valid Task → 201)</span>
            </button>

            <button
              type="button"
              className={styles.endpointBtn}
              onClick={() => testEndpoint('GET', '/undefined-route-test-404', null, false)}
            >
              <span className={styles.methodGet}>GET</span>
              <span>/undefined (404 Route)</span>
            </button>

            <button
              type="button"
              className={styles.endpointBtn}
              onClick={() => testEndpoint('GET', '/test-error', null, false)}
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
                      : testResult.status === 401
                      ? styles.status415
                      : testResult.status === 404
                      ? styles.status404
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
