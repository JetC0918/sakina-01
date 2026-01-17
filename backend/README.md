# Sakina AI Backend

Python FastAPI backend for the Sakina wellness companion app.

## Tech Stack

- **FastAPI** - Web framework
- **SQLAlchemy** - ORM for database access
- **Supabase PostgreSQL** - Database
- **Supabase Auth** - JWT authentication
- **Google Gemini** - AI analysis

## Setup

### 1. Install uv (if not already installed)

```bash
# Windows (PowerShell)
irm https://astral.sh/uv/install.ps1 | iex

# macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### 2. Install Dependencies

```bash
cd backend
uv sync
```

### 3. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `DATABASE_URL` - PostgreSQL connection string from Supabase
- `GEMINI_API_KEY` - Google AI API key

### 4. Run Database Migrations

First, run the SQL migration in Supabase SQL Editor (see `migrations/` folder or the implementation plan).

### 5. Start Development Server

```bash
uv run uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Journal
- `POST /api/journal/` - Create journal entry
- `GET /api/journal/` - List journal entries
- `GET /api/journal/{id}` - Get specific entry
- `DELETE /api/journal/{id}` - Delete entry
- `POST /api/journal/analyze` - Analyze text directly

### Nudge
- `POST /api/nudge/check` - Check if nudge should trigger
- `GET /api/nudge/status` - Get nudge status and metrics

### Insights
- `POST /api/insights/weekly` - Get weekly AI insights
- `GET /api/insights/stats` - Get quick stats
- `GET /api/insights/streak` - Get journaling streak

### Intervention
- `POST /api/intervention/` - Log completed intervention
- `GET /api/intervention/` - List intervention history
- `GET /api/intervention/recent` - Recent interventions

## Production Deployment

### Render

1. Create a new Web Service
2. Connect your repository
3. Set build command: `pip install uv && uv sync`
4. Set start command: `uv run uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables

### Railway

1. Create new project from GitHub
2. Add environment variables
3. Railway auto-detects Python and deploys

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI application
│   ├── config.py         # Environment config
│   ├── database.py       # SQLAlchemy setup
│   ├── auth.py           # Supabase JWT auth
│   ├── models/           # SQLAlchemy models
│   │   ├── user.py
│   │   ├── journal.py
│   │   └── intervention.py
│   ├── schemas/          # Pydantic schemas
│   │   └── schemas.py
│   ├── routers/          # API routes
│   │   ├── journal.py
│   │   ├── nudge.py
│   │   ├── insights.py
│   │   └── intervention.py
│   └── services/         # Business logic
│       └── gemini_service.py
├── pyproject.toml
├── uv.lock
├── .env.example
└── README.md
```
