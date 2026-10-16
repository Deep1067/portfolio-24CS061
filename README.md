# portfolio-24CS061

**Student Portfolio** – Deep Patel | Roll No: 24CS061  
B.Tech Computer Engineering, CSPIT, CHARUSAT University  
GitHub: [https://github.com/Deep1067](https://github.com/Deep1067)  
LinkedIn: [https://www.linkedin.com/in/deep-patel-6711aa360/](https://www.linkedin.com/in/deep-patel-6711aa360/)  

---

## Practical 3 – API Integration and Data Rendering in React

**Course:** ITUE301 – Advanced Web Development Frameworks  
**Practical No.:** 3 of 13  
**Objective:** Consume a public REST API in React and manage asynchronous data lifecycle with loading, error, and success states.

### REST API Utilized
- **Endpoint:** `https://api.github.com/users/Deep1067/repos?sort=updated&per_page=100`
- **Method:** `GET`
- **Authentication:** Public unauthenticated endpoint (no API key required)

### Architecture & Data Lifecycle

```
Projects.jsx
  ├── useEffect()               ──> Triggers fetch on component mount ([])
  ├── useState: repos, loading, error, searchTerm, simulateError
  ├── [loading === true]         ──> <Spinner /> component with animated indicator
  ├── [error !== null]          ──> <ErrorMessage message={error} onRetry={fetchRepositories} />
  └── [success (data loaded)]   ──> Dynamic Repository Grid + Search Filter + Curated Projects
```

### Requirements Implemented

| Requirement | Implementation Details | Status |
|---|---|---|
| Asynchronous Data Fetching | `fetch()` called inside `useEffect(() => { ... }, [])` on component mount | ✅ Done |
| Asynchronous State Variables | `repos` (data), `loading` (boolean), `error` (string/null) managed via `useState` | ✅ Done |
| Loading Spinner Component | `<Spinner />` rendered while network request is in progress | ✅ Done |
| Error Message Component | `<ErrorMessage />` rendered if network fails, rate-limited, or endpoint 404s | ✅ Done |
| Essential Data Attributes | Each repo card renders repository `name` and `html_url` link | ✅ Done |
| Retry Mechanism (Supplementary) | Retry button re-executes `fetchRepositories()` directly from error state | ✅ Done |
| Live Search Filter (Supplementary) | Controlled input filters repository list in real time by name | ✅ Done |
| Star & Fork Counts (Supplementary) | Displays `stargazers_count` (⭐) and `forks_count` (🍴) on each card | ✅ Done |
| Error Path Testing Utility | Built-in toggle to test error rendering without code modification | ✅ Done |
| Project Preservation | Preserves curated projects from Practicals 1 & 2 in a dedicated section | ✅ Done |

---

## Practical 2 – State Management and Routing in React

**Course:** ITUE301 – Advanced Web Development Frameworks  
**Practical No.:** 2 of 13  
**Objective:** Implement reactive state management using `useState` and multi-page navigation using React Router v6 in the existing portfolio application.

### Routes Implemented

| Route | Component | Description |
|---|---|---|
| `/` | `Home.jsx` | Landing page rendering `Header`, `About`, and `Skills` components |
| `/projects` | `Projects.jsx` | Projects showcase with live GitHub API repos & curated projects |
| `/contact` | `Contact.jsx` | Controlled contact form with real-time state preview, character counter & help toggle |
| `*` | `NotFound.jsx` | Custom 404 error page for undefined routes with return link |

### State Management (`useState`) Implementations
1. **Controlled Form State (`Contact.jsx`):** Keystrokes bound to `message` state with real-time preview and dynamic character counter.
2. **UI Visibility Toggle (`Contact.jsx`):** `showHelp` boolean state toggling interactive help instructions.
3. **Dark / Light Mode Theme Toggle (`App.jsx` & `NavBar.jsx`):** `darkMode` boolean state applying CSS tokens to root element.

---

## Practical 1 – Vite + React Student Portfolio

**Course:** ITUE301 – Internet Technology (Advanced Web Development Frameworks)  
**Practical No.:** 1 of 13  
**Objective:** Set up a Vite + React project and build a fully component-based personal portfolio.

### Requirements Implemented
- Vite + React scaffold with reusable components: `Header`, `About`, `Skills`, `Projects`, `NavBar`, `Footer`.
- Props passed to multiple components (`themeColor`, `student`, `skillList`).
- Dynamic skill bars and responsive layouts.

---

### Project Structure

```
src/
├── components/
│   ├── About.jsx / About.module.css
│   ├── ErrorMessage.jsx / ErrorMessage.module.css  ← (Practical 3)
│   ├── Footer.jsx / Footer.module.css
│   ├── Header.jsx / Header.module.css
│   ├── NavBar.jsx / NavBar.module.css
│   ├── Projects.jsx / Projects.module.css          ← (Practical 3: GitHub REST API)
│   ├── Skills.jsx / Skills.module.css
│   └── Spinner.jsx / Spinner.module.css            ← (Practical 3)
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
