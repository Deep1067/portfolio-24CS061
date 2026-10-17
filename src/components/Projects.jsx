/**
 * Projects.jsx – Practical 6 / Practical 3: Full-Stack Integration & API Rendering
 * Student: Deep Patel  |  Roll No: 24CS061
 * Course:  B.Tech Computer Engineering, CSPIT, CHARUSAT University
 *
 * Requirements fulfilled:
 *  ✅ Step 3: Replaces GitHub fetch logic with calls to your own /tasks endpoint via api.js
 *  ✅ Manages 3 asynchronous states: tasks/repos (data), loading, and error
 *  ✅ Renders <Spinner /> while request is in progress
 *  ✅ Renders <ErrorMessage /> with retry button when fetch fails
 *  ✅ Allows switching between Practical 6 Backend MongoDB Tasks and Practical 3 GitHub Repos
 *  ✅ Preserves Practical 1 & 2 featured project showcase
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getTasks } from '../api';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import styles from './Projects.module.css';

/* GitHub username for Practical 3 fallback view */
const GITHUB_USERNAME = 'Deep1067';
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`;

/* ── Preserved Curated Projects from Practical 1 & 2 ── */
const FEATURED_PROJECTS = [
  {
    id: 1,
    title: 'Student Portfolio Website',
    description:
      'A responsive personal portfolio built with Vite + React. Features reusable components, React Router v6 navigation, and dynamic REST API integration.',
    tags: ['React', 'Vite', 'React Router', 'CSS Modules'],
    status: 'Completed',
    github: 'https://github.com/Deep1067/portfolio-24CS061',
    color: '#6366f1',
  },
  {
    id: 2,
    title: 'Weather Dashboard',
    description:
      'A real-time weather application that consumes a public REST API to display current conditions, temperature, humidity, and a 5-day forecast for any city.',
    tags: ['JavaScript', 'REST API', 'HTML', 'CSS'],
    status: 'In Progress',
    github: 'https://github.com/Deep1067',
    color: '#22d3ee',
  },
  {
    id: 3,
    title: 'Task Manager App',
    description:
      'A full-stack task management tool with Node.js Express, MongoDB, and React. Supports full CRUD operations, optimistic UI, and schema validation.',
    tags: ['Node.js', 'Express', 'MongoDB', 'React'],
    status: 'Completed',
    github: 'https://github.com/Deep1067',
    color: '#10b981',
  },
];

export default function Projects() {
  // Data Source: 'tasks' (Practical 6 Backend API) vs 'github' (Practical 3 Public API)
  const [dataSource, setDataSource] = useState('tasks');

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data depending on active tab
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (dataSource === 'tasks') {
        // Practical 6: Fetch from own Node/Express + MongoDB backend
        const res = await getTasks();
        setItems(res.data || []);
      } else {
        // Practical 3: Fetch from GitHub REST API
        const response = await fetch(GITHUB_API_URL);
        if (!response.ok) {
          throw new Error(`GitHub API Error (HTTP ${response.status}: ${response.statusText})`);
        }
        const data = await response.json();
        setItems(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError(
        dataSource === 'tasks'
          ? `Could not connect to Express backend (localhost:5000). Ensure 'npm run server' is running. (${err.message})`
          : err.message || 'Failed to fetch repositories.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dataSource]);

  // Search filtering
  const filteredItems = items.filter((item) => {
    const name = item.title || item.name || '';
    const desc = item.description || '';
    const query = searchTerm.toLowerCase().trim();
    return name.toLowerCase().includes(query) || desc.toLowerCase().includes(query);
  });

  return (
    <section id="projects" className={`section ${styles.projects}`}>
      <div className="container">
        <span className="badge">
          {dataSource === 'tasks' ? 'Practical 6: Full Stack Integration' : 'Practical 3: GitHub REST API'}
        </span>
        <h2 className="section-title">
          {dataSource === 'tasks' ? 'Live MongoDB Tasks (Backend API)' : 'My GitHub Repositories'}
        </h2>
        <p className="section-subtitle">
          {dataSource === 'tasks' ? (
            <>
              Live tasks consumed directly from your Express + MongoDB backend (<code>localhost:5000/tasks</code>) via{' '}
              <code>src/api.js</code>.
            </>
          ) : (
            <>
              Dynamically fetched from GitHub public REST API (<code>api.github.com/users/{GITHUB_USERNAME}/repos</code>).
            </>
          )}
        </p>

        {/* ── Practical 6 Tab Switcher ── */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '24px' }}>
          <button
            type="button"
            className={styles.actionBtn}
            style={{
              background: dataSource === 'tasks' ? 'var(--color-primary)' : 'var(--color-surface)',
              color: dataSource === 'tasks' ? '#fff' : 'var(--color-text)',
              borderColor: dataSource === 'tasks' ? 'var(--color-primary)' : 'var(--color-border)',
              padding: '8px 16px',
              borderRadius: '20px',
              fontWeight: 600,
            }}
            onClick={() => setDataSource('tasks')}
          >
            🚀 Backend MongoDB Tasks (P6)
          </button>
          <button
            type="button"
            className={styles.actionBtn}
            style={{
              background: dataSource === 'github' ? 'var(--color-primary)' : 'var(--color-surface)',
              color: dataSource === 'github' ? '#fff' : 'var(--color-text)',
              borderColor: dataSource === 'github' ? 'var(--color-primary)' : 'var(--color-border)',
              padding: '8px 16px',
              borderRadius: '20px',
              fontWeight: 600,
            }}
            onClick={() => setDataSource('github')}
          >
            🐙 GitHub Repositories (P3)
          </button>
        </div>

        {/* ── Toolbar: Search & Action Controls ── */}
        <div className={styles.controlsBar}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder={dataSource === 'tasks' ? 'Search backend tasks...' : 'Search repositories...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading || !!error}
            />
          </div>

          <div className={styles.actionsWrapper}>
            <button
              type="button"
              className={styles.actionBtn}
              onClick={fetchData}
              disabled={loading}
              title="Re-fetch from API"
            >
              🔄 Refresh
            </button>
            {dataSource === 'tasks' && (
              <Link to="/tasks" className={styles.actionBtn} style={{ textDecoration: 'none' }}>
                ✏️ Open Task Manager
              </Link>
            )}
          </div>
        </div>

        {/* ── Conditional Rendering ── */}
        {loading && <Spinner message={dataSource === 'tasks' ? 'Fetching tasks from MongoDB...' : 'Fetching repositories from GitHub...'} />}

        {!loading && error && <ErrorMessage message={error} onRetry={fetchData} />}

        {!loading && !error && filteredItems.length === 0 && (
          <div className={styles.emptyState}>
            <p className={styles.emptyText}>No matching items found.</p>
          </div>
        )}

        {!loading && !error && filteredItems.length > 0 && (
          <div className={styles.grid}>
            {filteredItems.map((item) =>
              dataSource === 'tasks' ? (
                <TaskCard key={item._id || item.id} task={item} />
              ) : (
                <RepoCard key={item.id} repo={item} />
              )
            )}
          </div>
        )}

        {/* ── Preserved Practical 1 & 2 Featured Projects ── */}
        <div className={styles.featuredSection}>
          <div className={styles.featuredHeader}>
            <h3 className={styles.featuredTitle}>Curated Academic Projects</h3>
            <p className={styles.featuredSubtitle}>
              Core course milestones preserved from Practical 1 &amp; 2
            </p>
          </div>

          <div className={styles.grid}>
            {FEATURED_PROJECTS.map((project) => (
              <FeaturedCard key={project.id} project={project} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Backend Task Card (Practical 6) ── */
function TaskCard({ task }) {
  const isDone = task.completed === true || task.status === 'Completed';

  return (
    <article className={styles.card}>
      <div className={styles.cardAccent} style={{ background: isDone ? '#10b981' : '#f59e0b' }} />

      <div className={styles.cardBody}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>{task.title}</h3>
          <span
            className={styles.statusBadge}
            style={{
              background: isDone ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              color: isDone ? '#34d399' : '#fbbf24',
            }}
          >
            {isDone ? 'Completed' : 'Pending'}
          </span>
        </div>

        <p className={styles.cardDesc}>{task.description || 'No description provided.'}</p>

        <div className={styles.statsRow}>
          <span className={styles.langBadge}>
            <span
              className={styles.langDot}
              style={{ background: task.priority === 'high' ? '#f43f5e' : task.priority === 'low' ? '#22c55e' : '#38bdf8' }}
            />
            Priority: {task.priority ? task.priority.toUpperCase() : 'MEDIUM'}
          </span>
          {task.createdAt && (
            <span className={styles.statItem}>
              📅 {new Date(task.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <div className={styles.cardFooter}>
        <Link to="/tasks" className={styles.githubLink} style={{ textDecoration: 'none' }}>
          Manage in Task Manager →
        </Link>
      </div>
    </article>
  );
}

/* ── GitHub API Repository Card Component ── */
function RepoCard({ repo }) {
  const formattedDate = repo.updated_at
    ? new Date(repo.updated_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  return (
    <article className={styles.card}>
      <div className={styles.cardAccent} />

      <div className={styles.cardBody}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>{repo.name}</h3>
        </div>

        <p className={styles.cardDesc}>
          {repo.description || 'No description provided for this GitHub repository.'}
        </p>

        <div className={styles.statsRow}>
          {repo.language && (
            <span className={styles.langBadge}>
              <span className={styles.langDot} />
              {repo.language}
            </span>
          )}

          <span className={styles.statItem} title={`${repo.stargazers_count} GitHub Stars`}>
            ⭐ {repo.stargazers_count}
          </span>

          <span className={styles.statItem} title={`${repo.forks_count} Forks`}>
            🍴 {repo.forks_count}
          </span>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <a
          href={repo.html_url}
          target="_blank"
          rel="noreferrer"
          className={styles.githubLink}
          aria-label={`View ${repo.name} on GitHub`}
        >
          View on GitHub
        </a>
        {formattedDate && <span className={styles.updatedText}>Updated {formattedDate}</span>}
      </div>
    </article>
  );
}

/* ── Featured Curated Project Card Component ── */
function FeaturedCard({ project }) {
  const statusClasses = {
    Completed: styles.statusCompleted,
    'In Progress': styles.statusInProgress,
    Planned: styles.statusPlanned,
  };

  return (
    <article className={styles.card}>
      <div className={styles.cardAccent} style={{ background: project.color }} />

      <div className={styles.cardBody}>
        <div className={styles.cardHeader}>
          <h4 className={styles.cardTitle}>{project.title}</h4>
          <span className={`${styles.statusBadge} ${statusClasses[project.status] || ''}`}>
            {project.status}
          </span>
        </div>

        <p className={styles.cardDesc}>{project.description}</p>

        <div className={styles.tagList}>
          {project.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.cardFooter}>
        <a
          href={project.github}
          target="_blank"
          rel="noreferrer"
          className={styles.githubLink}
        >
          View Source
        </a>
      </div>
    </article>
  );
}
