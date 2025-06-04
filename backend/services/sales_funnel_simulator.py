from typing import Dict, List, Optional, Tuple
import numpy as np
from dataclasses import dataclass
from sqlalchemy.orm import Session
from models.database import CPABenchmark, SalesSimulation
from utils.config import get_settings

settings = get_settings()

@dataclass
class SimulationInput:
    target_monthly_sales: float
    average_order_value: float
    conversion_rate: float
    selected_media: List[str]
    industry: str
    fixed_costs: float = 0.0  # 固定費
    variable_cost_rate: float = 0.3  # 変動費率

@dataclass
class SimulationOutput:
    required_customers: float
    required_reach: float
    required_budget: float
    breakeven_months: int
    cashflow_projection: List[Dict]
    funnel_data: Dict
    media_breakdown: Dict

class SalesFunnelSimulator:
    def __init__(self, db: Session):
        self.db = db
        self.settings = get_settings()
    
    def simulate(self, inputs: SimulationInput) -> SimulationOutput:
        """
        売上目標から逆算シミュレーション
        
        フロー:
        1. 目標売上 → 必要顧客数
        2. 必要顧客数 → 必要リーチ数
        3. 必要リーチ数 × 媒体別CPA → 広告予算
        4. 売上・コスト推移 → 損益分岐点
        """
        
        # 1. 必要顧客数の計算
        required_customers = inputs.target_monthly_sales / inputs.average_order_value
        
        # 2. 必要リーチ数の計算 (CVRから逆算)
        required_reach = required_customers / inputs.conversion_rate
        
        # 3. 媒体別CPA取得と予算計算
        media_breakdown = self._calculate_media_breakdown(
            inputs.selected_media, 
            inputs.industry, 
            required_customers
        )
        
        total_budget = sum(breakdown["budget"] for breakdown in media_breakdown.values())
        
        # 4. キャッシュフロー予測
        cashflow_projection = self._calculate_cashflow_projection(
            inputs.target_monthly_sales,
            total_budget,
            inputs.fixed_costs,
            inputs.variable_cost_rate
        )
        
        # 5. 損益分岐点の計算
        breakeven_months = self._calculate_breakeven_months(cashflow_projection)
        
        # 6. ファネルデータ作成
        funnel_data = self._create_funnel_data(
            required_reach, 
            required_customers, 
            inputs.conversion_rate
        )
        
        return SimulationOutput(
            required_customers=required_customers,
            required_reach=required_reach,
            required_budget=total_budget,
            breakeven_months=breakeven_months,
            cashflow_projection=cashflow_projection,
            funnel_data=funnel_data,
            media_breakdown=media_breakdown
        )
    
    def _calculate_media_breakdown(self, selected_media: List[str], industry: str, required_customers: float) -> Dict:
        """媒体別の予算配分とCPA/CVR情報を取得"""
        breakdown = {}
        
        for media in selected_media:
            # データベースからCPA/CVRベンチマークを取得
            benchmark = self.db.query(CPABenchmark).filter(
                CPABenchmark.industry == industry,
                CPABenchmark.media_type == media
            ).first()
            
            if not benchmark:
                # デフォルト値を使用
                benchmark = self._get_default_benchmark(industry, media)
            
            # 媒体ごとの顧客獲得数を均等配分（将来的には最適化可能）
            customers_per_media = required_customers / len(selected_media)
            budget_per_media = customers_per_media * benchmark.average_cpa
            
            breakdown[media] = {
                "customers": customers_per_media,
                "budget": budget_per_media,
                "cpa": benchmark.average_cpa,
                "cvr": benchmark.average_cvr,
                "median_cpa": benchmark.median_cpa or benchmark.average_cpa
            }
        
        return breakdown
    
    def _get_default_benchmark(self, industry: str, media: str) -> CPABenchmark:
        """デフォルトのCPA/CVR値を返す"""
        default_values = {
            ("beauty", "google_ads"): {"cpa": 3000, "cvr": 0.03},
            ("beauty", "facebook_ads"): {"cpa": 2500, "cvr": 0.025},
            ("beauty", "instagram_ads"): {"cpa": 2800, "cvr": 0.028},
            ("restaurant", "google_ads"): {"cpa": 2000, "cvr": 0.05},
            ("restaurant", "facebook_ads"): {"cpa": 1800, "cvr": 0.045},
            ("restaurant", "instagram_ads"): {"cpa": 2200, "cvr": 0.042},
            ("retail", "google_ads"): {"cpa": 1500, "cvr": 0.02},
            ("retail", "facebook_ads"): {"cpa": 1200, "cvr": 0.018},
            ("retail", "instagram_ads"): {"cpa": 1400, "cvr": 0.019},
        }
        
        key = (industry, media)
        values = default_values.get(key, {"cpa": 2000, "cvr": 0.025})  # 汎用デフォルト
        
        # CPABenchmarkオブジェクトを模擬
        class MockBenchmark:
            def __init__(self, cpa, cvr):
                self.average_cpa = cpa
                self.average_cvr = cvr
                self.median_cpa = cpa
        
        return MockBenchmark(values["cpa"], values["cvr"])
    
    def _calculate_cashflow_projection(self, monthly_sales: float, monthly_ad_budget: float, 
                                     fixed_costs: float, variable_cost_rate: float) -> List[Dict]:
        """月次キャッシュフロー予測（12ヶ月）"""
        projection = []
        cumulative_profit = 0
        
        for month in range(1, 13):
            # 売上は徐々に目標値に近づく（スケールアップ想定）
            sales_ramp_factor = min(1.0, month / 6)  # 6ヶ月で目標達成
            monthly_revenue = monthly_sales * sales_ramp_factor
            
            # コスト計算
            variable_costs = monthly_revenue * variable_cost_rate
            total_monthly_costs = monthly_ad_budget + fixed_costs + variable_costs
            
            # 利益計算
            monthly_profit = monthly_revenue - total_monthly_costs
            cumulative_profit += monthly_profit
            
            projection.append({
                "month": month,
                "revenue": round(monthly_revenue, 0),
                "ad_cost": round(monthly_ad_budget, 0),
                "fixed_cost": round(fixed_costs, 0),
                "variable_cost": round(variable_costs, 0),
                "total_cost": round(total_monthly_costs, 0),
                "monthly_profit": round(monthly_profit, 0),
                "cumulative_profit": round(cumulative_profit, 0)
            })
        
        return projection
    
    def _calculate_breakeven_months(self, cashflow_projection: List[Dict]) -> int:
        """損益分岐月数を計算"""
        for i, month_data in enumerate(cashflow_projection):
            if month_data["cumulative_profit"] >= 0:
                return i + 1
        return 12  # 12ヶ月以内に達成できない場合
    
    def _create_funnel_data(self, reach: float, customers: float, cvr: float) -> Dict:
        """ファネルデータを作成（可視化用）"""
        # 一般的なファネル想定値
        click_rate = 0.03  # CTR 3%
        clicks = reach * click_rate
        
        return {
            "reach": int(reach),
            "clicks": int(clicks),
            "customers": int(customers),
            "ctr": click_rate,
            "cvr": cvr,
            "stages": [
                {"name": "リーチ", "value": int(reach), "rate": 1.0},
                {"name": "クリック", "value": int(clicks), "rate": click_rate},
                {"name": "顧客獲得", "value": int(customers), "rate": cvr}
            ]
        }
    
    def save_simulation(self, project_id: str, inputs: SimulationInput, outputs: SimulationOutput) -> str:
        """シミュレーション結果をデータベースに保存"""
        simulation = SalesSimulation(
            project_id=project_id,
            target_monthly_sales=inputs.target_monthly_sales,
            average_order_value=inputs.average_order_value,
            conversion_rate=inputs.conversion_rate,
            selected_media=inputs.selected_media,
            required_customers=outputs.required_customers,
            required_reach=outputs.required_reach,
            required_budget=outputs.required_budget,
            breakeven_months=outputs.breakeven_months,
            cashflow_projection=outputs.cashflow_projection,
            funnel_data=outputs.funnel_data
        )
        
        self.db.add(simulation)
        self.db.commit()
        self.db.refresh(simulation)
        
        return simulation.id

def create_scenario_comparison(base_simulation: SimulationOutput, 
                             scenarios: Dict[str, SimulationInput]) -> Dict:
    """複数シナリオの比較分析"""
    comparison = {
        "base": {
            "budget": base_simulation.required_budget,
            "customers": base_simulation.required_customers,
            "breakeven": base_simulation.breakeven_months
        },
        "scenarios": {}
    }
    
    for scenario_name, scenario_input in scenarios.items():
        # 各シナリオのシミュレーション実行は省略（実装時に追加）
        pass
    
    return comparison 