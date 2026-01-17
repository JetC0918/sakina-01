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
from app.routers import journal, nudge, insights, intervention, user


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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Temporarily allow all for debugging
    allow_credentials=True,
    allow_methods=["*"],
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
