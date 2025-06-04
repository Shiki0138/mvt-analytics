from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from pydantic import BaseModel, Field
from datetime import datetime

from utils.database import get_db
from models.database import Report, Project, SalesSimulation, Analysis

router = APIRouter()

# Pydantic Models
class ReportCreate(BaseModel):
    project_id: str
    title: str = Field(..., description="レポートタイトル")
    include_analysis: bool = Field(True, description="分析結果を含める")
    include_simulation: bool = Field(True, description="シミュレーション結果を含める")
    chart_types: List[str] = Field(default=["funnel", "cashflow", "demographics"], description="含めるチャート種別")

class ReportResponse(BaseModel):
    id: str
    project_id: str
    title: str
    created_at: datetime
    pdf_path: Optional[str]
    pptx_path: Optional[str]

@router.post("/generate", response_model=ReportResponse)
async def generate_report(
    report_request: ReportCreate,
    db: Session = Depends(get_db)
):
    """
    プロジェクトレポート生成
    """
    try:
        # プロジェクト存在確認
        project = db.query(Project).filter(Project.id == report_request.project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="プロジェクトが見つかりません")
        
        # レポートコンテンツ生成
        report_content = await _generate_report_content(
            db, 
            project, 
            report_request.include_analysis, 
            report_request.include_simulation
        )
        
        # チャートデータ生成
        charts_data = await _generate_charts_data(
            db, 
            project, 
            report_request.chart_types
        )
        
        # レポートレコード作成
        report = Report(
            project_id=report_request.project_id,
            title=report_request.title,
            content=report_content,
            charts_data=charts_data
        )
        
        db.add(report)
        db.commit()
        db.refresh(report)
        
        return ReportResponse(
            id=report.id,
            project_id=report.project_id,
            title=report.title,
            created_at=report.created_at,
            pdf_path=report.pdf_path,
            pptx_path=report.pptx_path
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"レポート生成エラー: {str(e)}")

@router.get("/reports/{report_id}")
async def get_report(
    report_id: str,
    db: Session = Depends(get_db)
):
    """
    レポート詳細取得
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="レポートが見つかりません")
    
    return {
        "id": report.id,
        "project_id": report.project_id,
        "title": report.title,
        "content": report.content,
        "charts_data": report.charts_data,
        "created_at": report.created_at,
        "pdf_path": report.pdf_path,
        "pptx_path": report.pptx_path
    }

@router.get("/projects/{project_id}/reports")
async def get_project_reports(
    project_id: str,
    db: Session = Depends(get_db),
    limit: int = Query(20, ge=1, le=100)
):
    """
    プロジェクトのレポート一覧取得
    """
    reports = db.query(Report).filter(
        Report.project_id == project_id
    ).order_by(Report.created_at.desc()).limit(limit).all()
    
    return [
        {
            "id": report.id,
            "title": report.title,
            "created_at": report.created_at,
            "has_pdf": report.pdf_path is not None,
            "has_pptx": report.pptx_path is not None
        }
        for report in reports
    ]

@router.post("/reports/{report_id}/export")
async def export_report(
    report_id: str,
    format: str = Query(..., description="エクスポート形式: pdf, pptx"),
    db: Session = Depends(get_db)
):
    """
    レポートエクスポート（PDF/PowerPoint）
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="レポートが見つかりません")
    
    try:
        if format == "pdf":
            export_path = await _export_to_pdf(report)
            report.pdf_path = export_path
        elif format == "pptx":
            export_path = await _export_to_pptx(report)
            report.pptx_path = export_path
        else:
            raise HTTPException(status_code=400, detail="サポートされていない形式です")
        
        db.commit()
        
        return {
            "message": f"{format.upper()}エクスポート完了",
            "export_path": export_path,
            "download_url": f"/api/reports/download/{report.id}?format={format}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"エクスポートエラー: {str(e)}")

@router.get("/download/{report_id}")
async def download_report(
    report_id: str,
    format: str = Query(..., description="ダウンロード形式: pdf, pptx"),
    db: Session = Depends(get_db)
):
    """
    レポートファイルダウンロード
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="レポートが見つかりません")
    
    file_path = report.pdf_path if format == "pdf" else report.pptx_path
    
    if not file_path:
        raise HTTPException(status_code=404, detail=f"{format.upper()}ファイルが見つかりません")
    
    # 実際のファイルダウンロード処理はここで実装
    # MVP版では簡易レスポンス
    return {
        "message": f"{format.upper()}ダウンロード準備完了",
        "file_path": file_path,
        "note": "MVP版では実際のファイル配信は未実装"
    }

@router.get("/templates")
async def get_report_templates():
    """
    利用可能なレポートテンプレート一覧
    """
    return {
        "templates": [
            {
                "id": "business_plan",
                "name": "事業計画書",
                "description": "シミュレーション結果を含む事業計画資料",
                "sections": ["概要", "市場分析", "収益予測", "リスク分析"]
            },
            {
                "id": "market_analysis",
                "name": "市場分析レポート",
                "description": "商圏・競合・需要分析に特化したレポート",
                "sections": ["商圏人口", "競合状況", "需要予測", "機会分析"]
            },
            {
                "id": "simulation_summary",
                "name": "シミュレーション結果サマリー",
                "description": "売上シミュレーション結果の要約資料",
                "sections": ["シミュレーション条件", "結果概要", "シナリオ比較", "推奨事項"]
            }
        ]
    }

# 内部関数群

async def _generate_report_content(db: Session, project: Project, include_analysis: bool, include_simulation: bool) -> Dict:
    """レポートコンテンツの生成"""
    content = {
        "project_overview": {
            "name": project.name,
            "industry": project.industry_type,
            "target_area": project.target_area,
            "description": project.description
        },
        "generated_at": datetime.utcnow().isoformat()
    }
    
    if include_analysis:
        analyses = db.query(Analysis).filter(Analysis.project_id == project.id).all()
        content["analyses"] = [
            {
                "type": analysis.analysis_type,
                "status": analysis.status,
                "results": {
                    "population_data": analysis.population_data,
                    "competitor_data": analysis.competitor_data,
                    "demand_metrics": analysis.demand_metrics,
                    "roi_projections": analysis.roi_projections
                }
            }
            for analysis in analyses if analysis.status == "completed"
        ]
    
    if include_simulation:
        simulations = db.query(SalesSimulation).filter(
            SalesSimulation.project_id == project.id
        ).order_by(SalesSimulation.created_at.desc()).limit(5).all()
        
        content["simulations"] = [
            {
                "target_sales": sim.target_monthly_sales,
                "required_budget": sim.required_budget,
                "breakeven_months": sim.breakeven_months,
                "cashflow": sim.cashflow_projection,
                "funnel": sim.funnel_data
            }
            for sim in simulations
        ]
    
    return content

async def _generate_charts_data(db: Session, project: Project, chart_types: List[str]) -> Dict:
    """チャートデータの生成"""
    charts = {}
    
    # 最新のシミュレーション結果を取得
    latest_simulation = db.query(SalesSimulation).filter(
        SalesSimulation.project_id == project.id
    ).order_by(SalesSimulation.created_at.desc()).first()
    
    if latest_simulation and "funnel" in chart_types:
        charts["funnel"] = {
            "type": "funnel",
            "title": "顧客獲得ファネル",
            "data": latest_simulation.funnel_data
        }
    
    if latest_simulation and "cashflow" in chart_types:
        charts["cashflow"] = {
            "type": "line",
            "title": "キャッシュフロー予測",
            "data": latest_simulation.cashflow_projection
        }
    
    # 人口統計データ
    if "demographics" in chart_types:
        analysis = db.query(Analysis).filter(
            Analysis.project_id == project.id,
            Analysis.analysis_type == "demographics"
        ).first()
        
        if analysis and analysis.population_data:
            charts["demographics"] = {
                "type": "pie",
                "title": "年齢層分布",
                "data": analysis.population_data.get("age_groups", {})
            }
    
    return charts

async def _export_to_pdf(report: Report) -> str:
    """PDF エクスポート（MVP版では簡易実装）"""
    # 実際の実装では reportlab や weasyprint を使用
    export_path = f"exports/report_{report.id}.pdf"
    
    # MVP版では仮のパスを返す
    return export_path

async def _export_to_pptx(report: Report) -> str:
    """PowerPoint エクスポート（MVP版では簡易実装）"""
    # 実際の実装では python-pptx を使用
    export_path = f"exports/report_{report.id}.pptx"
    
    # MVP版では仮のパスを返す
    return export_path 