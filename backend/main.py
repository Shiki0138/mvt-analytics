from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import asyncpg
import json
from datetime import datetime

app = FastAPI(title="MVT Analytics", version="1.0.0")

# CORS設定（本番用）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番では適切なドメインに限定
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 簡単なデータモデル
class Project(BaseModel):
    id: Optional[int] = None
    name: str
    description: str
    created_at: Optional[datetime] = None

class SimulationRequest(BaseModel):
    project_id: int
    budget: float
    target_audience: int

class SimulationResult(BaseModel):
    id: Optional[int] = None
    project_id: int
    estimated_leads: int
    estimated_cost: float
    roi_percentage: float

# データベース接続（簡略化）
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./mvt_analytics.db")

@app.get("/")
async def root():
    return {"message": "MVT Analytics API", "status": "running"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

@app.get("/api/projects", response_model=List[Project])
async def get_projects():
    # 簡単なサンプルデータ
    return [
        Project(id=1, name="サンプルプロジェクト", description="テスト用プロジェクト", created_at=datetime.now()),
    ]

@app.post("/api/projects", response_model=Project)
async def create_project(project: Project):
    # 簡単な実装
    project.id = 1
    project.created_at = datetime.now()
    return project

@app.post("/api/simulations", response_model=SimulationResult)
async def run_simulation(simulation: SimulationRequest):
    # 簡単なシミュレーション計算
    estimated_leads = int(simulation.budget * 0.1)
    estimated_cost = simulation.budget * 0.8
    roi_percentage = (estimated_leads * 10000 - simulation.budget) / simulation.budget * 100
    
    return SimulationResult(
        id=1,
        project_id=simulation.project_id,
        estimated_leads=estimated_leads,
        estimated_cost=estimated_cost,
        roi_percentage=round(roi_percentage, 2)
    )

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port) 