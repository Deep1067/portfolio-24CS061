import styles from './Header.module.css';

/**
 * Header – Hero section of the portfolio.
 * Props:
 *   name        {string}  – Student's full name
 *   role        {string}  – Title / role tagline
 *   description {string}  – Short intro paragraph
 *   themeColor  {string}  – CSS color used as accent for the CTA button (inline style)
 *   github      {string}  – GitHub profile URL
 *   linkedin    {string}  – LinkedIn profile URL
 */
export default function Header({ name, role, description, themeColor, github, linkedin }) {
  return (
    <header id="home" className={styles.hero}>
      {/* Background decorative blobs */}
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <div className={`container ${styles.content}`}>
        <span className="badge">👋 Open to opportunities</span>
        <h1 className={styles.name}>{name}</h1>
        <p className={styles.role}>{role}</p>
        <p className={styles.description}>{description}</p>

        <div className={styles.actions}>
          <a
            href="#projects"
            className={styles.ctaPrimary}
            style={{ backgroundColor: themeColor, boxShadow: `0 0 28px ${themeColor}55` }}
          >
            View Projects
          </a>
          <a href="#contact" className={styles.ctaOutline}>
            Contact Me
          </a>
        </div>

        <div className={styles.socials}>
          {github && (
            <a href={github} target="_blank" rel="noreferrer" className={styles.socialLink} aria-label="GitHub">
              <GitHubIcon />
              GitHub
            </a>
          )}
          {linkedin && (
            <a href={linkedin} target="_blank" rel="noreferrer" className={styles.socialLink} aria-label="LinkedIn">
              <LinkedInIcon />
              LinkedIn
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

/* ── Inline SVG Icons ── */
function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452H17V14.883c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a1.98 1.98 0 0 1-1.979-1.98c0-1.093.887-1.98 1.979-1.98 1.093 0 1.98.887 1.98 1.98a1.98 1.98 0 0 1-1.98 1.98zm1.692 13.019H3.642V9h3.387v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
