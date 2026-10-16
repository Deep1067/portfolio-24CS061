/**
 * App.jsx – Practical 2: State Management and Routing in React
 * Student: Deep Patel  |  Roll No: 24CS061
 * Course:  B.Tech Computer Engineering, CSPIT, CHARUSAT University
 *
 * Practical 2 Checklist:
 *  ✅ BrowserRouter wraps <App /> in main.jsx (only once)
 *  ✅ React Router Routes and Route for client-side SPA navigation
 *  ✅ Route "/" renders Home.jsx
 *  ✅ Route "/projects" renders Projects.jsx
 *  ✅ Route "/contact" renders Contact.jsx with controlled inputs and useState
 *  ✅ Route "*" renders NotFound.jsx (404 custom error component)
 *  ✅ NavBar uses <Link to="..."> components to prevent page reload
 *  ✅ useState hook used for dark/light mode toggle applying class to root
 *  ✅ useState hook used in Contact for message input with real-time preview
 *  ✅ useState hook used in Contact to toggle element visibility (Help banner)
 *  ✅ Live character count displayed below input
 */
import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

import NavBar   from './components/NavBar';
import Footer   from './components/Footer';
import Projects from './components/Projects';

import Home        from './pages/Home';
import Contact     from './pages/Contact';
import TaskManager from './pages/TaskManager';
import NotFound    from './pages/NotFound';

/* ── Student data ── */
const STUDENT = {
  name:      'Deep Patel',
  rollNo:    '24CS061',
  course:    'B.Tech – Computer Engineering',
  institute: 'CSPIT, CHARUSAT University',
  github:    'https://github.com/Deep1067',
  linkedin:  'https://www.linkedin.com/in/deep-patel-6711aa360/',
};

/* ── Hero theme accent color ── */
const THEME_COLOR = '#6366f1';

/* ── Skill list array ── */
const SKILL_LIST = [
  // Frontend
  { name: 'HTML5',       level: 90, category: 'Frontend' },
  { name: 'CSS3',        level: 85, category: 'Frontend' },
  { name: 'JavaScript',  level: 80, category: 'Frontend' },
  { name: 'React',       level: 75, category: 'Frontend' },
  // Programming
  { name: 'C / C++',     level: 85, category: 'Programming' },
  { name: 'Python',      level: 75, category: 'Programming' },
  { name: 'Java',        level: 70, category: 'Programming' },
  // Tools
  { name: 'Git & GitHub',level: 80, category: 'Tools & Dev' },
  { name: 'VS Code',     level: 90, category: 'Tools & Dev' },
  { name: 'Vite',        level: 70, category: 'Tools & Dev' },
];

export default function App() {
  // ── useState: Dark / Light Mode Toggle (Supplementary Task) ──
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
      {/* Navigation bar with React Router Links and Theme Toggle */}
      <NavBar darkMode={darkMode} onToggle={toggleTheme} />

      {/* Routes rendering distinct components without full page reload */}
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

      {/* Persistent footer across routes */}
      <Footer
        name={STUDENT.name}
        rollNo={STUDENT.rollNo}
        github={STUDENT.github}
        linkedin={STUDENT.linkedin}
      />
    </div>
  );
}
