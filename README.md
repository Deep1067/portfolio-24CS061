# portfolio-24CS061

**Student Portfolio** – Deep Patel | Roll No: 24CS061  
B.Tech Computer Engineering, CSPIT, CHARUSAT University  
GitHub: [https://github.com/Deep1067](https://github.com/Deep1067)  
LinkedIn: [https://www.linkedin.com/in/deep-patel-6711aa360/](https://www.linkedin.com/in/deep-patel-6711aa360/)  

---

## Practical 2 – State Management and Routing in React

**Course:** ITUE301 – Advanced Web Development Frameworks  
**Practical No.:** 2 of 13  
**Objective:** Implement reactive state management using `useState` and multi-page navigation using React Router v6 in the existing portfolio application.

### Routes Implemented

| Route | Component | Description |
|---|---|---|
| `/` | `Home.jsx` | Landing page rendering `Header`, `About`, and `Skills` components |
| `/projects` | `Projects.jsx` | Standalone projects showcase with 3 sample projects & tags |
| `/contact` | `Contact.jsx` | Controlled contact form with real-time state preview, character counter & help toggle |
| `*` | `NotFound.jsx` | Custom 404 error page for undefined routes with return link |

### State Management (`useState`) Implementations

1. **Controlled Form State (`Contact.jsx`):**
   - `message` state captures user input and binds to the textarea via `value` and `onChange`.
   - Real-time display updates the preview card synchronously with every keystroke without page reloads.
   - Live character counter calculates and displays `{message.length} / 300` characters dynamically.
2. **UI Visibility Toggle (`Contact.jsx`):**
   - `showHelp` boolean state toggles an interactive help banner/tooltip.
3. **Dark / Light Mode Theme Toggle (`App.jsx` & `NavBar.jsx`):**
   - `darkMode` boolean state toggles a `.light` / `.dark` CSS class on the root element.
   - Smoothly transitions color palettes across all components via CSS custom properties.

### Architecture / Component Tree

```
BrowserRouter (main.jsx)
└── App.jsx (theme state, routes container)
    ├── NavBar.jsx (<Link> navigation, theme toggle button)
    ├── Routes
    │   ├── Route: "/"          ──> Home.jsx (Header, About, Skills)
    │   ├── Route: "/projects" ──> Projects.jsx
    │   ├── Route: "/contact"  ──> Contact.jsx (controlled form, useState, live preview)
    │   └── Route: "*"          ──> NotFound.jsx (404 custom error page)
    └── Footer.jsx (persistent footer)
```

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
| `NavBar` with navigation links | ✅ Done |
| `Footer` component with contact section | ✅ Done |
| Props passed to at least 2 components | ✅ Done |
| `.gitignore` excludes `node_modules` | ✅ Done (Vite default) |

---

### Project Structure

```
src/
├── components/
│   ├── About.jsx / About.module.css
│   ├── Footer.jsx / Footer.module.css
│   ├── Header.jsx / Header.module.css
│   ├── NavBar.jsx / NavBar.module.css
│   ├── Projects.jsx / Projects.module.css
│   └── Skills.jsx / Skills.module.css
├── pages/
│   ├── Contact.jsx / Contact.module.css
│   ├── Home.jsx
│   └── NotFound.jsx / NotFound.module.css
├── App.css
├── App.jsx          ← React Router configuration & theme state
├── index.css        ← Design system tokens (dark & light mode)
└── main.jsx         ← BrowserRouter wrapper & React entry point
```

### Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.
