/**
 * Projects.jsx – Practical 3: API Integration and Data Rendering in React
 * Student: Deep Patel  |  Roll No: 24CS061
 * Course:  B.Tech Computer Engineering, CSPIT, CHARUSAT University
 *
 * Requirements fulfilled:
 *  ✅ Fetches live GitHub repositories using useEffect() on mount
 *  ✅ Manages 3 asynchronous states: repos (data), loading, and error
 *  ✅ Renders <Spinner /> while request is in progress
 *  ✅ Renders <ErrorMessage /> with retry button when fetch fails
 *  ✅ Renders repository name, html_url, stars count, language, and description
 *  ✅ Search input to filter repositories dynamically by name
 *  ✅ Preserves Practical 1 & 2 featured project showcase
 */
import { useState, useEffect } from 'react';
import Spinner from './Spinner';
import ErrorMessage from './ErrorMessage';
import styles from './Projects.module.css';

/* GitHub username for Practical 3 REST API */
const GITHUB_USERNAME = 'Deep1067';
const API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`;
const BROKEN_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}_invalid_endpoint_test/repos`;

/* ── Preserved Curated Projects from Practical 1 ── */
const FEATURED_PROJECTS = [
  {
    id: 1,
    title: 'Student Portfolio Website',
    description:
      'A responsive personal portfolio built with Vite + React. Features reusable components, React Router v6 navigation, and dynamic GitHub REST API integration.',
    tags: ['React', 'Vite', 'React Router', 'CSS Modules', 'GitHub API'],
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
      'A full-stack task management tool with user authentication, CRUD operations, and priority-based filtering. Helps students organize their academic workload.',
    tags: ['Node.js', 'Express', 'MongoDB', 'React'],
    status: 'Planned',
    github: 'https://github.com/Deep1067',
    color: '#f43f5e',
  },
];

export default function Projects() {
  // ── Step 1: 3 state variables for data, loading, and error ──
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Supplementary: Search filter & simulated test error state ──
  const [searchTerm, setSearchTerm] = useState('');
  const [simulateError, setSimulateError] = useState(false);

  // ── Fetch function with error handling & loading control ──
  const fetchRepositories = async (forceError = false, extraDelay = 2500) => {
    setLoading(true);
    setError(null);

    const targetUrl = forceError ? BROKEN_API_URL : API_URL;

    try {
      // Artificial delay so the loading spinner is easily visible and captured for lab screenshots
      if (extraDelay > 0) {
        await new Promise((resolve) => setTimeout(resolve, extraDelay));
      }

      const response = await fetch(targetUrl);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`GitHub API Error (404 Not Found): Could not find user '${GITHUB_USERNAME}'.`);
        } else if (response.status === 403) {
          throw new Error('GitHub API rate limit reached (60 requests/hour). Please try again shortly.');
        } else {
          throw new Error(`Failed to fetch repositories (HTTP ${response.status}: ${response.statusText}).`);
        }
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error(data.message || 'Unexpected response received from GitHub API.');
      }

      setRepos(data);
    } catch (err) {
      setError(err.message || 'Network request failed. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: useEffect to fetch data on component mount ──
  useEffect(() => {
    fetchRepositories(simulateError);
  }, [simulateError]);

  // Filtered repositories based on search input (Supplementary Problem)
  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  return (
    <section id="projects" className={`section ${styles.projects}`}>
      <div className="container">
        <span className="badge">GitHub REST API</span>
        <h2 className="section-title">My Projects &amp; Repositories</h2>
        <p className="section-subtitle">
          Dynamically fetched from GitHub API (<code>api.github.com/users/{GITHUB_USERNAME}/repos</code>) using{' '}
          <code>useEffect</code> and managed with reactive states.
        </p>

        {/* ── Toolbar: Search & Action Controls ── */}
        <div className={styles.controlsBar}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search repositories by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading || !!error}
            />
          </div>

          <div className={styles.actionsGroup}>
            {!loading && !error && (
              <span className={styles.countBadge}>
                {filteredRepos.length} of {repos.length} Repos
              </span>
            )}

            <button
              type="button"
              className={styles.actionBtn}
              onClick={() => fetchRepositories(simulateError, 3000)}
              title="Refresh repositories"
              disabled={loading}
            >
              <span>🔄</span> Refresh
            </button>

            {/* Test Error State toggle for lab evaluation (Step 6) */}
            <button
              type="button"
              className={`${styles.actionBtn} ${styles.errorSimBtn}`}
              onClick={() => setSimulateError((prev) => !prev)}
              title="Toggle to simulate broken API URL"
            >
              <span>🧪</span> {simulateError ? 'Switch to Normal API' : 'Simulate API Error'}
            </button>
          </div>
        </div>

        {/* ── Step 3: Conditional Rendering Based on State ── */}
        {loading && <Spinner message={`Fetching repositories for @${GITHUB_USERNAME}...`} />}

        {!loading && error && (
          <ErrorMessage
            message={error}
            onRetry={() => {
              setSimulateError(false);
              fetchRepositories(false);
            }}
          />
        )}

        {!loading && !error && (
          <>
            {filteredRepos.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📂</div>
                <h3>No repositories found</h3>
                <p>No repository matching &quot;{searchTerm}&quot; was found. Try clearing your search.</p>
              </div>
            ) : (
              <div className={styles.grid}>
                {filteredRepos.map((repo) => (
                  <RepoCard key={repo.id} repo={repo} />
                ))}
              </div>
            )}
          </>
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

          {/* Repository star count (Supplementary Problem) */}
          <span className={styles.statItem} title={`${repo.stargazers_count} GitHub Stars`}>
            ⭐ {repo.stargazers_count}
          </span>

          <span className={styles.statItem} title={`${repo.forks_count} Forks`}>
            🍴 {repo.forks_count}
          </span>
        </div>
      </div>

      <div className={styles.cardFooter}>
        {/* Repository html_url link (Problem Statement) */}
        <a
          href={repo.html_url}
          target="_blank"
          rel="noreferrer"
          className={styles.githubLink}
          aria-label={`View ${repo.name} on GitHub`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
          </svg>
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
