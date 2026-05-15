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
- **Database**: PostgreSQL with SQLAlchemy ORM (sync, Integer PKs)
- **Data Validation**: Pydantic 2
- **Migrations**: Alembic
- **Server**: Uvicorn
- **Database Vector Support**: pgvector
- **Authentication**: JWT (HS256) with bcrypt password hashing
- **Security**: HTTPBearer token-based auth, role-based access control (RBAC)
- **PDF Processing**: pdfplumber (sync PDF text extraction)
- **LLM Integration**: OpenAI (gpt-4o-mini for resume parsing)

**Database URL**: `postgresql://skillshub_user:1234@localhost:5432/skillshub` (from `.env`)
**Environment Variables**: `SECRET_KEY` (JWT signing, defaults to dev key — change in production), `DATABASE_URL`, `OPENAI_API_KEY`

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
│   │   │   ├── employee/              # Employee components
│   │   │   │   ├── resume-dropzone.tsx       # PDF drag-drop upload with progress states
│   │   │   │   └── extracted-profile-preview.tsx  # Read-only profile display
│   │   │   └── hr/                  # HR-specific components
│   │   │       ├── bulk-import-upload.tsx   # CSV file upload, drag-drop, progress display
│   │   │       ├── single-import-form.tsx   # Form for adding single employee
│   │   │       ├── toast.tsx                # Toast notifications (success/error)
│   │   │       ├── queue-list.tsx           # Pending profile list for review queue
│   │   │       ├── profile-editor.tsx       # Main profile editor with 5 sections
│   │   │       ├── skills-editor.tsx        # Skills table with inferred skills
│   │   │       └── projects-editor.tsx      # Collapsible projects editor
│   │   ├── employee/     # Employee module pages
│   │   │   └── resume/   
│   │   │       └── page.tsx  # Resume upload and preview page
│   │   ├── hr/           # HR module pages
│   │   │   ├── import/   
│   │   │   │   └── page.tsx  # Employee import page with tabs for single/bulk import
│   │   │   └── review-queue/
│   │   │       └── page.tsx  # Resume review queue with split-panel editor
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
│   │   │   ├── dependencies.py   # get_db, get_current_user, require_hr_role, require_employee_role
│   │   │   └── __init__.py
│   │   ├── models/       # SQLAlchemy ORM models
│   │   │   ├── user.py   # User model (id, email, hashed_password, name, role, is_active)
│   │   │   ├── employee.py # Employee model (user_id, employee_id, name, dob, date_of_joining, designation, department, location, work_mode, seniority, profile_complete, summary, years_of_experience, domain_expertise, created_at, updated_at)
│   │   │   ├── pending_profile.py # PendingProfile model (id, employee_id FK, extracted_data JSON, original_pdf_path, status, uploaded_at, reviewed_at, reviewed_by FK)
│   │   │   ├── employee_skill.py # EmployeeSkill model (id, employee_id FK, skill_name, category, proficiency, years, is_inferred, confidence_score)
│   │   │   ├── employee_project.py # EmployeeProject model (id, employee_id FK, name, role, duration, domain, technologies ARRAY)
│   │   │   └── employee_certification.py # EmployeeCertification model (id, employee_id FK, name, issuer, issued_on)
│   │   ├── auth/         # (see auth section above)
│   │   ├── employees/    # Employee management module
│   │   │   ├── router.py      # Endpoints: /employees/import/{single,bulk,template}
│   │   │   ├── schemas.py     # EmployeeCreate, EmployeeResponse, BulkImportResponse, ImportError
│   │   │   ├── service.py     # CSV parsing, validation, bulk/single import, template generation
│   │   │   └── __init__.py
│   │   ├── resume/       # Resume ingestion module
│   │   │   ├── router.py      # Endpoints: POST /upload, GET /my-profile, GET /review-queue, POST /approve, POST /reject
│   │   │   ├── schemas.py     # ExtractedProfile, SkillExtracted, InferredSkill, PendingProfileResponse, ApproveRequest
│   │   │   ├── service.py     # PDF extraction, OpenAI API calls, profile management
│   │   │   ├── claude_prompt.py  # System and user prompts for OpenAI gpt-4o-mini
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
│   ├── uploads/          # File uploads directory
│   │   └── resumes/      # Uploaded PDF resumes (employee_id_timestamp.pdf)
│   ├── .env              # Environment variables (DATABASE_URL, SECRET_KEY, OPENAI_API_KEY)
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

## Resume Ingestion Feature

### Overview
Employees upload PDF resumes. OpenAI (gpt-4o-mini) extracts structured profile data. HR reviews extracted data in a queue, makes edits, and approves to write to database.

### Database Models (Sync SQLAlchemy, Integer PKs)

**Employee columns added:**
- `summary` (String, nullable) — profile summary from resume
- `years_of_experience` (Integer, nullable) — total years
- `domain_expertise` (ARRAY(String), nullable) — list of domain areas

**New tables:**
1. **pending_profiles**: id, employee_id (FK), extracted_data (JSON), original_pdf_path, status (pending/approved/rejected), uploaded_at, reviewed_at (nullable), reviewed_by (FK users.id, nullable)
2. **employee_skills**: id, employee_id (FK), skill_name, category (language/framework/platform/tool/domain), proficiency (novice/intermediate/expert), years, is_inferred (Boolean), confidence_score (Float, nullable)
3. **employee_projects**: id, employee_id (FK), name, role, duration, domain, technologies (ARRAY(String))
4. **employee_certifications**: id, employee_id (FK), name, issuer, issued_on (Date, nullable)

### Backend Resume Module (`/app/resume/`)

**Dependencies:** `pdfplumber` (sync PDF extraction), `openai` (gpt-4o-mini API)

**Environment Variables:**
- `OPENAI_API_KEY` — for Claude-alternative resume parsing

**Files:**
- `claude_prompt.py` — system + user prompt templates for OpenAI
- `schemas.py` — Pydantic v2 models (SkillExtracted, InferredSkill, ExtractedProfile, PendingProfileResponse, PendingProfileWithEmployee, ApproveRequest)
- `service.py` — sync functions: `extract_text_from_pdf()`, `call_claude_api()` (gpt-4o-mini), `get_or_create_employee_pending_profile()`, `get_review_queue()`, `approve_profile()`, `reject_profile()`
- `router.py` — 6 endpoints (see below)

**Key function notes:**
- `extract_text_from_pdf()` uses pdfplumber (sync, called via `asyncio.to_thread` in router)
- `call_claude_api()` calls OpenAI with gpt-4o-mini model, parses JSON response with fallback for markdown code blocks
- All database operations use sync SQLAlchemy Session pattern (matching existing codebase)

### Resume API Endpoints

1. **POST /resume/upload** (employee role only)
   - Multipart PDF upload, max 10MB
   - Saves to `backend/uploads/resumes/{employee_id}_{timestamp}.pdf`
   - Extracts text → validates ≥100 chars → calls OpenAI → upserts pending_profile
   - Returns ExtractedProfile on success

2. **GET /resume/my-profile** (employee role only)
   - Returns current employee's pending_profile (with extracted_data) or null

3. **GET /resume/review-queue** (HR role only)
   - Returns all pending profiles with employee name, designation, department
   - Joins pending_profiles with employees table
   - Returns list[PendingProfileWithEmployee]

4. **GET /resume/review-queue/{pending_profile_id}** (HR role only)
   - Returns single pending profile with full employee info

5. **POST /resume/review-queue/{pending_profile_id}/approve** (HR role only)
   - Accept edited extracted_data in request body
   - Single async transaction:
     * Delete existing skills/projects/certs for employee
     * Bulk insert employee_skills (marks inferred skills with is_inferred=true, confidence_score)
     * Bulk insert employee_projects, employee_certifications
     * Update employees: summary, years_of_experience, domain_expertise, seniority, profile_complete=true
     * Update pending_profiles: status=approved, reviewed_at, reviewed_by
   - Returns {status, employee_id, profile_complete}

6. **POST /resume/review-queue/{pending_profile_id}/reject** (HR role only)
   - Sets status=rejected, reviewed_at, reviewed_by

### Frontend Resume Pages & Components

**Employee Upload Page** (`/employee/resume`):
- ProtectedRoute requiredRole="employee"
- `ResumeDropzone`: drag-drop PDF upload with progress states (uploading → extracting → analyzing → done)
- `ExtractedProfilePreview` (read-only): displays name, role, location, skills (colored pills by category), inferred skills (amber bg with confidence %), projects, certifications, domain expertise
- Shows "pending HR review" banner after upload
- Re-upload button available

**HR Review Queue Page** (`/hr/review-queue`):
- ProtectedRoute requiredRole="hr"
- Split-panel grid layout (35% queue list, 65% editor)
- `QueueList`: selectable list of pending profiles with employee name, designation, department badge, time-ago upload, pending count badge
- `ProfileEditor`: 5 editable sections
  1. Basic info: name, current_role, location, seniority (select), years_of_experience, summary (textarea)
  2. Skills: explicit skills table + inferred skills section with accept/delete buttons, + add skill button
  3. Projects: collapsible project cards, + add project button
  4. Certifications: name/issuer/issued_on inputs, + add cert button
  5. Sticky bottom bar: "Reject" (red outlined, confirm dialog) | "Approve & Save" (teal filled)
- `SkillsEditor`: two sections (explicit + inferred), category/proficiency/years selects, confidence % badge on inferred
- `ProjectsEditor`: collapsible cards, comma-separated technologies input
- All edits are local state; only sent on Approve click

**Components with null safety:**
- All optional chaining (`?.`) and nullish coalescing (`??`) used throughout
- `extracted-profile-preview.tsx` defensively accesses all arrays and objects
- `profile-editor.tsx` has styled scrollbar (webkit, 8px width, slate gray thumb)

### Resume Ingestion Notes

- **OpenAI integration**: Uses gpt-4o-mini model (not gpt-4.5-mini which may not exist)
- **System message format**: OpenAI requires system as a message with role "system", not a separate parameter
- **Skill inference rules**: Next.js→React, React→JS, Angular→TS, Kubernetes→Docker, Spring Boot→Java, etc. (see claude_prompt.py)
- **Inferred skills**: marked with is_inferred=true, confidence_score from Claude response
- **PDF extraction**: uses pdfplumber (sync), wrapped in `asyncio.to_thread` for async route handler
- **Error handling**: JSON parsing has fallback for markdown code blocks (```json...```)
- **Review queue query**: returns dictionaries (not tuples) for easy Pydantic model conversion
- **Transaction safety**: approve flow is single transaction; bulk insert with rollback on error

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
