from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
import random

from app.database import get_db
from app.models import AnalysisRun, MonitoringArea, Hotspot, Alert, User
from app.services.geo_engine import geo_engine
from app.routers.auth import get_current_user

router = APIRouter()

class AnalysisRequest(BaseModel):
    baseline_start: str
    baseline_end: str
    current_start: str
    current_end: str
    cloud_cover: float = 20.0

@router.get("/")
def get_analysis_runs(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    runs = db.query(AnalysisRun).join(MonitoringArea).filter(MonitoringArea.user_id == current_user.id).all()
    
    # Format runs to ensure backward compatibility with frontend
    formatted_runs = []
    for run in runs:
        formatted_runs.append({
            "id": run.id,
            "monitoring_area_id": run.monitoring_area_id,
            "area_name": run.monitoring_area.name if run.monitoring_area else f"Area #{run.monitoring_area_id}",
            "status": run.status,
            "vegetation_change": run.ndvi_change * 100 if run.ndvi_change else 0,
            "urban_change": run.ndbi_change * 100 if run.ndbi_change else 0,
            "water_change": run.ndwi_change * 100 if run.ndwi_change else 0,
            "disturbance_score": run.hotspot_count * 10,
            "created_at": run.created_at.isoformat() if run.created_at else None,
            "ndvi_history": [
                {"date": run.baseline_start.isoformat() if run.baseline_start else "2026-04-01", "ndvi": 0.74, "rainfall": 120},
                {"date": run.current_start.isoformat() if run.current_start else "2026-09-01", "ndvi": run.ndvi_change if run.ndvi_change else 0.58, "rainfall": 25},
            ]
        })
    
    if not formatted_runs:
        # Return fallback demo analysis data
        return [
            {
                "id": 101,
                "monitoring_area_id": 1,
                "area_name": "Serengeti Migration Corridor",
                "status": "COMPLETED",
                "vegetation_change": -4.2,
                "urban_change": +1.8,
                "water_change": -2.1,
                "disturbance_score": 68.5,
                "created_at": (datetime.now() - timedelta(days=2)).isoformat(),
                "ndvi_history": [
                    {"date": "2026-04-01", "ndvi": 0.74, "rainfall": 120},
                    {"date": "2026-05-01", "ndvi": 0.72, "rainfall": 95},
                    {"date": "2026-06-01", "ndvi": 0.68, "rainfall": 45},
                    {"date": "2026-07-01", "ndvi": 0.65, "rainfall": 15},
                    {"date": "2026-08-01", "ndvi": 0.61, "rainfall": 10},
                    {"date": "2026-09-01", "ndvi": 0.58, "rainfall": 25},
                ]
            }
        ]
    return formatted_runs

@router.get("/{analysis_id}")
def get_analysis_by_id(analysis_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    run = db.query(AnalysisRun).join(MonitoringArea).filter(AnalysisRun.id == analysis_id, MonitoringArea.user_id == current_user.id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    hotspots = db.query(Hotspot).filter(Hotspot.analysis_run_id == analysis_id).all()
    
    return {
        "success": True,
        "data": {
            "id": run.id,
            "status": run.status,
            "baseline_start": run.baseline_start,
            "baseline_end": run.baseline_end,
            "current_start": run.current_start,
            "current_end": run.current_end,
            "ndvi_change": run.ndvi_change,
            "ndwi_change": run.ndwi_change,
            "ndbi_change": run.ndbi_change,
            "vegetation_loss_area_km2": run.vegetation_loss_area_km2,
            "water_change_area_km2": run.water_change_area_km2,
            "builtup_change_area_km2": run.builtup_change_area_km2,
            "hotspot_count": run.hotspot_count,
            "hotspots": [
                {
                    "type": h.type,
                    "severity": h.severity,
                    "confidence": h.confidence,
                    "geometry": h.geometry,
                    "description": h.description,
                    "area_km2": h.area_km2
                } for h in hotspots
            ]
        }
    }

@router.get("/{analysis_id}/status")
def get_analysis_status(analysis_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    run = db.query(AnalysisRun).join(MonitoringArea).filter(AnalysisRun.id == analysis_id, MonitoringArea.user_id == current_user.id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return {"id": run.id, "status": run.status}

@router.post("/{area_id}/run")
def run_analysis(area_id: int, request: AnalysisRequest = None, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    area = db.query(MonitoringArea).filter(MonitoringArea.id == area_id, MonitoringArea.user_id == current_user.id).first()
    if not area:
        raise HTTPException(status_code=404, detail="Area not found")
        
    # Default parameters if called from old frontend
    if not request:
        request = AnalysisRequest(
            baseline_start=(datetime.now() - timedelta(days=60)).strftime("%Y-%m-%d"),
            baseline_end=(datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d"),
            current_start=(datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d"),
            current_end=datetime.now().strftime("%Y-%m-%d"),
            cloud_cover=20.0
        )
    
    # Parse dates
    try:
        bs = datetime.strptime(request.baseline_start, "%Y-%m-%d")
        be = datetime.strptime(request.baseline_end, "%Y-%m-%d")
        cs = datetime.strptime(request.current_start, "%Y-%m-%d")
        ce = datetime.strptime(request.current_end, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format, use YYYY-MM-DD")
        
    new_run = AnalysisRun(
        monitoring_area_id=area_id,
        baseline_start=bs,
        baseline_end=be,
        current_start=cs,
        current_end=ce,
        cloud_cover=request.cloud_cover,
        status="PROCESSING"
    )
    db.add(new_run)
    db.commit()
    db.refresh(new_run)
    
    # Execute geo processing synchronous for now (in real app this should be background task)
    try:
        results = geo_engine.process_analysis(
            area.geojson if area.geojson else {},
            request.baseline_start, request.baseline_end,
            request.current_start, request.current_end
        )
        
        new_run.ndvi_change = results.get("ndvi_change")
        new_run.ndwi_change = results.get("ndwi_change")
        new_run.ndbi_change = results.get("ndbi_change")
        new_run.vegetation_loss_area_km2 = results.get("vegetation_loss_area_km2")
        new_run.water_change_area_km2 = results.get("water_change_area_km2")
        new_run.builtup_change_area_km2 = results.get("builtup_change_area_km2")
        
        hotspots_data = results.get("hotspots", [])
        new_run.hotspot_count = len(hotspots_data)
        
        for hd in hotspots_data:
            h = Hotspot(
                analysis_run_id=new_run.id,
                type=hd.get("type"),
                severity=hd.get("severity"),
                confidence=hd.get("confidence"),
                area_km2=hd.get("area_km2"),
                latitude=hd.get("latitude"),
                longitude=hd.get("longitude"),
                geometry=hd.get("geometry"),
                description=hd.get("description")
            )
            db.add(h)
            
        new_run.status = "COMPLETED"
        db.commit()
        
    except Exception as e:
        new_run.status = "FAILED"
        new_run.error_message = str(e)
        db.commit()
        raise HTTPException(status_code=500, detail=str(e))

    return {
        "success": True,
        "data": {
            "id": new_run.id,
            "status": new_run.status
        }
    }
