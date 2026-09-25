from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import MonitoringArea, User
from app.schemas import MonitoringAreaCreate, MonitoringAreaResponse
from app.routers.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=MonitoringAreaResponse)
def create_area(area: MonitoringAreaCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_area = MonitoringArea(**area.dict(), user_id=current_user.id)
    db.add(db_area)
    db.commit()
    db.refresh(db_area)
    return db_area

@router.get("/", response_model=List[MonitoringAreaResponse])
def get_areas(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    areas = db.query(MonitoringArea).filter(MonitoringArea.user_id == current_user.id).order_by(MonitoringArea.created_at.desc()).all()
    return areas

@router.get("/{area_id}", response_model=MonitoringAreaResponse)
def get_area(area_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    area = db.query(MonitoringArea).filter(MonitoringArea.id == area_id, MonitoringArea.user_id == current_user.id).first()
    if area is None:
        raise HTTPException(status_code=404, detail="Area not found")
    return area

@router.put("/{area_id}", response_model=MonitoringAreaResponse)
def update_area(area_id: int, area_update: MonitoringAreaCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_area = db.query(MonitoringArea).filter(MonitoringArea.id == area_id, MonitoringArea.user_id == current_user.id).first()
    if db_area is None:
        raise HTTPException(status_code=404, detail="Area not found")
    
    for key, value in area_update.dict().items():
        setattr(db_area, key, value)
    
    db.commit()
    db.refresh(db_area)
    return db_area

@router.delete("/{area_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_area(area_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_area = db.query(MonitoringArea).filter(MonitoringArea.id == area_id, MonitoringArea.user_id == current_user.id).first()
    if db_area is None:
        raise HTTPException(status_code=404, detail="Area not found")
    
    db.delete(db_area)
    db.commit()
    return None
