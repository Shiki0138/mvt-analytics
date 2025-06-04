from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from pydantic import BaseModel, Field

from services.sales_funnel_simulator import SalesFunnelSimulator, SimulationInput, SimulationOutput
from utils.database import get_db
from models.database import SalesSimulation, Project

router = APIRouter()

# Pydantic Models for API
class SimulationInputAPI(BaseModel):
    target_monthly_sales: float = Field(..., description="目標月売上", gt=0)
    average_order_value: float = Field(..., description="平均客単価", gt=0)
    conversion_rate: float = Field(..., description="コンバージョン率", gt=0, le=1)
    selected_media: List[str] = Field(..., description="選択した広告媒体")
    industry: str = Field(..., description="業界種別")
    fixed_costs: float = Field(0.0, description="月間固定費", ge=0)
    variable_cost_rate: float = Field(0.3, description="変動費率", ge=0, le=1)

class SimulationOutputAPI(BaseModel):
    required_customers: float
    required_reach: float
    required_budget: float
    breakeven_months: int
    cashflow_projection: List[Dict]
    funnel_data: Dict
    media_breakdown: Dict

class SimulationCreateRequest(BaseModel):
    project_id: str
    simulation_input: SimulationInputAPI

class ScenarioComparison(BaseModel):
    scenarios: Dict[str, SimulationInputAPI]

@router.post("/simulate", response_model=SimulationOutputAPI)
async def run_simulation(
    simulation_input: SimulationInputAPI,
    db: Session = Depends(get_db)
):
    """
    売上目標から逆算シミュレーションを実行
    """
    try:
        simulator = SalesFunnelSimulator(db)
        
        # Pydantic -> Dataclass 変換
        inputs = SimulationInput(
            target_monthly_sales=simulation_input.target_monthly_sales,
            average_order_value=simulation_input.average_order_value,
            conversion_rate=simulation_input.conversion_rate,
            selected_media=simulation_input.selected_media,
            industry=simulation_input.industry,
            fixed_costs=simulation_input.fixed_costs,
            variable_cost_rate=simulation_input.variable_cost_rate
        )
        
        # シミュレーション実行
        outputs = simulator.simulate(inputs)
        
        return SimulationOutputAPI(
            required_customers=outputs.required_customers,
            required_reach=outputs.required_reach,
            required_budget=outputs.required_budget,
            breakeven_months=outputs.breakeven_months,
            cashflow_projection=outputs.cashflow_projection,
            funnel_data=outputs.funnel_data,
            media_breakdown=outputs.media_breakdown
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"シミュレーション実行エラー: {str(e)}")

@router.post("/simulate-and-save")
async def simulate_and_save(
    request: SimulationCreateRequest,
    db: Session = Depends(get_db)
):
    """
    シミュレーション実行 & データベース保存
    """
    try:
        # プロジェクト存在確認
        project = db.query(Project).filter(Project.id == request.project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="プロジェクトが見つかりません")
        
        simulator = SalesFunnelSimulator(db)
        
        # シミュレーション実行
        inputs = SimulationInput(
            target_monthly_sales=request.simulation_input.target_monthly_sales,
            average_order_value=request.simulation_input.average_order_value,
            conversion_rate=request.simulation_input.conversion_rate,
            selected_media=request.simulation_input.selected_media,
            industry=request.simulation_input.industry,
            fixed_costs=request.simulation_input.fixed_costs,
            variable_cost_rate=request.simulation_input.variable_cost_rate
        )
        
        outputs = simulator.simulate(inputs)
        
        # データベース保存
        simulation_id = simulator.save_simulation(request.project_id, inputs, outputs)
        
        return {
            "simulation_id": simulation_id,
            "message": "シミュレーション完了・保存しました",
            "results": {
                "required_customers": outputs.required_customers,
                "required_reach": outputs.required_reach,
                "required_budget": outputs.required_budget,
                "breakeven_months": outputs.breakeven_months
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"シミュレーション保存エラー: {str(e)}")

@router.get("/simulations/{simulation_id}")
async def get_simulation(
    simulation_id: str,
    db: Session = Depends(get_db)
):
    """
    保存されたシミュレーション結果を取得
    """
    simulation = db.query(SalesSimulation).filter(SalesSimulation.id == simulation_id).first()
    
    if not simulation:
        raise HTTPException(status_code=404, detail="シミュレーションが見つかりません")
    
    return {
        "id": simulation.id,
        "project_id": simulation.project_id,
        "target_monthly_sales": simulation.target_monthly_sales,
        "average_order_value": simulation.average_order_value,
        "conversion_rate": simulation.conversion_rate,
        "selected_media": simulation.selected_media,
        "required_customers": simulation.required_customers,
        "required_reach": simulation.required_reach,
        "required_budget": simulation.required_budget,
        "breakeven_months": simulation.breakeven_months,
        "cashflow_projection": simulation.cashflow_projection,
        "funnel_data": simulation.funnel_data,
        "created_at": simulation.created_at
    }

@router.get("/projects/{project_id}/simulations")
async def get_project_simulations(
    project_id: str,
    db: Session = Depends(get_db),
    limit: int = Query(10, ge=1, le=100)
):
    """
    プロジェクト別のシミュレーション一覧取得
    """
    simulations = db.query(SalesSimulation).filter(
        SalesSimulation.project_id == project_id
    ).order_by(SalesSimulation.created_at.desc()).limit(limit).all()
    
    return [
        {
            "id": sim.id,
            "target_monthly_sales": sim.target_monthly_sales,
            "required_budget": sim.required_budget,
            "breakeven_months": sim.breakeven_months,
            "created_at": sim.created_at
        }
        for sim in simulations
    ]

@router.post("/compare-scenarios")
async def compare_scenarios(
    base_scenario: SimulationInputAPI,
    comparison: ScenarioComparison,
    db: Session = Depends(get_db)
):
    """
    複数シナリオの比較分析
    """
    try:
        simulator = SalesFunnelSimulator(db)
        
        # ベースシナリオの実行
        base_inputs = SimulationInput(
            target_monthly_sales=base_scenario.target_monthly_sales,
            average_order_value=base_scenario.average_order_value,
            conversion_rate=base_scenario.conversion_rate,
            selected_media=base_scenario.selected_media,
            industry=base_scenario.industry,
            fixed_costs=base_scenario.fixed_costs,
            variable_cost_rate=base_scenario.variable_cost_rate
        )
        
        base_outputs = simulator.simulate(base_inputs)
        
        # 比較シナリオの実行
        scenario_results = {}
        for scenario_name, scenario_input in comparison.scenarios.items():
            scenario_inputs = SimulationInput(
                target_monthly_sales=scenario_input.target_monthly_sales,
                average_order_value=scenario_input.average_order_value,
                conversion_rate=scenario_input.conversion_rate,
                selected_media=scenario_input.selected_media,
                industry=scenario_input.industry,
                fixed_costs=scenario_input.fixed_costs,
                variable_cost_rate=scenario_input.variable_cost_rate
            )
            
            scenario_outputs = simulator.simulate(scenario_inputs)
            scenario_results[scenario_name] = {
                "required_budget": scenario_outputs.required_budget,
                "breakeven_months": scenario_outputs.breakeven_months,
                "required_customers": scenario_outputs.required_customers,
                "budget_diff": scenario_outputs.required_budget - base_outputs.required_budget,
                "breakeven_diff": scenario_outputs.breakeven_months - base_outputs.breakeven_months
            }
        
        return {
            "base_scenario": {
                "required_budget": base_outputs.required_budget,
                "breakeven_months": base_outputs.breakeven_months,
                "required_customers": base_outputs.required_customers
            },
            "scenarios": scenario_results,
            "summary": {
                "best_budget": min(scenario_results.items(), key=lambda x: x[1]["required_budget"]),
                "best_breakeven": min(scenario_results.items(), key=lambda x: x[1]["breakeven_months"])
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"シナリオ比較エラー: {str(e)}")

@router.get("/media-types")
async def get_available_media_types():
    """
    利用可能な広告媒体一覧を取得
    """
    return {
        "media_types": [
            {"id": "google_ads", "name": "Google 広告", "description": "検索・ディスプレイ広告"},
            {"id": "facebook_ads", "name": "Facebook 広告", "description": "SNS広告"},
            {"id": "instagram_ads", "name": "Instagram 広告", "description": "ビジュアル重視SNS広告"},
            {"id": "youtube_ads", "name": "YouTube 広告", "description": "動画広告"},
            {"id": "twitter_ads", "name": "Twitter 広告", "description": "リアルタイムSNS広告"},
            {"id": "line_ads", "name": "LINE 広告", "description": "国内最大メッセージアプリ広告"}
        ]
    }

@router.get("/industries")
async def get_available_industries():
    """
    対応業界一覧を取得
    """
    return {
        "industries": [
            {"id": "beauty", "name": "美容・エステ", "default_cvr": 0.03},
            {"id": "restaurant", "name": "飲食店", "default_cvr": 0.05},
            {"id": "retail", "name": "小売・物販", "default_cvr": 0.02},
            {"id": "healthcare", "name": "医療・ヘルスケア", "default_cvr": 0.025},
            {"id": "education", "name": "教育・スクール", "default_cvr": 0.04},
            {"id": "real_estate", "name": "不動産", "default_cvr": 0.015},
            {"id": "financial", "name": "金融・保険", "default_cvr": 0.01},
            {"id": "automotive", "name": "自動車", "default_cvr": 0.008}
        ]
    } 