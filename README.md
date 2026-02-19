# Task Management System — kdoddapaneni-319db7ef-d180-4846-bf8a-c23e71d54a8d

A secure, full-stack Task Management System built with NestJS, Angular, and SQLite in an NX monorepo. Features JWT authentication and role-based access control (RBAC).

## Setup Instructions

### Prerequisites
- Node.js v18+
- npm v9+

### Installation
```bash
npm install
```

### Environment Configuration
Create a `.env` file in the root:
```
JWT_SECRET=super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
DB_PATH=./taskdb.sqlite
```

### Running the Applications
Start the backend (runs on http://localhost:3000):
```bash
npx nx serve api
```

Start the frontend (runs on http://localhost:4200):
```bash
npx nx serve dashboard
```

---

## Architecture Overview

### NX Monorepo Layout
```
apps/
  api/          → NestJS backend (REST API, JWT auth, RBAC, TypeORM)
  dashboard/    → Angular frontend (login, task dashboard)
libs/
  data/         → Shared TypeScript interfaces and enums (ITask, IUser, Role, TaskStatus)
  auth/         → Shared RBAC logic (hasRequiredRole, canModifyTask)
```

The monorepo structure allows shared code between backend and frontend via `@org/data` and `@org/auth` packages. This ensures type safety across the entire stack — if a data shape changes, both apps are updated automatically.

---

## Data Model

### Entities

**User**
- id, email, password (bcrypt hashed), role (owner/admin/viewer), organizationId

**Task**
- id, title, description, status (todo/in_progress/done), category (work/personal/other), order, organizationId, createdById

**Organization**
- id, name, parentId (supports 2-level hierarchy)

**AuditLog**
- id, userId, action, resource, resourceId, createdAt

### ERD
```
Organization (1) ──── (many) User
Organization (1) ──── (many) Task
User (1) ──── (many) Task [createdById]
User (1) ──── (many) AuditLog
```

---

## Access Control Implementation

### Roles
| Role   | Can Do |
|--------|--------|
| Owner  | Full access — create, read, update, delete all tasks in org, view audit logs |
| Admin  | Same as Owner |
| Viewer | Can only create tasks and view/edit their own tasks, no audit log access |

### Role Hierarchy
```
Owner (3) > Admin (2) > Viewer (1)
```

### How it works
1. User logs in → receives JWT token containing `{ id, email, role, organizationId }`
2. Every protected request includes the token in the `Authorization: Bearer <token>` header
3. `JwtAuthGuard` verifies the token on every request
4. `JwtStrategy` extracts user info from the token and attaches it to `req.user`
5. Service methods check role using `canModifyTask()` from `@org/auth` before allowing mutations
6. Task visibility is scoped to the user's `organizationId` — users cannot see tasks from other organizations

---

## API Documentation

### Auth Endpoints

**POST /auth/register**
```json
Request:  { "email": "user@test.com", "password": "pass123", "role": "owner", "organizationId": 1 }
Response: { "message": "User created successfully" }
```

**POST /auth/login**
```json
Request:  { "email": "user@test.com", "password": "pass123" }
Response: { "access_token": "eyJhbG..." }
```

### Task Endpoints (all require Authorization header)

**POST /tasks**
```json
Request:  { "title": "My task", "description": "Details", "category": "work" }
Response: { "id": 1, "title": "My task", "status": "todo", ... }
```

**GET /tasks**
```json
Response: [{ "id": 1, "title": "My task", "status": "todo", ... }]
```

**PUT /tasks/:id**
```json
Request:  { "status": "in_progress" }
Response: { "id": 1, "status": "in_progress", ... }
```

**DELETE /tasks/:id**
```json
Response: { "message": "Task deleted" }
```

**GET /audit-log** (Owner and Admin only)
```json
Response: [{ "userId": 1, "action": "CREATE", "resource": "task", "resourceId": 1, "createdAt": "..." }]
```

---

## Testing
```bash
# Run backend tests
npx nx test api

# Run frontend tests
npx nx test dashboard
```

---

## Tradeoffs & Unfinished Areas

- **SQLite** was used instead of PostgreSQL for simplicity. Production would use PostgreSQL.
- **Foreign key constraints** were removed from entities to simplify SQLite setup. Production would enforce these.
- **Organization creation** is not exposed via API — organizationId is passed manually at registration. Production would have an org management flow.
- **Drag and drop** reordering is not implemented — the `order` field exists on Task but UI reordering was deprioritized in favor of correct RBAC implementation.
- **JWT refresh tokens** not implemented — tokens expire after 7 days. Production would use refresh token rotation.

---

## Future Considerations

- **JWT refresh tokens** — implement sliding sessions with refresh token rotation
- **CSRF protection** — add CSRF tokens for state-mutating requests
- **RBAC caching** — cache permission checks in Redis to avoid repeated DB lookups
- **Role delegation** — allow Owners to promote/demote users
- **PostgreSQL** — migrate from SQLite for production scalability
- **Rate limiting** — prevent brute force attacks on auth endpoints