# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Skillshub** is a monorepo containing:
- **Frontend**: Next.js 16.2.6 web application (React 19, TypeScript, Tailwind CSS)
- **Backend**: FastAPI service with PostgreSQL database

The frontend communicates with the backend via HTTP (currently hardcoded to `http://127.0.0.1:8000`).

## Tech Stack

### Frontend (`/frontend`)
- **Framework**: Next.js 16.2.6 (App Router)
- **Language**: TypeScript
- **UI**: React 19.2.4, Tailwind CSS 4, Lucide React (icons)
- **State Management**: Zustand
- **Server State**: TanStack React Query
- **HTTP Client**: Axios
- **Linting**: ESLint 9

**Important**: Next.js 16 has breaking changes from training data. Check `node_modules/next/dist/docs/` when in doubt. See AGENTS.md for details.

### Backend (`/backend`)
- **Framework**: FastAPI 0.136.1
- **Language**: Python 3.10 (venv)
- **Database**: PostgreSQL with SQLAlchemy ORM + async asyncpg driver
- **Data Validation**: Pydantic 2
- **Migrations**: Alembic
- **Server**: Uvicorn
- **Database Vector Support**: pgvector
- **Authentication**: JWT (HS256) with bcrypt password hashing
- **Security**: HTTPBearer token-based auth, role-based access control (RBAC)

**Database URL**: `postgresql://skillshub_user:1234@localhost:5432/skillshub` (from `.env`)
**Environment Variables**: `SECRET_KEY` (JWT signing, defaults to dev key — change in production), `DATABASE_URL`

## Workspace Layout

```
skillshub/
├── frontend/              # Next.js app
│   ├── app/              # App Router pages and layouts
│   │   ├── page.tsx      # Home page
│   │   ├── layout.tsx    # Root layout
│   │   ├── login/        # Login page
│   │   │   └── page.tsx
│   │   ├── context/      # Global state
│   │   │   └── auth.tsx  # Zustand auth store (token, user, login, logout, loadFromStorage)
│   │   ├── components/   # Reusable components
│   │   │   ├── protected-route.tsx  # Route guard with optional role checking
│   │   │   └── hr/                  # HR-specific components
│   │   │       ├── bulk-import-upload.tsx   # CSV file upload, drag-drop, progress display
│   │   │       ├── single-import-form.tsx   # Form for adding single employee
│   │   │       └── toast.tsx                # Toast notifications (success/error)
│   │   ├── hr/           # HR module pages
│   │   │   └── import/   
│   │   │       └── page.tsx  # Employee import page with tabs for single/bulk import
│   │   └── lib/          # Shared utilities
│   │       └── api.ts    # Axios HTTP client instance (configured for backend)
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── .gitignore        # Git ignore for Node.js
│   └── public/
│
├── backend/               # FastAPI app
│   ├── app/
│   │   ├── main.py       # FastAPI app instance, CORS middleware, route registration
│   │   ├── auth/         # Authentication module
│   │   │   ├── router.py         # Auth endpoints (/auth/login, /auth/me)
│   │   │   ├── schemas.py        # UserCreate, UserResponse, Token schemas
│   │   │   ├── utils.py          # hash_password, verify_password, create/decode JWT tokens
│   │   │   ├── dependencies.py   # get_db, get_current_user, require_hr_role
│   │   │   └── __init__.py
│   │   ├── models/       # SQLAlchemy ORM models
│   │   │   ├── user.py   # User model (id, email, hashed_password, name, role, is_active)
│   │   │   └── employee.py # Employee model (user_id, employee_id, name, dob, date_of_joining, designation, department, location, work_mode, seniority, profile_complete, created_at, updated_at)
│   │   ├── auth/         # (see auth section above)
│   │   ├── employees/    # Employee management module
│   │   │   ├── router.py      # Endpoints: /employees/import/{single,bulk,template}
│   │   │   ├── schemas.py     # EmployeeCreate, EmployeeResponse, BulkImportResponse, ImportError
│   │   │   ├── service.py     # CSV parsing, validation, bulk/single import, template generation
│   │   │   └── __init__.py
│   │   ├── db/           # Database configuration
│   │   │   └── database.py  # SQLAlchemy setup, SessionLocal, Base
│   │   ├── schemas/      # Pydantic request/response schemas (domain-specific, if needed)
│   │   ├── api/          # API route handlers (for future non-auth, non-employee routes)
│   │   ├── services/     # Business logic layer (for future services)
│   │   ├── core/         # Core utilities
│   │   └── utils/        # Helper utilities
│   ├── alembic/          # Database migration directory
│   ├── alembic.ini       # Alembic config
│   ├── .env              # Environment variables (DATABASE_URL, SECRET_KEY)
│   ├── venv/             # Python virtual environment
│   └── .gitignore        # Git ignore rules for Python/venv
```

## Development Setup

### Frontend
```bash
cd frontend
npm install        # Install dependencies (already done)
npm run dev        # Start development server (http://localhost:3000)
npm run build      # Build for production
npm run lint       # Run ESLint
```

### Backend
```bash
cd backend
source venv/bin/activate          # Activate virtual environment
# Packages already installed: fastapi, sqlalchemy, pydantic, alembic, uvicorn, asyncpg, etc.
python -m uvicorn app.main:app --reload  # Start server (http://localhost:8000)
```

**Ensure PostgreSQL is running** with the skillshub database and user configured per `.env`.

## Database Migrations

Alembic is configured for PostgreSQL schema management:
```bash
cd backend
alembic revision --autogenerate -m "description"  # Create migration
alembic upgrade head                              # Apply migrations
```

## Authentication System

### Overview
JWT-based authentication with role-based access control (RBAC). Users have roles (`hr` or `employee`) that determine endpoint access.

### Backend Flow
1. **Login**: `POST /auth/login` accepts email + password (OAuth2PasswordRequestForm)
   - Password verified via bcrypt
   - JWT access token generated (24-hour expiry, HS256 algorithm)
   - Token signed with `SECRET_KEY` environment variable
   
2. **Protected Routes**: Use `get_current_user` dependency to extract and validate JWT from Authorization header
   - Expected header format: `Authorization: Bearer <token>`
   - Token decoded to retrieve user email, user fetched from database
   - Returns 401 if token missing, invalid, or user doesn't exist

3. **Role-Based Access**: `require_hr_role` dependency restricts endpoints to HR users
   - Returns 403 Forbidden if user role ≠ "hr"

### Frontend Flow
1. **Auth Store** (`app/context/auth.tsx`): Zustand store manages:
   - `token`: JWT stored in localStorage
   - `user`: User object (id, email, name, role, is_active)
   - `login()`: POST to `/auth/login`, fetch user info via `/auth/me`, store both
   - `logout()`: Clear token and user from state and localStorage
   - `loadFromStorage()`: Restore from localStorage on page load

2. **Protected Routes** (`app/components/protected-route.tsx`):
   - Wraps pages/components requiring authentication
   - Optional `requiredRole` prop for role-based checks
   - Redirects to `/login` if no token
   - Shows "Access Denied" for role mismatch

3. **Login Page** (`app/login/page.tsx`): Form collecting email + password, calls `useAuthStore().login()`

### Security Notes
- Tokens sent via Authorization header (not cookies)
- `SECRET_KEY` defaults to dev value — **must be set in production** via `.env`
- Token expiry: 24 hours
- Passwords hashed with bcrypt (salted, slow by design)

## Architecture Notes

### Frontend
- **App Router**: Pages live in `app/` directory structure
- **API Client**: Central `api.ts` instance (Axios) in `lib/` for all HTTP calls
- **State**: Use Zustand for client state, React Query for server state
- **Styling**: Tailwind CSS with PostCSS

### Backend
- **FastAPI Structure**: Auth routes in `auth/` module (separate from domain-specific routes in `api/`). Models in `models/`, schemas in `schemas/`, business logic in `services/`
- **Database**: Async ORM via SQLAlchemy 2.0 + asyncpg. Use `SessionLocal` from `db/database.py` for DB access. User model defined in `models/user.py`
- **Authentication**: Protected endpoints use `Depends(get_current_user)` to validate JWT. Role restrictions use `Depends(require_hr_role)`. Token verification via `decode_access_token()` in `auth/utils.py`
- **CORS**: Wildcard CORS enabled (should be restricted in production)
- **Environment**: Load `DATABASE_URL` and `SECRET_KEY` from `.env` via python-dotenv

## Cross-cutting Concerns

- **API Contract**: Frontend expects JSON responses from backend endpoints
- **Development Speed**: Both servers support hot-reload (Next.js `npm run dev`, Uvicorn with `--reload`)
- **Base URL**: Frontend's Axios client hardcoded to `http://127.0.0.1:8000` — update if backend moves

## Employee Management

### Overview
HR users can add employees individually or in bulk via CSV. Each employee is linked to a User account (for login) and has an Employee profile record with work metadata.

### Data Model
- **User**: Email, password (hashed with bcrypt), role ("hr" or "employee")
- **Employee**: Links to User via `user_id`, stores employee_id, name, dob, date_of_joining, designation, department, location, work_mode (remote/hybrid/onsite), seniority (junior/mid/senior/lead/principal), profile_complete flag, timestamps

### Backend Endpoints (HR-only)

1. **GET /employees/import/template**
   - Returns CSV template file for download
   - Headers: employee_id, name, email, dob (YYYY-MM-DD), date_of_joining (YYYY-MM-DD), designation, department, location, work_mode, seniority
   - Includes sample rows

2. **POST /employees/import/single**
   - Create single employee via form data (EmployeeCreate schema)
   - Auto-generates default password: `{email_prefix}{dob_DDMMYYYY}` (e.g., john.doe + 1995-03-15 → john.doe15031995)
   - Returns 201 with EmployeeResponse on success, 409 if email/employee_id exists

3. **POST /employees/import/bulk**
   - Upload CSV file for batch import
   - Returns BulkImportResponse: {total, success, failed, created: [], errors: []}
   - Does NOT stop on first error — processes all rows, logs per-row errors
   - Errors include row number, email, and reason (validation, duplicate, date format, etc.)

### Validation
- Email and employee_id uniqueness checked against existing User and Employee records
- work_mode must be one of: remote, hybrid, onsite
- seniority must be one of: junior, mid, senior, lead, principal (defaults to "mid")
- Date fields must be YYYY-MM-DD format
- All fields trimmed of whitespace

### Frontend Pages

1. **`/hr/import`** (ProtectedRoute with requiredRole="hr")
   - Tab interface: "Add Single Employee" | "Bulk Import"
   - Single tab: Form with all employee fields, validation on submit
   - Bulk tab: CSV upload with drag-drop, download error report if failures occur

2. **Components**:
   - `BulkImportUpload`: File upload, template download, progress/results display
   - `SingleImportForm`: Form with real-time error clearing, success notification
   - Result summaries with success/failure counts and detailed tables

### CSV Processing Notes
- CSV parsed as DictReader (header-based column mapping)
- Empty CSV returns 400 error
- Non-CSV files rejected at endpoint
- Invalid dates logged as per-row errors (don't stop import)
- Transactions used for single employee import; bulk import is best-effort

## Getting Started on a Task

1. **For frontend changes**: Modify files in `frontend/app/`, run `npm run dev`, test in browser at `http://localhost:3000`. For auth-related work, test token flow through the auth store and protected routes.

2. **For backend changes**: Modify `backend/app/` (follow the models/schemas/services/api structure), ensure database is running, test with `curl` or frontend. For protected endpoints, include `Authorization: Bearer <token>` header.

3. **For database changes**: Write Alembic migrations for schema updates; test locally before deploying. If adding auth-related or employee-related fields, ensure models and migrations are in sync.

4. **Adding new protected endpoints**: 
   - Create model + schema (if needed)
   - Create route in appropriate module (e.g., `employees/` for employee features)
   - Use `Depends(get_current_user)` for auth, optionally `Depends(require_hr_role)` for HR-only
   - Frontend: fetch with `useAuthStore().token` in Authorization header

5. **Working with employee import features**:
   - **CSV changes**: Update schema in `employees/schemas.py`, sample rows in `generate_csv_template()`, validation in `validate_employee_data()`
   - **Default password logic**: Modify `generate_default_password()` in `employees/service.py`
   - **Bulk import behavior**: Edit `import_bulk_employees()` to change error handling or progress reporting
   - **Frontend upload**: Test file validation and result display in `BulkImportUpload` component
   - **Single employee form**: Add new fields to `SingleImportForm`, update DEPARTMENTS/WORK_MODES/SENIORITY_LEVELS lists
