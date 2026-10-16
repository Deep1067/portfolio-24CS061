/**
 * ErrorMessage.jsx – Practical 3
 * Error state component displayed when API request fails, with retry button.
 */
import styles from './ErrorMessage.module.css';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className={styles.errorCard} role="alert">
      <div className={styles.iconWrapper}>⚠️</div>
      <h3 className={styles.title}>Failed to Load Repositories</h3>
      <p className={styles.message}>{message || 'An unexpected network error occurred.'}</p>
      {onRetry && (
        <button type="button" className={styles.retryBtn} onClick={onRetry}>
          <span>🔄</span> Try Again / Retry Request
        </button>
      )}
    </div>
  );
}
