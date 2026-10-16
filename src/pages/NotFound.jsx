/**
 * NotFound.jsx – 404 Route Component
 * Practical 2 Supplementary Task: Custom error component for unknown paths.
 */
import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <div className={styles.notFound}>
      <div className={styles.content}>
        <div className={styles.code}>404</div>
        <h1 className={styles.title}>Page Not Found</h1>
        <p className={styles.desc}>
          The page you are looking for does not exist or has been moved. You can navigate back
          to the portfolio using the button below or the navigation bar above.
        </p>
        <Link to="/" className={styles.btn}>
          ← Return to Home
        </Link>
      </div>
    </div>
  );
}
