from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from pydantic import BaseModel, Field
from datetime import datetime

from utils.database import get_db
from models.database import Project, Analysis

router = APIRouter()

# Pydantic Models
class ProjectCreate(BaseModel):
    name: str = Field(..., description="プロジェクト名")
    description: Optional[str] = Field(None, description="プロジェクト説明")
    industry_type: str = Field(..., description="業界種別")
    target_area: str = Field(..., description="対象商圏住所")

class ProjectResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    industry_type: str
    target_area: str
    created_at: datetime
    updated_at: datetime

class AnalysisRequest(BaseModel):
    project_id: str
    analysis_type: str = Field(..., description="分析種別: demographics, competitors, demand, roi")
    latitude: Optional[float] = None
    longitude: Optional[float] = None

@router.post("/projects", response_model=ProjectResponse)
async def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db)
):
    """
    新規プロジェクト作成
    """
    try:
        db_project = Project(
            name=project.name,
            description=project.description,
            industry_type=project.industry_type,
            target_area=project.target_area
        )
        
        db.add(db_project)
        db.commit()
        db.refresh(db_project)
        
        return ProjectResponse(
            id=db_project.id,
            name=db_project.name,
            description=db_project.description,
            industry_type=db_project.industry_type,
            target_area=db_project.target_area,
            created_at=db_project.created_at,
            updated_at=db_project.updated_at
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"プロジェクト作成エラー: {str(e)}")

@router.get("/projects", response_model=List[ProjectResponse])
async def get_projects(
    db: Session = Depends(get_db),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """
    プロジェクト一覧取得
    """
    projects = db.query(Project).offset(offset).limit(limit).all()
    
    return [
        ProjectResponse(
            id=project.id,
            name=project.name,
            description=project.description,
            industry_type=project.industry_type,
            target_area=project.target_area,
            created_at=project.created_at,
            updated_at=project.updated_at
        )
        for project in projects
    ]

@router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    db: Session = Depends(get_db)
):
    """
    プロジェクト詳細取得
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="プロジェクトが見つかりません")
    
    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        industry_type=project.industry_type,
        target_area=project.target_area,
        created_at=project.created_at,
        updated_at=project.updated_at
    )

@router.put("/projects/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    project_update: ProjectCreate,
    db: Session = Depends(get_db)
):
    """
    プロジェクト更新
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="プロジェクトが見つかりません")
    
    try:
        project.name = project_update.name
        project.description = project_update.description
        project.industry_type = project_update.industry_type
        project.target_area = project_update.target_area
        project.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(project)
        
        return ProjectResponse(
            id=project.id,
            name=project.name,
            description=project.description,
            industry_type=project.industry_type,
            target_area=project.target_area,
            created_at=project.created_at,
            updated_at=project.updated_at
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"プロジェクト更新エラー: {str(e)}")

@router.delete("/projects/{project_id}")
async def delete_project(
    project_id: str,
    db: Session = Depends(get_db)
):
    """
    プロジェクト削除
    """
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="プロジェクトが見つかりません")
    
    try:
        db.delete(project)
        db.commit()
        
        return {"message": "プロジェクトを削除しました", "project_id": project_id}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"プロジェクト削除エラー: {str(e)}")

@router.post("/analyses")
async def create_analysis(
    analysis_request: AnalysisRequest,
    db: Session = Depends(get_db)
):
    """
    分析実行（MVP版では基本的なモック）
    """
    # プロジェクト存在確認
    project = db.query(Project).filter(Project.id == analysis_request.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="プロジェクトが見つかりません")
    
    try:
        # 分析レコード作成
        analysis = Analysis(
            project_id=analysis_request.project_id,
            analysis_type=analysis_request.analysis_type,
            latitude=analysis_request.latitude,
            longitude=analysis_request.longitude,
            status="processing"
        )
        
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        
        # MVP版では基本的なモックデータを返す
        mock_results = _generate_mock_analysis_results(
            analysis_request.analysis_type, 
            project.industry_type
        )
        
        # 結果を保存
        analysis.population_data = mock_results.get("population_data")
        analysis.competitor_data = mock_results.get("competitor_data")
        analysis.demand_metrics = mock_results.get("demand_metrics")
        analysis.roi_projections = mock_results.get("roi_projections")
        analysis.status = "completed"
        
        db.commit()
        
        return {
            "analysis_id": analysis.id,
            "status": "completed",
            "results": mock_results,
            "message": f"{analysis_request.analysis_type}分析が完了しました"
        }
        
    except Exception as e:
        if 'analysis' in locals():
            analysis.status = "error"
            db.commit()
        raise HTTPException(status_code=500, detail=f"分析エラー: {str(e)}")

@router.get("/analyses/{analysis_id}")
async def get_analysis(
    analysis_id: str,
    db: Session = Depends(get_db)
):
    """
    分析結果取得
    """
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="分析が見つかりません")
    
    return {
        "id": analysis.id,
        "project_id": analysis.project_id,
        "analysis_type": analysis.analysis_type,
        "status": analysis.status,
        "results": {
            "population_data": analysis.population_data,
            "competitor_data": analysis.competitor_data,
            "demand_metrics": analysis.demand_metrics,
            "roi_projections": analysis.roi_projections
        },
        "created_at": analysis.created_at
    }

@router.get("/projects/{project_id}/analyses")
async def get_project_analyses(
    project_id: str,
    db: Session = Depends(get_db),
    analysis_type: Optional[str] = Query(None, description="分析種別でフィルタ")
):
    """
    プロジェクトの分析一覧取得
    """
    query = db.query(Analysis).filter(Analysis.project_id == project_id)
    
    if analysis_type:
        query = query.filter(Analysis.analysis_type == analysis_type)
    
    analyses = query.order_by(Analysis.created_at.desc()).all()
    
    return [
        {
            "id": analysis.id,
            "analysis_type": analysis.analysis_type,
            "status": analysis.status,
            "created_at": analysis.created_at
        }
        for analysis in analyses
    ]

def _generate_mock_analysis_results(analysis_type: str, industry_type: str) -> Dict:
    """
    MVP版のモック分析データ生成
    将来的にはここで実際のAPI呼び出しと計算ロジックを実装
    """
    base_population = 50000  # 基本人口
    
    if analysis_type == "demographics":
        return {
            "population_data": {
                "total_population": base_population,
                "households": base_population // 2.3,
                "age_groups": {
                    "20-29": int(base_population * 0.15),
                    "30-39": int(base_population * 0.18),
                    "40-49": int(base_population * 0.16),
                    "50-59": int(base_population * 0.14),
                    "60+": int(base_population * 0.25)
                },
                "income_brackets": {
                    "低所得": int(base_population * 0.25),
                    "中所得": int(base_population * 0.55),
                    "高所得": int(base_population * 0.20)
                }
            }
        }
    
    elif analysis_type == "competitors":
        return {
            "competitor_data": {
                "total_competitors": 12,
                "competitor_density": 0.24,  # per 1000 people
                "average_distance": 350,  # meters
                "competitors": [
                    {"name": f"競合店{i+1}", "distance": 200 + i*100, "rating": 3.5 + (i%10)*0.1}
                    for i in range(5)
                ]
            }
        }
    
    elif analysis_type == "demand":
        industry_multipliers = {
            "beauty": 0.03,
            "restaurant": 0.08,
            "retail": 0.05,
            "healthcare": 0.025
        }
        
        multiplier = industry_multipliers.get(industry_type, 0.04)
        estimated_demand = int(base_population * multiplier)
        
        return {
            "demand_metrics": {
                "monthly_demand": estimated_demand,
                "seasonal_factor": 1.2,
                "growth_rate": 0.05,
                "market_saturation": 0.65,
                "addressable_market": int(estimated_demand * 0.75)
            }
        }
    
    elif analysis_type == "roi":
        return {
            "roi_projections": {
                "investment_scenarios": {
                    "conservative": {"budget": 200000, "expected_roi": 1.8, "months_to_positive": 8},
                    "moderate": {"budget": 350000, "expected_roi": 2.4, "months_to_positive": 6},
                    "aggressive": {"budget": 500000, "expected_roi": 3.1, "months_to_positive": 4}
                },
                "risk_factors": ["競合密度", "季節性", "初期認知度"]
            }
        }
    
    return {"message": "Unknown analysis type"} 