from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import os
from datetime import datetime

app = FastAPI(title="MVT Analytics API", version="1.0.0")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# データベース初期化
def init_db():
    conn = sqlite3.connect('mvt_analytics.db')
    cursor = conn.cursor()
    
    # プロジェクトテーブル
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # サンプルデータ挿入
    cursor.execute('''
    INSERT OR IGNORE INTO projects (id, name, description) VALUES 
    (1, 'サンプル美容室', '渋谷区の美容室事業プロジェクト'),
    (2, 'カフェプロジェクト', '新宿区のカフェ事業計画'),
    (3, 'フィットネスジム', '池袋区のフィットネス事業')
    ''')
    
    conn.commit()
    conn.close()

# 起動時にDB初期化
init_db()

# データモデル
class Project(BaseModel):
    id: Optional[int] = None
    name: str
    description: Optional[str] = None
    created_at: Optional[str] = None

class Simulation(BaseModel):
    id: Optional[int] = None
    project_id: int
    name: str
    scenarios: Optional[dict] = None

class Analysis(BaseModel):
    id: Optional[int] = None
    project_id: int
    type: str
    results: Optional[dict] = None

# 基本エンドポイント
@app.get("/")
def read_root():
    return {"message": "MVT Analytics API", "status": "working", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "ok", "service": "mvt-analytics", "timestamp": datetime.now().isoformat()}

# プロジェクト API
@app.get("/api/projects")
def get_projects():
    conn = sqlite3.connect('mvt_analytics.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, description, created_at FROM projects")
    projects = []
    for row in cursor.fetchall():
        projects.append({
            "id": row[0],
            "name": row[1],
            "description": row[2],
            "created_at": row[3]
        })
    conn.close()
    return {"projects": projects}

@app.get("/api/projects/{project_id}")
def get_project(project_id: int):
    conn = sqlite3.connect('mvt_analytics.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, description, created_at FROM projects WHERE id = ?", (project_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            "id": row[0],
            "name": row[1],
            "description": row[2],
            "created_at": row[3]
        }
    raise HTTPException(status_code=404, detail="Project not found")

@app.post("/api/projects")
def create_project(project: Project):
    conn = sqlite3.connect('mvt_analytics.db')
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO projects (name, description) VALUES (?, ?)",
        (project.name, project.description)
    )
    project_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return {"id": project_id, "message": "Project created successfully"}

# シミュレーション API
@app.get("/api/projects/{project_id}/simulations")
def get_simulations(project_id: int):
    # モックデータ
    simulations = [
        {
            "id": 1,
            "name": "ベースケース",
            "created_at": "2024-06-04T10:00:00Z",
            "monthly_revenue": 1500000,
            "annual_revenue": 18000000
        },
        {
            "id": 2, 
            "name": "楽観シナリオ",
            "created_at": "2024-06-04T11:00:00Z",
            "monthly_revenue": 2000000,
            "annual_revenue": 24000000
        }
    ]
    return {"simulations": simulations}

@app.post("/api/projects/{project_id}/simulations")
def create_simulation(project_id: int, simulation: Simulation):
    return {"id": 1, "message": "Simulation created successfully"}

# 分析 API
@app.get("/api/projects/{project_id}/analyses")
def get_analyses(project_id: int):
    # モックデータ
    analyses = [
        {
            "id": 1,
            "type": "market_analysis",
            "title": "市場分析レポート",
            "created_at": "2024-06-04T10:00:00Z",
            "status": "completed"
        },
        {
            "id": 2,
            "type": "risk_analysis", 
            "title": "リスク分析レポート",
            "created_at": "2024-06-04T11:00:00Z",
            "status": "completed"
        }
    ]
    return {"analyses": analyses}

# レポート API
@app.get("/api/projects/{project_id}/reports")
def get_reports(project_id: int):
    # モックデータ
    reports = [
        {
            "id": 1,
            "title": "事業計画書",
            "type": "business_plan",
            "created_at": "2024-06-04T10:00:00Z",
            "status": "ready"
        }
    ]
    return {"reports": reports}

@app.post("/api/reports/generate")
def generate_report(report_data: dict):
    return {"id": 1, "message": "Report generation started", "status": "processing"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 