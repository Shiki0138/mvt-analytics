from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql://user:password@localhost/mvt_analytics"
    
    # API Keys
    estat_api_key: Optional[str] = None
    resas_api_key: Optional[str] = None
    google_places_api_key: Optional[str] = None
    openrouteservice_api_key: Optional[str] = None
    mapbox_api_key: Optional[str] = None
    
    # API Rate Limits (requests per minute)
    estat_rate_limit: int = 1200  # 20 req/s * 60
    resas_rate_limit: int = 300   # 5 req/s * 60
    nominatim_rate_limit: int = 60  # 1 req/s * 60
    openrouteservice_rate_limit: int = 120  # 2500/day ≈ 2 req/s
    google_places_rate_limit: int = 300
    
    # Cache Settings
    cache_ttl_demographics: int = 86400 * 30  # 30 days
    cache_ttl_competitors: int = 86400  # 1 day
    cache_ttl_isochrone: int = 86400 * 7  # 7 days
    
    # CPA/CVR Default Values (業界平均)
    default_cpa_google_ads: float = 3000.0
    default_cpa_facebook_ads: float = 2500.0
    default_cpa_instagram_ads: float = 2800.0
    default_cvr_beauty: float = 0.03  # 美容業界平均
    default_cvr_restaurant: float = 0.05  # 飲食業界平均
    default_cvr_retail: float = 0.02  # 小売業界平均
    
    # Geographic Settings
    default_isochrone_minutes: int = 15
    default_mesh_size: int = 500  # meters
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Singleton pattern
_settings: Optional[Settings] = None

def get_settings() -> Settings:
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings 