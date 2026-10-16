import styles from './About.module.css';

/**
 * About – Personal information section.
 * Props:
 *   name      {string}  – Full name
 *   rollNo    {string}  – Student roll number
 *   course    {string}  – Degree / course name
 *   institute {string}  – College / university name
 *   bio       {string}  – Biography paragraph
 */
export default function About({ name, rollNo, course, institute, bio }) {
  return (
    <section id="about" className={`section ${styles.about}`}>
      <div className="container">
        <span className="badge">About Me</span>
        <h2 className="section-title">Who I Am</h2>
        <p className="section-subtitle">A little bit about myself and my background</p>

        <div className={styles.grid}>
          {/* Bio card */}
          <div className={styles.bioCard}>
            <p className={styles.bio}>{bio}</p>
          </div>

          {/* Info card */}
          <div className={styles.infoCard}>
            <h3 className={styles.infoTitle}>Student Info</h3>
            <ul className={styles.infoList}>
              <InfoRow label="Name"      value={name} />
              <InfoRow label="Roll No."  value={rollNo} />
              <InfoRow label="Course"    value={course} />
              <InfoRow label="Institute" value={institute} />
              <InfoRow label="Status"    value="🟢 Available for Projects" />
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoRow({ label, value }) {
  return (
    <li className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue}>{value}</span>
    </li>
  );
}
