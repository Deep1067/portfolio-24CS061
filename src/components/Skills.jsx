import styles from './Skills.module.css';

/**
 * Skills – Renders a dynamic list of skills from the `skillList` prop.
 * Props:
 *   skillList {Array<{name: string, level: number, category: string}>}
 *             – Array of skill objects; level is 0–100.
 */
export default function Skills({ skillList }) {
  // Group skills by category
  const categories = skillList.reduce((acc, skill) => {
    const cat = skill.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  return (
    <section id="skills" className={`section ${styles.skills}`}>
      <div className="container">
        <span className="badge">Technical Skills</span>
        <h2 className="section-title">My Skill Set</h2>
        <p className="section-subtitle">Technologies I work with and my proficiency levels</p>

        <div className={styles.categoriesGrid}>
          {Object.entries(categories).map(([category, items]) => (
            <div key={category} className={styles.categoryCard}>
              <h3 className={styles.categoryTitle}>{category}</h3>
              <ul className={styles.skillList}>
                {items.map((skill) => (
                  <li key={skill.name} className={styles.skillItem}>
                    <div className={styles.skillHeader}>
                      <span className={styles.skillName}>{skill.name}</span>
                      <span className={styles.skillLevel}>{skill.level}%</span>
                    </div>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressFill}
                        style={{ width: `${skill.level}%` }}
                        role="progressbar"
                        aria-valuenow={skill.level}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${skill.name} proficiency: ${skill.level}%`}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
