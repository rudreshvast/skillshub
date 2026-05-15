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

**Database URL**: `postgresql://skillshub_user:1234@localhost:5432/skillshub` (from `.env`)

## Workspace Layout

```
skillshub/
├── frontend/              # Next.js app
│   ├── app/              # App Router pages and layouts
│   │   ├── page.tsx      # Home page
│   │   ├── layout.tsx    # Root layout
│   │   └── lib/          # Shared utilities
│   │       └── api.ts    # Axios HTTP client instance
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   └── public/
│
├── backend/               # FastAPI app
│   ├── app/
│   │   ├── main.py       # FastAPI app instance, CORS middleware
│   │   ├── db/           # Database configuration
│   │   │   └── database.py  # SQLAlchemy setup
│   │   ├── models/       # SQLAlchemy ORM models (currently empty)
│   │   ├── schemas/      # Pydantic request/response schemas (currently empty)
│   │   ├── api/          # API route handlers (currently empty)
│   │   ├── services/     # Business logic layer (currently empty)
│   │   ├── core/         # Core utilities (currently empty)
│   │   └── utils/        # Helper utilities (currently empty)
│   ├── alembic/          # Database migration directory
│   ├── alembic.ini       # Alembic config
│   ├── .env              # Environment variables (DATABASE_URL)
│   ├── venv/             # Python virtual environment
│   └── requirements.txt   # (if needed; packages are installed in venv)
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

## Architecture Notes

### Frontend
- **App Router**: Pages live in `app/` directory structure
- **API Client**: Central `api.ts` instance (Axios) in `lib/` for all HTTP calls
- **State**: Use Zustand for client state, React Query for server state
- **Styling**: Tailwind CSS with PostCSS

### Backend
- **FastAPI Structure**: Routes should go in `api/`, database models in `models/`, Pydantic schemas in `schemas/`, business logic in `services/`
- **Database**: Async ORM via SQLAlchemy 2.0 + asyncpg. Use `SessionLocal` from `db/database.py` for DB access
- **CORS**: Wildcard CORS enabled (should be restricted in production)
- **Environment**: Database URL loaded from `.env` via python-dotenv

## Cross-cutting Concerns

- **API Contract**: Frontend expects JSON responses from backend endpoints
- **Development Speed**: Both servers support hot-reload (Next.js `npm run dev`, Uvicorn with `--reload`)
- **Base URL**: Frontend's Axios client hardcoded to `http://127.0.0.1:8000` — update if backend moves

## Getting Started on a Task

1. **For frontend changes**: Modify files in `frontend/app/`, run `npm run dev`, test in browser at `http://localhost:3000`
2. **For backend changes**: Modify `backend/app/` (follow the models/schemas/services/api structure), ensure database is running, test with `curl` or frontend
3. **For database changes**: Write Alembic migrations for schema updates; test locally before deploying
