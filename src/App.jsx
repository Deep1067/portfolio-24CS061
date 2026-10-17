/**
 * App.jsx – Practical 8: Performance Optimization and Lazy Loading in React
 * Student: Deep Patel  |  Roll No: 24CS061
 * Course:  B.Tech Computer Engineering, CSPIT, CHARUSAT University
 *
 * Practical 8 Implementations:
 *  ✅ Route-based code splitting using React.lazy() for all page components
 *  ✅ Suspense wrapper around <Routes> block with custom fallback UI
 *  ✅ Reduced initial bundle size by splitting routes into dynamic asynchronous chunks
 *  ✅ Preserves multi-route navigation, theme state, and full-stack integration
 */
import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import NavBar from './components/NavBar';
import Footer from './components/Footer';

// ── Practical 8: Route-based Code Splitting using React.lazy() ──
const Home = lazy(() => import('./pages/Home'));
const Projects = lazy(() => import('./components/Projects'));
const TaskManager = lazy(() => import('./pages/TaskManager'));
const Contact = lazy(() => import('./pages/Contact'));
const NotFound = lazy(() => import('./pages/NotFound'));

/* ── Student data ── */
const STUDENT = {
  name: 'Deep Patel',
  rollNo: '24CS061',
  course: 'B.Tech – Computer Engineering',
  institute: 'CSPIT, CHARUSAT University',
  github: 'https://github.com/Deep1067',
  linkedin: 'https://www.linkedin.com/in/deep-patel-6711aa360/',
};

/* ── Hero theme accent color ── */
const THEME_COLOR = '#6366f1';

/* ── Skill list array ── */
const SKILL_LIST = [
  { name: 'HTML5', level: 90, category: 'Frontend' },
  { name: 'CSS3', level: 85, category: 'Frontend' },
  { name: 'JavaScript', level: 80, category: 'Frontend' },
  { name: 'React', level: 75, category: 'Frontend' },
  { name: 'C / C++', level: 85, category: 'Programming' },
  { name: 'Python', level: 75, category: 'Programming' },
  { name: 'Java', level: 70, category: 'Programming' },
  { name: 'Git & GitHub', level: 80, category: 'Tools & Dev' },
  { name: 'VS Code', level: 90, category: 'Tools & Dev' },
  { name: 'Vite', level: 70, category: 'Tools & Dev' },
];

/* ── Practical 8: Fallback UI Component for Suspense ── */
function RouteFallback() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '65vh',
        gap: '16px',
      }}
    >
      <div
        style={{
          width: '42px',
          height: '42px',
          border: '3px solid rgba(99, 102, 241, 0.2)',
          borderTopColor: 'var(--color-primary, #6366f1)',
          borderRadius: '50%',
          animation: 'routeSpin 0.75s linear infinite',
        }}
      />
      <p style={{ color: 'var(--color-text-muted, #94a3b8)', fontSize: '0.92rem', fontWeight: 500 }}>
        Loading chunk asynchronously...
      </p>
      <style>{`@keyframes routeSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function App() {
  // Dark / Light Mode Toggle
  const [darkMode, setDarkMode] = useState(true);

  // Sync theme with root HTML element class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <div className={`app-container ${darkMode ? 'dark' : 'light'}`}>
      {/* Navigation bar */}
      <NavBar darkMode={darkMode} onToggle={toggleTheme} />

      {/* Practical 8: Routes wrapped with Suspense and dynamic chunk loading */}
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route
            path="/"
            element={
              <Home
                student={STUDENT}
                themeColor={THEME_COLOR}
                skillList={SKILL_LIST}
              />
            }
          />
          <Route path="/projects" element={<Projects />} />
          <Route path="/tasks" element={<TaskManager />} />
          <Route path="/contact" element={<Contact student={STUDENT} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      {/* Persistent footer */}
      <Footer
        name={STUDENT.name}
        rollNo={STUDENT.rollNo}
        github={STUDENT.github}
        linkedin={STUDENT.linkedin}
      />
    </div>
  );
}
