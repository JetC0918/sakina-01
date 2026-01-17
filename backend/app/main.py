"""
Sakina AI Backend - FastAPI Application Entry Point

This is the main entry point for the Sakina wellness companion backend.
It provides AI-powered journal analysis, proactive nudges, and wellness insights.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import engine, Base
from app.database import engine, Base
from app.routers import journal, nudge, insights, intervention, user, dashboard


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    Tables are created via Supabase migrations, not SQLAlchemy.
    """
    # Startup: Tables already exist from Supabase migration
    # Uncomment below line only for local SQLite development:
    # Base.metadata.create_all(bind=engine)
    yield
    # Shutdown: cleanup if needed


# Create FastAPI application
app = FastAPI(
    title="Sakina AI Backend",
    description="""
    AI-powered wellness companion backend for the Sakina app.
    
    ## Features
    - **Journal Analysis**: AI-powered stress detection and emotional analysis
    - **Proactive Nudges**: Intelligent wellness interventions based on patterns
    - **Weekly Insights**: Trend analysis and personalized recommendations
    - **Intervention Logging**: Track completed wellness exercises
    
    ## Authentication
    All endpoints require a valid Supabase JWT token in the Authorization header.
    """,
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware for React frontend
import logging

logger = logging.getLogger("uvicorn")

def _is_valid_origin(origin: str) -> bool:
    is_local = origin.startswith(("http://localhost", "http://127.0.0.1"))
    return is_local or origin.startswith("https://")

origins = [
    settings.FRONTEND_URL,
    "http://localhost:5173",
    "http://localhost:8080",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",
]

if settings.CORS_ALLOWED_ORIGINS:
    extra = [o.strip() for o in settings.CORS_ALLOWED_ORIGINS.split(",") if o.strip()]
    origins.extend(extra)

origins = [o for o in dict.fromkeys(origins) if _is_valid_origin(o)]
logger.info(f"CORS allowed origins: {origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

import traceback
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_msg = f"Global Exception: {str(exc)}\n{traceback.format_exc()}"
    print(error_msg)  # Print to console for command_status to capture
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "error": str(exc), "trace": traceback.format_exc()},
    )


# ═══════════════════════════════════════════════════════════════════════════════
# Routers
# ═══════════════════════════════════════════════════════════════════════════════

app.include_router(
    journal.router, 
    prefix="/api/journal", 
    tags=["Journal"]
)

app.include_router(
    nudge.router, 
    prefix="/api/nudge", 
    tags=["Nudge"]
)

app.include_router(
    insights.router, 
    prefix="/api/insights", 
    tags=["Insights"]
)

app.include_router(
    intervention.router, 
    prefix="/api/intervention", 
    tags=["Intervention"]
)

app.include_router(
    user.router, 
    prefix="/api/user", 
    tags=["User"]
)

app.include_router(
    dashboard.router,
    prefix="/api/dashboard",
    tags=["Dashboard"]
)


# ═══════════════════════════════════════════════════════════════════════════════
# Middleware
# ═══════════════════════════════════════════════════════════════════════════════

@app.middleware("http")
async def add_cache_headers(request: Request, call_next):
    response = await call_next(request)
    
    # Cache static dashboard data for 60 seconds (client-side)
    if request.url.path in ["/api/insights/stats", "/api/insights/streak", "/api/dashboard/summary"]:
        # Only cache successful GET requests
        if request.method == "GET" and response.status_code == 200:
            response.headers["Cache-Control"] = "private, max-age=60"
    
    return response


# ═══════════════════════════════════════════════════════════════════════════════
# Health Check
# ═══════════════════════════════════════════════════════════════════════════════

@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint for monitoring and load balancers.
    """
    return {
        "status": "healthy",
        "service": "sakina-ai",
        "version": "1.0.0"
    }


@app.get("/", tags=["Health"])
async def root():
    """
    Root endpoint with API information.
    """
    return {
        "name": "Sakina AI Backend",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


# ═══════════════════════════════════════════════════════════════════════════════
# Run with Uvicorn
# ═══════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=True
    )
