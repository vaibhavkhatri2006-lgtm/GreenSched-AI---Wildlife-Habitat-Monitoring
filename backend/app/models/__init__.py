from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Text, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="Viewer")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    monitoring_areas = relationship("MonitoringArea", back_populates="owner")
    alerts = relationship("Alert", back_populates="user")

class MonitoringArea(Base):
    __tablename__ = "monitoring_areas"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    geojson = Column(JSON)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    area_km2 = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    owner = relationship("User", back_populates="monitoring_areas")
    analysis_runs = relationship("AnalysisRun", back_populates="monitoring_area")

class AnalysisRun(Base):
    __tablename__ = "analysis_runs"
    id = Column(Integer, primary_key=True, index=True)
    monitoring_area_id = Column(Integer, ForeignKey("monitoring_areas.id"))
    baseline_start = Column(DateTime, nullable=True)
    baseline_end = Column(DateTime, nullable=True)
    current_start = Column(DateTime, nullable=True)
    current_end = Column(DateTime, nullable=True)
    satellite_source = Column(String, default="Sentinel-2")
    cloud_cover = Column(Float, nullable=True)
    status = Column(String, default="QUEUED")
    
    ndvi_change = Column(Float, nullable=True)
    ndwi_change = Column(Float, nullable=True)
    ndbi_change = Column(Float, nullable=True)
    
    vegetation_loss_area_km2 = Column(Float, nullable=True)
    water_change_area_km2 = Column(Float, nullable=True)
    builtup_change_area_km2 = Column(Float, nullable=True)
    
    hotspot_count = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    monitoring_area = relationship("MonitoringArea", back_populates="analysis_runs")
    hotspots = relationship("Hotspot", back_populates="analysis_run")
    alerts = relationship("Alert", back_populates="analysis_run")
    reports = relationship("Report", back_populates="analysis_run")

class Hotspot(Base):
    __tablename__ = "hotspots"
    id = Column(Integer, primary_key=True, index=True)
    analysis_run_id = Column(Integer, ForeignKey("analysis_runs.id"))
    type = Column(String)
    severity = Column(String)
    confidence = Column(Float, nullable=True)
    area_km2 = Column(Float, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    geometry = Column(JSON)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    analysis_run = relationship("AnalysisRun", back_populates="hotspots")

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    analysis_run_id = Column(Integer, ForeignKey("analysis_runs.id"), nullable=True)
    title = Column(String)
    message = Column(Text)
    severity = Column(String)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="alerts")
    analysis_run = relationship("AnalysisRun", back_populates="alerts")

class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    analysis_run_id = Column(Integer, ForeignKey("analysis_runs.id"))
    title = Column(String)
    summary = Column(Text)
    recommendations = Column(JSON)
    file_path = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    analysis_run = relationship("AnalysisRun", back_populates="reports")
