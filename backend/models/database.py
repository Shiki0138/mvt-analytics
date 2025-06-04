from sqlalchemy import Column, Integer, Float, String, DateTime, JSON, Boolean, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

Base = declarative_base()

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(200), nullable=False)
    description = Column(Text)
    industry_type = Column(String(50))  # beauty, restaurant, retail, etc.
    target_area = Column(String(200))  # 対象商圏住所
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    analyses = relationship("Analysis", back_populates="project")
    simulations = relationship("SalesSimulation", back_populates="project")

class Analysis(Base):
    __tablename__ = "analyses"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    analysis_type = Column(String(50))  # demographics, competitors, demand, roi
    
    # Geospatial Data
    latitude = Column(Float)
    longitude = Column(Float)
    isochrone_data = Column(JSON)  # GeoJSON polygon
    
    # Analysis Results
    population_data = Column(JSON)
    competitor_data = Column(JSON)
    demand_metrics = Column(JSON)
    roi_projections = Column(JSON)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(20), default="pending")  # pending, processing, completed, error
    
    # Relationships
    project = relationship("Project", back_populates="analyses")

class SalesSimulation(Base):
    __tablename__ = "sales_simulations"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    
    # Input Parameters
    target_monthly_sales = Column(Float, nullable=False)
    average_order_value = Column(Float, nullable=False)
    conversion_rate = Column(Float, nullable=False)  # CVR
    selected_media = Column(JSON)  # ["google_ads", "facebook_ads", etc.]
    
    # Calculated Results
    required_customers = Column(Float)
    required_reach = Column(Float)
    required_budget = Column(Float)
    breakeven_months = Column(Integer)
    
    # Cash Flow Data
    cashflow_projection = Column(JSON)  # [{month: 1, revenue: 1000, cost: 800, profit: 200}, ...]
    funnel_data = Column(JSON)  # {reach: 10000, clicks: 300, customers: 9}
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    project = relationship("Project", back_populates="simulations")

class CPABenchmark(Base):
    __tablename__ = "cpa_benchmarks"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    industry = Column(String(50), nullable=False)
    media_type = Column(String(50), nullable=False)  # google_ads, facebook_ads, instagram_ads
    
    # CPA/CVR Metrics
    average_cpa = Column(Float, nullable=False)
    q1_cpa = Column(Float)  # 第1四分位
    median_cpa = Column(Float)  # 中央値
    q3_cpa = Column(Float)  # 第3四分位
    
    average_cvr = Column(Float, nullable=False)
    average_ctr = Column(Float)  # Click Through Rate
    
    # Metadata
    updated_at = Column(DateTime, default=datetime.utcnow)
    data_source = Column(String(100))  # internal, google_ads_api, meta_api, etc.

class GeographicCache(Base):
    __tablename__ = "geographic_cache"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    cache_key = Column(String(200), unique=True, nullable=False)
    data_type = Column(String(50))  # demographics, isochrone, competitors
    
    # Cached Data
    data = Column(JSON, nullable=False)
    
    # Cache Management
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    hit_count = Column(Integer, default=0)

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    
    # Report Content
    title = Column(String(200), nullable=False)
    content = Column(JSON)  # Structured report data
    charts_data = Column(JSON)  # Chart configurations
    
    # Export Status
    pdf_path = Column(String(500))
    pptx_path = Column(String(500))
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    project = relationship("Project")

# Initialize default CPA data
DEFAULT_CPA_DATA = [
    {"industry": "beauty", "media_type": "google_ads", "average_cpa": 3000, "median_cpa": 2800, "average_cvr": 0.03},
    {"industry": "beauty", "media_type": "facebook_ads", "average_cpa": 2500, "median_cpa": 2300, "average_cvr": 0.025},
    {"industry": "beauty", "media_type": "instagram_ads", "average_cpa": 2800, "median_cpa": 2600, "average_cvr": 0.028},
    {"industry": "restaurant", "media_type": "google_ads", "average_cpa": 2000, "median_cpa": 1800, "average_cvr": 0.05},
    {"industry": "restaurant", "media_type": "facebook_ads", "average_cpa": 1800, "median_cpa": 1600, "average_cvr": 0.045},
    {"industry": "restaurant", "media_type": "instagram_ads", "average_cpa": 2200, "median_cpa": 2000, "average_cvr": 0.042},
    {"industry": "retail", "media_type": "google_ads", "average_cpa": 1500, "median_cpa": 1300, "average_cvr": 0.02},
    {"industry": "retail", "media_type": "facebook_ads", "average_cpa": 1200, "median_cpa": 1000, "average_cvr": 0.018},
    {"industry": "retail", "media_type": "instagram_ads", "average_cpa": 1400, "median_cpa": 1200, "average_cvr": 0.019},
] 