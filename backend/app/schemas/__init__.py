from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# Users
class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    created_at: datetime
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Monitoring Areas
class MonitoringAreaBase(BaseModel):
    name: str
    description: Optional[str] = None
    geojson: Dict[str, Any]
    latitude: float
    longitude: float
    area_km2: float

class MonitoringAreaCreate(MonitoringAreaBase):
    pass

class MonitoringAreaResponse(MonitoringAreaBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    class Config:
        from_attributes = True

# Analysis Runs
class AnalysisRunBase(BaseModel):
    previous_date: datetime
    current_date: datetime

class AnalysisRunCreate(AnalysisRunBase):
    pass

class AnalysisRunResponse(AnalysisRunBase):
    id: int
    monitoring_area_id: int
    status: str
    vegetation_change: Optional[float] = None
    urban_change: Optional[float] = None
    water_change: Optional[float] = None
    disturbance_score: Optional[float] = None
    created_at: datetime
    class Config:
        from_attributes = True

# Alerts
class AlertResponse(BaseModel):
    id: int
    user_id: int
    analysis_run_id: Optional[int] = None
    title: str
    message: str
    severity: str
    is_read: bool
    created_at: datetime
    class Config:
        from_attributes = True
