# portfolio-24CS061

**Student Portfolio** – Deep Patel | Roll No: 24CS061  
B.Tech Computer Engineering, CSPIT, CHARUSAT University

---

## Practical 1 – Vite + React Student Portfolio

**Course:** ITUE301 – Internet Technology (Advanced Web Development Frameworks)  
**Practical No.:** 1 of 13  
**Objective:** Set up a Vite + React project and build a fully component-based personal portfolio.

### Requirements Implemented

| Requirement | Status |
|---|---|
| Vite + React scaffold | ✅ Done |
| `Header` component with `themeColor` inline style prop | ✅ Done |
| `About` component with `name`, `rollNo`, `course`, `institute` props | ✅ Done |
| `Skills` component – `skillList` array rendered dynamically | ✅ Done |
| `Projects` component with 3 hardcoded sample projects | ✅ Done |
| `NavBar` with active-section highlighting (IntersectionObserver) | ✅ Done |
| `Footer` component with contact section | ✅ Done |
| Props passed to at least 2 components | ✅ Done |
| `.gitignore` excludes `node_modules` | ✅ Done (Vite default) |

### Component Tree

```
App
├── NavBar          (active-section highlight)
├── Header          (props: name, role, description, themeColor, github, linkedin)
├── About           (props: name, rollNo, course, institute, bio)
├── Skills          (props: skillList[])
├── Projects        (hardcoded 3 projects)
└── Footer          (props: name, rollNo, github, linkedin)
```

### Project Structure

```
src/
├── components/
│   ├── NavBar.jsx / NavBar.module.css
│   ├── Header.jsx / Header.module.css
│   ├── About.jsx  / About.module.css
│   ├── Skills.jsx / Skills.module.css
│   ├── Projects.jsx / Projects.module.css
│   └── Footer.jsx / Footer.module.css
├── App.jsx          ← root, passes all props
├── App.css          ← intentionally minimal
├── index.css        ← global design system & tokens
└── main.jsx         ← React DOM entry point
```

### Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

*Future practicals (2–13) will extend this base with routing, state management, API calls, authentication, testing, and deployment.*
