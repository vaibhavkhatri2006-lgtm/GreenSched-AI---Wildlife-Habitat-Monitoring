from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import AnalysisRun, Hotspot, MonitoringArea, User
from app.services.ai_engine import ai_engine
from app.routers.auth import get_current_user

router = APIRouter()

@router.post("/insight")
def get_ai_insight(analysis_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    run = db.query(AnalysisRun).join(MonitoringArea).filter(AnalysisRun.id == analysis_id, MonitoringArea.user_id == current_user.id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Analysis run not found")
        
    hotspots = db.query(Hotspot).filter(Hotspot.analysis_run_id == analysis_id).all()
    
    # Prepare structured numerical data
    data = {
        "area_name": run.monitoring_area.name if run.monitoring_area else "Unknown",
        "baseline_period": f"{run.baseline_start} to {run.baseline_end}",
        "current_period": f"{run.current_start} to {run.current_end}",
        "ndvi_change": run.ndvi_change,
        "ndwi_change": run.ndwi_change,
        "ndbi_change": run.ndbi_change,
        "vegetation_loss_area_km2": run.vegetation_loss_area_km2,
        "water_change_area_km2": run.water_change_area_km2,
        "builtup_change_area_km2": run.builtup_change_area_km2,
        "hotspots": [
            {
                "type": h.type,
                "severity": h.severity,
                "confidence": h.confidence,
                "area_km2": h.area_km2,
                "description": h.description
            } for h in hotspots
        ]
    }
    
    insight = ai_engine.generate_insight(data)
    
    return {
        "success": True,
        "data": insight
    }
