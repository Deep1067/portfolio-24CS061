# portfolio-24CS061

**Student Portfolio** – Deep Patel | Roll No: 24CS061  
B.Tech Computer Engineering, CSPIT, CHARUSAT University  
GitHub: [https://github.com/Deep1067](https://github.com/Deep1067)  
LinkedIn: [https://www.linkedin.com/in/deep-patel-6711aa360/](https://www.linkedin.com/in/deep-patel-6711aa360/)  

---

## Practical 9 – In-Memory Caching and Query Optimization

**Course:** ITUE301 – Advanced Web Development Frameworks  
**Practical No.:** 9 of 13  
**Objective:** Implement server-side in-memory caching using `node-cache` and measure its impact on API response time.  
**CO/PO:** CO2, CO4 / PO3, PO5  

### Architecture & Caching Strategy

```
GET /tasks Request
       │
       ▼
 [Cache Check (node-cache)]
 ├── HIT  (In RAM)   ──> Set header 'X-Cache: HIT'  ──> Return cached JSON immediately (~2-3 ms)
 └── MISS (Not in RAM)──> Query MongoDB ──> Store in cache (TTL: 60s) ──> Set 'X-Cache: MISS' ──> Return data (~15 ms)

Write Operations: POST /tasks, PUT /tasks/:id, DELETE /tasks/:id
       │
       ▼
 [Write to MongoDB] ──> Invalidate cache keys ('all_tasks', 'task_:id') ──> Next read is guaranteed fresh
```

### Empirical Response Time Comparison (Lab Journal Readings)

Measurements recorded via automated benchmark runner across 3 repeated sample runs:

| Sample Run | Uncached / Cache MISS (MongoDB Disk Query) | Cached / Cache HIT (node-cache In-RAM) | Absolute Reduction | Speedup Factor |
|---|---|---|---|---|
| **Reading 1** | 15.16 ms | 3.55 ms | -11.61 ms | **4.3x faster** |
| **Reading 2** | 14.80 ms | 2.72 ms | -12.08 ms | **5.4x faster** |
| **Reading 3** | 16.20 ms | 2.12 ms | -14.08 ms | **7.6x faster** |
| **Average** | **15.39 ms** | **2.80 ms** | **-12.59 ms** | **~5.5x faster** |

### Key Questions & Theoretical Analysis

1. **Why must the cache be invalidated on every write operation, and what would happen to data correctness if it were not?**  
   - When a client creates, modifies, or deletes a resource via `POST`, `PUT`, or `DELETE`, the persistent state in MongoDB updates immediately. If the corresponding cache keys are not invalidated, subsequent `GET` requests would continue returning the stale pre-write snapshot until the TTL expires, leading to data inconsistency, phantom reads, and broken UI state.

2. **What is a reasonable TTL (time-to-live) for cached data in a task management context, and what trade-off does TTL length represent?**  
   - A TTL of **30 to 60 seconds** is reasonable for active collaborative tools, balancing freshness and throughput. TTL represents a fundamental trade-off:
     - **Longer TTL:** Maximizes cache hit ratio, server throughput, and reduces database load, but increases the window during which stale data could persist if an invalidation event is missed.
     - **Shorter TTL:** Guarantees higher freshness and self-healing from invalidation bugs, but generates more frequent cache misses and database read queries.

3. **Why is in-memory caching (node-cache) not suitable for a multi-server/multi-instance deployment, even though it works fine in this lab?**  
   - `node-cache` stores items exclusively in the private heap memory of a single Node.js process. In a horizontally scaled cluster behind a load balancer, each server process maintains its own disconnected cache. An update sent to Server A will only invalidate Server A's local cache; Server B and Server C will continue serving stale data. Distributed production systems therefore use shared out-of-process caching tiers such as **Redis** or **Memcached**.

### Requirements Implemented

| Requirement | Implementation Details | Status |
|---|---|---|
| In-Memory Caching Engine | Installed and configured `node-cache` (`task-manager-api/cache.js`) with 60s standard TTL | ✅ Done |
| All-Tasks Cache | `GET /tasks` checks `all_tasks` cache key, returning `X-Cache: HIT` or querying MongoDB | ✅ Done |
| Cache Invalidation on Writes | `POST /tasks`, `PUT /tasks/:id`, and `DELETE /tasks/:id` invalidate cache keys | ✅ Done |
| Single-Task Caching (Supplementary 1) | `GET /tasks/:id` cached individually under `task_<id>` with targeted invalidation on update/delete | ✅ Done |
| Debug Statistics Endpoint (Supplementary 2) | `GET /cache-stats` exposes real-time hits, misses, hit ratio, and active key counts | ✅ Done |
| Response Header Indicators | `X-Cache: HIT` and `X-Cache: MISS` response headers returned for transparent profiling | ✅ Done |
| Automated Test Suite | `test-api.js` verifying 13 test assertions with 100% pass rate & empirical benchmark output | ✅ Done |

---

## Practical 8 – Performance Optimization and Lazy Loading in React

**Course:** ITUE301 – Advanced Web Development Frameworks  
**Practical No.:** 8 of 13  
**Objective:** Improve frontend performance using lazy loading and code splitting techniques with `React.lazy()` and `Suspense`.  
**CO/PO:** CO1 / PO3, PO5  

### Architecture & Code-Splitting Strategy

```
Before Optimization (Single Monolithic Bundle):
 main.bundle.js (307.7 kB) ──> [Home][Projects][TaskManager][Contact][NotFound] all downloaded upfront

After Optimization (Dynamic Code-Split Chunks):
 index-BiAE4_zp.js   (266.5 kB) ──> Loads initially on entry (core app + vendor libraries)
 Home-Di_OjMi5.js     (6.9 kB)  ──> Loaded only when "/" is navigated
 Projects-Csk_S7cy.js (10.8 kB) ──> Loaded only when "/projects" is navigated
 TaskManager-*.js     (17.1 kB) ──> Loaded only when "/tasks" is navigated
 Contact-DokN2u5e.js  (6.0 kB)  ──> Loaded only when "/contact" is navigated
 PerformanceMetrics-* (3.7 kB)  ──> Component-level chunk loaded on demand (Supplementary)
 NotFound-DJ27384e.js (0.7 kB)  ──> Loaded only when 404 occurs
```

### Before vs After Bundle Comparison (Vite Build)

| Metric | Before Optimization (Monolithic) | After Optimization (Code-Split) | Impact / Benefit |
|---|---|---|---|
| Initial Entry JS Bundle | **307.67 kB** (gzip: 95.63 kB) | **266.49 kB** (gzip: 85.45 kB) | **-41.18 kB reduction (-13.4%)** in initial download |
| Number of JS Chunks | 1 single chunk | 8 discrete chunks | Route code deferred until visited |
| CSS Bundling | 1 monolithic CSS file (31.22 kB) | 6 route-scoped CSS chunks | Styles loaded per route demand |
| Time to Interactive (TTI) | Slower (evaluates all routes) | Faster (evaluates only active route) | Quicker first paint & lower FID |
| Fallback UI | None (blocking) | Polished animated spinner fallback | Smooth visual transition on slow networks |

### Key Questions & Theoretical Analysis

1. **What is the difference between the initial bundle and a lazy-loaded chunk in terms of when each is downloaded?**  
   - The *initial bundle* is loaded and parsed immediately when the user first visits the web application before any screen content can be displayed.
   - A *lazy-loaded chunk* is deferred; the browser only triggers an HTTP request to download the chunk file when the user actually navigates to the associated route or triggers the component.

2. **Why does lazy loading improve perceived performance even though the total amount of code downloaded eventually stays the same?**  
   - Users rarely visit every page in an application during a single session. By only downloading the code necessary for the current view, initial payload transfer size and JavaScript parsing/compilation times decrease drastically, leading to faster First Contentful Paint (FCP) and Time to Interactive (TTI).

3. **In what situations would lazy loading not be worth the added complexity?**  
   - In very small applications (e.g. single landing pages or apps with minimal JS < 50 kB), the network overhead of extra HTTP requests and the visual delay of loading fallbacks can outweigh the tiny bytes saved.

### Requirements Implemented

| Requirement | Implementation Details | Status |
|---|---|---|
| Route-based Lazy Loading | `React.lazy()` applied to `Home`, `Projects`, `TaskManager`, `Contact`, `NotFound` in `App.jsx` | ✅ Done |
| Suspense Fallback UI | Custom `<RouteFallback />` animated spinner component provides smooth visual indicator | ✅ Done |
| Component-Level Lazy Loading (Supplementary 1) | `PerformanceMetricsChart` loaded lazily inside TaskManager on demand | ✅ Done |
| Bundle Measurement & Documentation | Before vs after build metrics captured from Vite production build | ✅ Done |
| Multi-Route Preservation | All previous practical routes and states fully preserved | ✅ Done |

---

## Practical 7 – Authentication and Middleware Pipeline

**Course:** ITUE301 – Advanced Web Development Frameworks  
**Practical No.:** 7 of 13  
**Objective:** Implement JWT-based authentication and input validation as part of the Express middleware pipeline.  
**CO/PO:** CO2, CO6 / PO3, PO5  

### Architecture & Authentication Flow

```
POST /register ──> Hash password with bcrypt (10 rounds) ──> Save User ──> 201 Created
POST /login    ──> Verify password (bcrypt.compare) ──> Sign JWT (1h expiry) ──> Return token

Protected Route Pipeline:
Client Request (Authorization: Bearer <token>)
       │
       ▼
 [1. Request Logger]
       │
       ▼
 [2. CORS Middleware] (allowedHeaders: Content-Type, Authorization)
       │
       ▼
 [3. express.json()]
       │
       ▼
 [4. Content-Type Validator]
       │
       ▼
 [5. Auth Middleware] ──> Verifies JWT token with JWT_SECRET ──> Sets req.user (401 on failure)
       │
       ▼
 [6. Input Validation Middleware] ──> Checks required fields (400 Bad Request on failure)
       │
       ▼
 Controllers (Protected Task CRUD & /me Profile)
```

### Requirements Implemented

| Requirement | Implementation Details | Status |
|---|---|---|
| User Model | Created `models/User.js` with email (unique, lowercase), hashed password, and timestamps | ✅ Done |
| Password Hashing | `bcrypt.hash(password, 10)` before saving user document in MongoDB | ✅ Done |
| JWT Token Generation | `jwt.sign()` on successful login with 1-hour expiry | ✅ Done |
| Auth Middleware | `authenticateToken` extracts and verifies Bearer token, setting `req.user` | ✅ Done |
| Server-Side Input Validation | `validateTaskInput` middleware rejects requests missing required fields with 400 Bad Request | ✅ Done |
| Protected Task Routes | All task CRUD endpoints secured behind `authenticateToken` middleware | ✅ Done |
| /me Endpoint (Supplementary 1) | `GET /me` returns currently authenticated user details from decoded JWT | ✅ Done |
| Frontend 401 Handling (Supplementary 2) | Automatically clears expired tokens and prompts login on 401 response | ✅ Done |
| Client Logout (Supplementary 3) | Logout mechanism clears token from `localStorage` and resets authenticated UI state | ✅ Done |
| Git Deliverables | `JWT_SECRET` stored in `.env` (excluded via `.gitignore`), `.env.example` provided | ✅ Done |
| Automated Verification | `test-api.js` verifying 14 test assertions with 100% pass rate | ✅ Done |

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
