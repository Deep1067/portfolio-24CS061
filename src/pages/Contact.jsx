/**
 * Contact.jsx – Practical 2: State Management & Controlled Forms
 * Student: Deep Patel | ID: 24CS061 | CHARUSAT / CSPIT
 *
 * Requirements fulfilled:
 *  ✅ Controlled form inputs using useState
 *  ✅ captures and displays user input in real time (Live Preview card)
 *  ✅ Second useState variable to toggle UI visibility (Help Tooltip banner)
 *  ✅ Live character count displayed below the message input
 *  ✅ Accessible form labels and interactive feedback
 */
import { useState } from 'react';
import styles from './Contact.module.css';

export default function Contact({ student }) {
  // ── useState #1: Controlled input for form message (Lab Step 5) ──
  const [message, setMessage] = useState('');

  // Additional controlled inputs for complete contact functionality
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // ── useState #2: Toggle visibility of an element (Lab Step 6) ──
  const [showHelp, setShowHelp] = useState(false);

  // Form submission feedback state
  const [submitted, setSubmitted] = useState(false);

  const MAX_CHARS = 300;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSubmitted(true);
    setTimeout(() => {
      // Keep message feedback
    }, 4000);
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setMessage('');
    setSubmitted(false);
  };

  return (
    <div className={`section ${styles.contactPage}`}>
      <div className="container">
        <span className="badge">Get in Touch</span>
        <h2 className="section-title">Contact Me</h2>
        <p className="section-subtitle">
          Have an inquiry, project idea, or just want to connect? Send me a message!
        </p>

        {/* ── Toggle UI Visibility via useState (Requirement 6) ── */}
        <button
          type="button"
          className={styles.toggleHelpBtn}
          onClick={() => setShowHelp((prev) => !prev)}
          aria-expanded={showHelp}
        >
          <span>{showHelp ? '✕ Hide Quick Help' : '💡 Need Help? Click for Instructions'}</span>
        </button>

        {showHelp && (
          <div className={styles.helpBox} role="region" aria-label="Quick instructions">
            <p className={styles.helpText}>
              <strong>How this form works:</strong> All inputs use controlled React state. As you type in
              the fields on the left, the <em>Live Real-Time Preview</em> card on the right updates instantly
              without any page refresh or submission delay.
            </p>
          </div>
        )}

        <div className={styles.layout}>
          {/* ── Controlled Input Form ── */}
          <div className={styles.formCard}>
            <h3>Send a Message</h3>
            <p>Fill out the form below. React state captures each keystroke dynamically.</p>

            {submitted && (
              <div className={styles.successBanner} role="alert">
                <span>✅ Thank you, <strong>{name}</strong>! Your message was submitted successfully.</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Name field */}
              <div className={styles.formGroup}>
                <label htmlFor="contact-name" className={styles.label}>
                  Your Name *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  className={styles.input}
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Email field */}
              <div className={styles.formGroup}>
                <label htmlFor="contact-email" className={styles.label}>
                  Email Address
                </label>
                <input
                  id="contact-email"
                  type="email"
                  className={styles.input}
                  placeholder="e.g. john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Message field (Step 5: controlled input tied to useState) */}
              <div className={styles.formGroup}>
                <label htmlFor="contact-message" className={styles.label}>
                  Message *
                </label>
                <textarea
                  id="contact-message"
                  className={styles.textarea}
                  placeholder="Write your message here... Notice the real-time preview updating!"
                  value={message}
                  maxLength={MAX_CHARS}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
                {/* Live Character Count (Supplementary Requirement) */}
                <div className={styles.counterRow}>
                  <span>Live character counter:</span>
                  <span className={message.length >= MAX_CHARS ? styles.counterWarning : ''}>
                    {message.length} / {MAX_CHARS} characters
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className={styles.submitBtn}>
                  Send Message
                </button>
                {(name || email || message) && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className={styles.toggleHelpBtn}
                    style={{ marginTop: '8px' }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* ── Real-Time Display Card (Requirement: display user input in real time) ── */}
          <aside className={styles.previewCard} aria-label="Real-time preview">
            <div className={styles.previewHeader}>
              <h3 className={styles.previewTitle}>
                <span className={styles.liveIndicator} />
                Live State Preview
              </h3>
              <span className={styles.previewBadge}>Reactive UI</span>
            </div>

            <div className={styles.previewField}>
              <div className={styles.previewLabel}>Name:</div>
              <div className={styles.previewValue}>
                {name ? name : <span className={styles.placeholder}>(Awaiting input...)</span>}
              </div>
            </div>

            <div className={styles.previewField}>
              <div className={styles.previewLabel}>Email:</div>
              <div className={styles.previewValue}>
                {email ? email : <span className={styles.placeholder}>(Awaiting input...)</span>}
              </div>
            </div>

            <div className={styles.previewField}>
              <div className={styles.previewLabel}>Message:</div>
              <div className={styles.previewValue} style={{ minHeight: '80px', alignItems: 'flex-start' }}>
                {message ? (
                  message
                ) : (
                  <span className={styles.placeholder}>
                    (Type a message on the left to see live state rendering here...)
                  </span>
                )}
              </div>
            </div>

            <div className={styles.infoCards}>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>👤</span>
                <span>Recipient: {student?.name || 'Deep Patel'} ({student?.rollNo || '24CS061'})</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>🏛️</span>
                <span>{student?.institute || 'CSPIT, CHARUSAT University'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoIcon}>⚡</span>
                <span>Powered by React Router &amp; useState Hook</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
