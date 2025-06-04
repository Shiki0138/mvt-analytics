from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from contextlib import asynccontextmanager

from api.routes import analysis, simulator, reports
from utils.database import init_db
from utils.config import get_settings

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 起動時の処理
    await init_db()
    yield
    # 終了時の処理（必要に応じて）

app = FastAPI(
    title="MVT Analytics System",
    description="見込み客ボリューム & リスク最適化分析システム",
    version="0.4.0",
    lifespan=lifespan
)

# 環境に応じたCORS設定
allowed_origins = [
    "http://localhost:3000", 
    "http://localhost:5173",  # Vite開発サーバー
]

# プロダクション環境のフロントエンドURL
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

# Railway環境での動的オリジン許可
railway_frontend = os.getenv("RAILWAY_STATIC_URL")
if railway_frontend:
    allowed_origins.append(f"https://{railway_frontend}")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーター登録
app.include_router(analysis.router, prefix="/api/analysis", tags=["分析"])
app.include_router(simulator.router, prefix="/api/simulator", tags=["シミュレーション"])
app.include_router(reports.router, prefix="/api/reports", tags=["レポート"])

@app.get("/")
async def root():
    return {
        "message": "MVT Analytics System API",
        "version": "0.4.0",
        "status": "running",
        "environment": os.getenv("RAILWAY_ENVIRONMENT", "development")
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),  # Railway対応
        reload=False,  # プロダクション用
        log_level="info"
    ) 