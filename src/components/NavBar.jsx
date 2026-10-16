/**
 * NavBar.jsx – Practical 2 update
 * Changes from P1:
 *  - <a href> replaced with <Link to> from react-router-dom (no full page reload)
 *  - useLocation() used to highlight the active route
 *  - useState #1: scrolled (glassmorphism on scroll)
 *  - Dark/light theme toggle lives in App.jsx; NavBar receives & fires it via props
 */
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './NavBar.module.css';

const NAV_LINKS = [
  { label: 'Home',     to: '/' },
  { label: 'Projects', to: '/projects' },
  { label: 'Contact',  to: '/contact' },
];

/**
 * Props:
 *   darkMode   {boolean}  – current theme flag
 *   onToggle   {function} – callback to flip theme in App
 */
export default function NavBar({ darkMode, onToggle }) {
  const [scrolled, setScrolled] = useState(false);   // useState #1 (own)
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      {/* Brand */}
      <Link to="/" className={styles.brand} aria-label="Go to home">
        <span className={styles.brandInitial}>DP</span>
        <span className={styles.brandName}>Deep Patel</span>
      </Link>

      {/* Nav links – using <Link> so no full page reload occurs */}
      <ul className={styles.links}>
        {NAV_LINKS.map(({ label, to }) => (
          <li key={to}>
            <Link
              to={to}
              className={`${styles.link} ${isActive(to) ? styles.active : ''}`}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Dark / Light mode toggle (useState lives in App.jsx) */}
      <button
        id="theme-toggle-btn"
        className={styles.themeBtn}
        onClick={onToggle}
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        title={darkMode ? 'Light mode' : 'Dark mode'}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
    </nav>
  );
}
