# portfolio-24CS061

**Student Portfolio** – Deep Patel | Roll No: 24CS061  
B.Tech Computer Engineering, CSPIT, CHARUSAT University  
GitHub: [https://github.com/Deep1067](https://github.com/Deep1067)  
LinkedIn: [https://www.linkedin.com/in/deep-patel-6711aa360/](https://www.linkedin.com/in/deep-patel-6711aa360/)  

---

## Practical 6 – Full Stack Integration (React + Node + MongoDB)

**Course:** ITUE301 – Advanced Web Development Frameworks  
**Practical No.:** 6 of 13  
**Objective:** Wire the React frontend to the Node/Express/MongoDB backend into a fully functional full-stack application.  
**CO/PO:** CO1, CO2 / PO3, PO5  

### Architecture & Data Flow

```
React Frontend (localhost:5173)
       │
       ▼ [src/api.js] (getTasks, createTask, updateTask, deleteTask)
Express Backend (localhost:5000) [CORS enabled]
       │
       ▼ Mongoose ODM
MongoDB Database (localhost:27017)
Flow: UI Form ──> POST /tasks ──> MongoDB ──> UI reconciles ──> updated list rendered
```

### Requirements Implemented

| Requirement | Implementation Details | Status |
|---|---|---|
| CORS Configuration | Express server configured with `cors()` middleware on `localhost:5000` | ✅ Done |
| Centralized API Module | `src/api.js` created with `BASE_URL = 'http://localhost:5000'` and CRUD methods | ✅ Done |
| Full-Stack CRUD Flow | End-to-end task creation, viewing, updating, and deleting from React UI to MongoDB | ✅ Done |
| Replace GitHub Repo Data | `Projects.jsx` updated to consume live tasks from `/tasks` endpoint with tab switch | ✅ Done |
| Optimistic UI Update (Supplementary 1) | Shows new task in UI immediately before server confirmation and reconciles with DB ID | ✅ Done |
| Delete Confirmation (Supplementary 2) | Native confirmation dialog (`window.confirm`) prompts before deleting task | ✅ Done |
| Toast Notification (Supplementary 3) | Toast notification component displays real-time success/error feedback | ✅ Done |
| Loading & Error States | Proper spinner and error messaging across all API interactions | ✅ Done |
| Data Persistence | Confirmed data persistence across browser reloads | ✅ Done |

---

## Practical 5 – MongoDB Integration and Schema Design with Mongoose

**Course:** ITUE301 – Advanced Web Development Frameworks  
**Practical No.:** 5 of 13  
**Objective:** Connect a MongoDB database to an Express server and enforce data validation through a Mongoose schema.  
**CO/PO:** CO2, CO3 / PO3, PO5  

### Architecture & Data Flow

```
Express App
    │
    ▼
Mongoose ODM
├── Schema Validation (required title, default values)
├── Supplementary 1: Priority Enum ['low', 'medium', 'high']
├── Supplementary 2: Pre-save Hook (automatically trims title whitespace)
└── Centralized Error Handler (transforms ValidationError into clean structured JSON)
    │
    ▼
MongoDB Database
└── tasks collection { _id, title, description, completed, priority, createdAt }
```

### Requirements Implemented

| Requirement | Implementation Details | Status |
|---|---|---|
| Mongoose & Dotenv Integration | Installed and configured via `npm install mongoose dotenv` and `.env` | ✅ Done |
| MongoDB Connection | `mongoose.connect(process.env.MONGO_URI)` with connection handling and initial seeding | ✅ Done |
| Mongoose Task Schema | Defined in `models/Task.js` with `title` (required), `description`, `completed` (default false), `createdAt` | ✅ Done |
| Model Operations CRUD | In-memory storage replaced with `Task.find()`, `Task.create()`, `Task.findById()`, `Task.findByIdAndUpdate()`, `Task.findByIdAndDelete()` | ✅ Done |
| Priority Enum (Supplementary 1) | `priority` field restricted strictly to `['low', 'medium', 'high']` with schema validator | ✅ Done |
| Pre-Save Hook (Supplementary 2) | Pre-save hook automatically trims leading/trailing whitespace from `title` | ✅ Done |
| 404 Endpoint (Supplementary 3) | `GET /tasks/:id` returns structured 404 JSON response if document is not found, and 400 for malformed ObjectId | ✅ Done |
| Structured Error Handling | Centralized error middleware formats raw Mongoose `ValidationError` & `CastError` into clean JSON | ✅ Done |
| Git Deliverables | `.env` ignored via `.gitignore`, `.env.example` provided | ✅ Done |
| Automated Test Suite | `test-api.js` verifying all 17 test assertions with 100% pass rate | ✅ Done |
| Frontend Portfolio Integration | Updated `/tasks` page in React portfolio showing live MongoDB connection, schema validation, and test console | ✅ Done |

---

## Practical 4 – Building a RESTful API with Node.js and Express

**Course:** ITUE301 – Advanced Web Development Frameworks  
**Practical No.:** 4 of 13  
**Objective:** Design and implement a RESTful backend server with complete CRUD endpoints using an Express middleware pipeline.

### Architecture & Middleware Pipeline

```
Client (Postman / Browser / Thunder Client / React App)
        │
        ▼
  [1. Logging Middleware]                     ──> Logs method, url, timestamp
        │
        ▼
  [2. CORS Middleware]                        ──> Enables cross-origin requests
        │
        ▼
  [3. express.json() Body Parser]             ──> Parses incoming JSON payload
        │
        ▼
  [4. Content-Type Validation Middleware]     ──> Rejects POST/PUT lacking application/json (415)
        │
        ▼
  Express Router
  ├── GET    /tasks                           ──> getAllTasks (200 OK)
  ├── GET    /tasks/:id                       ──> [validateTaskId] ──> getTaskById (200 / 404 / 400)
  ├── POST   /tasks                           ──> createTask (201 Created / 400)
  ├── PUT    /tasks/:id                       ──> [validateTaskId] ──> updateTask (200 / 404 / 400)
  ├── DELETE /tasks/:id                       ──> [validateTaskId] ──> deleteTask (200 / 404)
  └── GET    /test-error                      ──> Deliberately throws error to test 500 handler
        │
        ▼
  [5. 404 Route Not Found Middleware]         ──> Structured JSON for undefined paths (404)
        │
        ▼
  [6. Centralized Global Error Handler]       ──> Last in chain (err, req, res, next) (500)
```

### Requirements Implemented

| Requirement | Implementation Details | Status |
|---|---|---|
| Express Server Setup | Express app configured on port `5000` with `express.json()` | ✅ Done |
| In-Memory Task Storage | In-memory task array supporting title, description, status, priority, timestamps | ✅ Done |
| Global Logging Middleware | Logs method, URL, and ISO timestamp for every incoming request | ✅ Done |
| CRUD Routes | Complete implementation: `GET /tasks`, `GET /tasks/:id`, `POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id` | ✅ Done |
| Status Codes | Proper usage of `200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `415 Unsupported Media Type`, `500 Server Error` | ✅ Done |
| Global Error Handler | 4-argument error middleware defined strictly last in the pipeline | ✅ Done |
| Content-Type Validator (Supplementary) | Custom middleware rejecting POST/PUT without `application/json` header | ✅ Done |
| Route-Specific ID Validator (Supplementary) | Validates that `:id` parameter is a positive integer before controller logic | ✅ Done |
| Structured 404 Handler (Supplementary) | Custom catch-all middleware returning structured JSON for undefined routes | ✅ Done |
| Frontend Integration | Interactive Task Manager & API Console wired at `/tasks` in the portfolio | ✅ Done |
| Automated Test Suite | `test-api.js` verifying all 12 test assertions (100% pass rate) | ✅ Done |

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
