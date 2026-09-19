from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from app.database import get_db
from app.models import Alert

router = APIRouter()

DEMO_ALERTS = [
    {
        "id": 1,
        "title": "Severe Forest Canopy Fragmentation",
        "message": "Satellite Sentinel-2 detect 14.2 hectares of high canopy clearing along western corridor.",
        "severity": "High",
        "is_read": False,
        "area_name": "Amazon Rain Forest Zone A4",
        "lat": -3.4653,
        "lng": -62.2159,
        "created_at": (datetime.now() - timedelta(hours=2)).strftime("%Y-%m-%d %H:%M")
    },
    {
        "id": 2,
        "title": "Illegal Encroachment Activity",
        "message": "Thermal anomaly detected near protected buffer boundary (Grid Ref #882).",
        "severity": "Critical",
        "is_read": False,
        "area_name": "Serengeti Migration Corridor",
        "lat": -2.3333,
        "lng": 34.8333,
        "created_at": (datetime.now() - timedelta(hours=5)).strftime("%Y-%m-%d %H:%M")
    },
    {
        "id": 3,
        "title": "Water Resource Contraction Warning",
        "message": "30% reduction in surface water area compared to previous satellite observation cycle.",
        "severity": "Medium",
        "is_read": True,
        "area_name": "Kaziranga Wetland Reserve",
        "lat": 26.5775,
        "lng": 93.1711,
        "created_at": (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d %H:%M")
    },
    {
        "id": 4,
        "title": "Wildfire Hazard Index Elevated",
        "message": "NDVI stress index dropped below 0.35 with low humidity forecast over 48h.",
        "severity": "High",
        "is_read": False,
        "area_name": "Yellowstone Elephant & Bison Sanctuary",
        "lat": 44.4280,
        "lng": -110.5885,
        "created_at": (datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d %H:%M")
    }
]

@router.get("/")
def get_alerts(severity: Optional[str] = None, db: Session = Depends(get_db)):
    alerts = db.query(Alert).all()
    if not alerts:
        res = DEMO_ALERTS
        if severity:
            res = [a for a in res if a["severity"].lower() == severity.lower()]
        return res
    return alerts

@router.put("/{alert_id}/read")
def mark_alert_read(alert_id: int, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if alert:
        alert.is_read = True
        db.commit()
        return {"status": "success", "id": alert_id}
    # Fallback response for demo data
    for a in DEMO_ALERTS:
        if a["id"] == alert_id:
            a["is_read"] = True
            return {"status": "success", "id": alert_id}
    return {"status": "success", "id": alert_id}

