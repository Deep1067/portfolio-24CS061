import styles from './Projects.module.css';

/**
 * Projects – Displays a hardcoded list of 3 sample projects.
 * (Future practicals will make this dynamic.)
 */

const PROJECTS = [
  {
    id: 1,
    title: 'Student Portfolio Website',
    description:
      'A responsive personal portfolio built with Vite + React. Features reusable components, prop-driven data, and a dynamic skills section. This very project!',
    tags: ['React', 'Vite', 'CSS Modules', 'JavaScript'],
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
    github: '#',
    color: '#22d3ee',
  },
  {
    id: 3,
    title: 'Task Manager App',
    description:
      'A full-stack task management tool with user authentication, CRUD operations, and priority-based filtering. Helps students organize their academic workload.',
    tags: ['Node.js', 'Express', 'MongoDB', 'React'],
    status: 'Planned',
    github: '#',
    color: '#f43f5e',
  },
];

const STATUS_MAP = {
  Completed:   { label: 'Completed',   className: styles.statusCompleted },
  'In Progress': { label: 'In Progress', className: styles.statusInProgress },
  Planned:     { label: 'Planned',     className: styles.statusPlanned },
};

export default function Projects() {
  return (
    <section id="projects" className={`section ${styles.projects}`}>
      <div className="container">
        <span className="badge">Portfolio</span>
        <h2 className="section-title">My Projects</h2>
        <p className="section-subtitle">Things I have built and am currently working on</p>

        <div className={styles.grid}>
          {PROJECTS.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectCard({ project }) {
  const { label, className } = STATUS_MAP[project.status] || STATUS_MAP.Planned;

  return (
    <article className={styles.card}>
      {/* Accent top bar */}
      <div className={styles.cardAccent} style={{ background: project.color }} />

      <div className={styles.cardBody}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>{project.title}</h3>
          <span className={`${styles.statusBadge} ${className}`}>{label}</span>
        </div>
        <p className={styles.cardDesc}>{project.description}</p>

        <div className={styles.tags}>
          {project.tags.map((tag) => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>
      </div>

      <div className={styles.cardFooter}>
        <a
          href={project.github}
          target="_blank"
          rel="noreferrer"
          className={styles.githubLink}
          aria-label={`View ${project.title} on GitHub`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
          </svg>
          View on GitHub
        </a>
      </div>
    </article>
  );
}
