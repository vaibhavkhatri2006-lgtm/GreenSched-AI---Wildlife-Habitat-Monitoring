from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routers import auth, areas, analysis, alerts, admin, ai

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Wildlife Habitat Monitoring System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(areas.router, prefix="/api/areas", tags=["Monitoring Areas"])
app.include_router(analysis.router, prefix="/api/analysis", tags=["Analysis"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])

from app.config import settings
@app.get("/api/health")
def health_check():
    return {
        "Backend": "OK",
        "Database": "OK", 
        "Geo Engine": "OK",
        "Copernicus": "configured" if settings.COPERNICUS_CLIENT_ID else "not configured",
        "Gemini": "configured" if settings.GEMINI_API_KEY else "not configured",
        "Demo Mode": settings.DEMO_MODE
    }

@app.get("/")
def read_root():
    return {"message": "Welcome to Wildlife Habitat Monitoring System API"}
