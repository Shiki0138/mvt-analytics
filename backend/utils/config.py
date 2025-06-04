from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Database - Railway/Supabase対応
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./mvt_analytics.db")
    
    # Supabase Settings
    supabase_url: Optional[str] = os.getenv("SUPABASE_URL")
    supabase_anon_key: Optional[str] = os.getenv("SUPABASE_ANON_KEY")
    
    # API Keys (オプション - MVP版では不要)
    estat_api_key: Optional[str] = None
    resas_api_key: Optional[str] = None
    google_places_api_key: Optional[str] = None
    
    # Simplified rate limits
    rate_limit_default: int = 60  # 1 req/s
    
    # Cache Settings (軽量)
    cache_ttl_default: int = 3600  # 1 hour
    
    # Default Values
    default_cpa: float = 3000.0
    default_cvr: float = 0.03
    
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