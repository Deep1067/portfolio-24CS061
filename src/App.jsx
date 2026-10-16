/**
 * App.jsx – Root component for Practical 1: Student Portfolio
 * Student: Deep Patel  |  Roll No: 24CS061
 * Course:  Computer Engineering, CSPIT, CHARUSAT
 *
 * Practical 1 checklist:
 *  ✅ Vite + React scaffold
 *  ✅ Reusable components: Header, About, Skills, Projects, Footer, NavBar
 *  ✅ Props passed to Header (themeColor inline style, name, role…)
 *  ✅ Props passed to About (name, rollNo, course, institute, bio)
 *  ✅ skillList array passed to Skills and rendered dynamically
 *  ✅ NavBar highlights active section via IntersectionObserver
 *  ✅ Projects component with 3 hardcoded sample projects
 *  ✅ .gitignore excludes node_modules (Vite default)
 */

import NavBar   from './components/NavBar';
import Header   from './components/Header';
import About    from './components/About';
import Skills   from './components/Skills';
import Projects from './components/Projects';
import Footer   from './components/Footer';

/* ── Student data ── */
const STUDENT = {
  name:      'Deep Patel',
  rollNo:    '24CS061',
  course:    'B.Tech – Computer Engineering',
  institute: 'CSPIT, CHARUSAT University',
  github:    'https://github.com/Deep1067',
  linkedin:  'https://www.linkedin.com/in/deep-patel-6711aa360/',
};

/* ── Hero theme color (passed as prop → applied as inline style) ── */
const THEME_COLOR = '#6366f1';

/* ── Skill list array (passed as prop to <Skills />) ── */
const SKILL_LIST = [
  // Frontend
  { name: 'HTML5',       level: 90, category: 'Frontend' },
  { name: 'CSS3',        level: 85, category: 'Frontend' },
  { name: 'JavaScript',  level: 80, category: 'Frontend' },
  { name: 'React',       level: 70, category: 'Frontend' },
  // Programming
  { name: 'C / C++',     level: 85, category: 'Programming' },
  { name: 'Python',      level: 75, category: 'Programming' },
  { name: 'Java',        level: 70, category: 'Programming' },
  // Tools
  { name: 'Git & GitHub',level: 80, category: 'Tools & Dev' },
  { name: 'VS Code',     level: 90, category: 'Tools & Dev' },
  { name: 'Vite',        level: 65, category: 'Tools & Dev' },
];

export default function App() {
  return (
    <>
      <NavBar />

      <Header
        name={STUDENT.name}
        role="Computer Engineering Student & Aspiring Web Developer"
        description={`I'm ${STUDENT.name}, a passionate Computer Engineering student at ${STUDENT.institute}.
I love building things for the web, exploring new technologies, and turning ideas into reality through clean, efficient code.`}
        themeColor={THEME_COLOR}
        github={STUDENT.github}
        linkedin={STUDENT.linkedin}
      />

      <About
        name={STUDENT.name}
        rollNo={STUDENT.rollNo}
        course={STUDENT.course}
        institute={STUDENT.institute}
        bio={`Hi there! I'm ${STUDENT.name}, currently pursuing a B.Tech in Computer Engineering at CSPIT, CHARUSAT University (Roll No: ${STUDENT.rollNo}).
My passion lies in web technologies, software development, and solving real-world problems with code.
I enjoy learning by building — every project is an opportunity to grow.
When I'm not coding, you'll find me exploring the latest in tech or collaborating with peers on interesting ideas.`}
      />

      <Skills skillList={SKILL_LIST} />

      <Projects />

      <Footer
        name={STUDENT.name}
        rollNo={STUDENT.rollNo}
        github={STUDENT.github}
        linkedin={STUDENT.linkedin}
      />
    </>
  );
}
