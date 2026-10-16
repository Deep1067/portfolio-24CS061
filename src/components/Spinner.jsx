/**
 * Spinner.jsx – Practical 3
 * Loading state spinner displayed while asynchronous REST API fetch is in progress.
 */
import styles from './Spinner.module.css';

export default function Spinner({ message = 'Fetching repositories from GitHub API...' }) {
  return (
    <div className={styles.spinnerWrapper} role="status" aria-live="polite">
      <div className={styles.spinner} />
      <p className={styles.spinnerText}>{message}</p>
      <p className={styles.spinnerSubtext}>Connecting to api.github.com...</p>
    </div>
  );
}
