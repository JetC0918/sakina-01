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
from app.routers import journal, nudge, insights, intervention


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    Creates database tables on startup (for development).
    """
    # Startup: Create tables if they don't exist
    # Note: In production, use Alembic migrations instead
    Base.metadata.create_all(bind=engine)
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
