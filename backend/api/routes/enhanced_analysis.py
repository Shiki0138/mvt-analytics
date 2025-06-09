"""
拡張分析エンドポイント
Enhanced Analysis API Routes

新機能:
1. 市場予測分析
2. リスク最適化
3. 包括的ビジネス分析
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Dict, Optional
import asyncio
import logging

from services.market_prediction_engine import (
    MarketPredictionEngine, 
    BusinessProfile, 
    MarketPrediction,
    SeasonalAnalyzer
)
from services.risk_optimization_engine import (
    RiskOptimizationEngine,
    BusinessConstraints,
    OptimizationResult,
    RealTimeOptimizer
)

router = APIRouter()
logger = logging.getLogger(__name__)

# Pydantic Models
class BusinessProfileRequest(BaseModel):
    industry: str = Field(..., description="業界 (beauty, restaurant, healthcare, fitness)")
    location: str = Field(..., description="所在地")
    target_radius: int = Field(500, description="ターゲット半径(m)")
    target_age_min: int = Field(20, description="ターゲット年齢下限")
    target_age_max: int = Field(60, description="ターゲット年齢上限") 
    average_spend: float = Field(5000, description="平均顧客単価")
    monthly_capacity: int = Field(1000, description="月間対応可能顧客数")

class BusinessConstraintsRequest(BaseModel):
    total_budget: int = Field(..., description="総予算")
    monthly_budget_limit: int = Field(..., description="月間予算上限")
    min_monthly_profit: int = Field(..., description="最低月間利益")
    max_risk_tolerance: float = Field(0.5, description="最大リスク許容度 (0.0-1.0)")
    target_customers: int = Field(..., description="目標顧客数")
    target_roi: float = Field(200.0, description="目標ROI (%)")
    time_horizon: int = Field(12, description="計画期間 (月)")

class OptimizationRequest(BaseModel):
    business_profile: BusinessProfileRequest
    constraints: BusinessConstraintsRequest
    selected_channels: Optional[List[str]] = None

class CurrentMetricsRequest(BaseModel):
    roi: float = Field(..., description="現在のROI")
    cpa: float = Field(..., description="現在のCPA")
    cvr: float = Field(..., description="現在のCVR")
    monthly_cost: float = Field(..., description="月間コスト")
    monthly_revenue: float = Field(..., description="月間売上")

# グローバルエンジンインスタンス
market_engine = MarketPredictionEngine()
risk_engine = RiskOptimizationEngine()
seasonal_analyzer = SeasonalAnalyzer(market_engine)
realtime_optimizer = RealTimeOptimizer(risk_engine)

@router.post("/market-prediction", response_model=Dict)
async def analyze_market_prediction(request: BusinessProfileRequest):
    """
    市場予測分析API
    商圏分析・競合分析・需要予測を統合実行
    """
    try:
        # BusinessProfile オブジェクト作成
        business_profile = BusinessProfile(
            industry=request.industry,
            location=request.location,
            target_radius=request.target_radius,
            target_age_min=request.target_age_min,
            target_age_max=request.target_age_max,
            average_spend=request.average_spend,
            monthly_capacity=request.monthly_capacity
        )
        
        # 市場予測実行
        prediction = await market_engine.predict_market(business_profile)
        
        # 季節性分析も同時実行
        seasonal_data = seasonal_analyzer.analyze_seasonal_trends(business_profile)
        
        return {
            "status": "success",
            "prediction": {
                "total_market_size": prediction.total_market_size,
                "addressable_market": prediction.addressable_market,
                "monthly_demand": prediction.monthly_demand,
                "competition_score": prediction.competition_score,
                "market_saturation": prediction.market_saturation,
                "growth_potential": prediction.growth_potential,
                "risk_score": prediction.risk_score,
                "confidence": prediction.confidence,
                "key_insights": prediction.key_insights,
                "recommendations": prediction.recommendations
            },
            "seasonal_analysis": seasonal_data,
            "analysis_timestamp": asyncio.get_event_loop().time()
        }
        
    except Exception as e:
        logger.error(f"市場予測エラー: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"市場予測分析でエラーが発生しました: {str(e)}"
        )

@router.post("/risk-optimization", response_model=Dict)
async def optimize_marketing_risk(request: OptimizationRequest):
    """
    リスク最適化API
    マーケティング予算最適化・リスク評価・シナリオ分析
    """
    try:
        # BusinessConstraints オブジェクト作成
        constraints = BusinessConstraints(
            total_budget=request.constraints.total_budget,
            monthly_budget_limit=request.constraints.monthly_budget_limit,
            min_monthly_profit=request.constraints.min_monthly_profit,
            max_risk_tolerance=request.constraints.max_risk_tolerance,
            target_customers=request.constraints.target_customers,
            target_roi=request.constraints.target_roi,
            time_horizon=request.constraints.time_horizon
        )
        
        # 最適化実行
        optimization_result = risk_engine.optimize_marketing_budget(
            constraints=constraints,
            industry=request.business_profile.industry,
            selected_channels=request.selected_channels
        )
        
        return {
            "status": "success",
            "optimization": {
                "recommended_allocation": optimization_result.recommended_allocation,
                "expected_roi": optimization_result.expected_roi,
                "expected_customers": optimization_result.expected_customers,
                "expected_revenue": optimization_result.expected_revenue,
                "risk_score": optimization_result.risk_score,
                "confidence": optimization_result.confidence,
                "monthly_projections": optimization_result.monthly_projections,
                "risk_mitigation_plan": optimization_result.risk_mitigation_plan,
                "alternative_scenarios": optimization_result.alternative_scenarios
            },
            "analysis_timestamp": asyncio.get_event_loop().time()
        }
        
    except Exception as e:
        logger.error(f"リスク最適化エラー: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"リスク最適化でエラーが発生しました: {str(e)}"
        )

@router.post("/comprehensive-analysis", response_model=Dict)
async def run_comprehensive_analysis(request: OptimizationRequest):
    """
    包括的分析API
    市場予測 + リスク最適化 + 季節性分析を統合実行
    """
    try:
        # BusinessProfile と BusinessConstraints オブジェクト作成
        business_profile = BusinessProfile(
            industry=request.business_profile.industry,
            location=request.business_profile.location,
            target_radius=request.business_profile.target_radius,
            target_age_min=request.business_profile.target_age_min,
            target_age_max=request.business_profile.target_age_max,
            average_spend=request.business_profile.average_spend,
            monthly_capacity=request.business_profile.monthly_capacity
        )
        
        constraints = BusinessConstraints(
            total_budget=request.constraints.total_budget,
            monthly_budget_limit=request.constraints.monthly_budget_limit,
            min_monthly_profit=request.constraints.min_monthly_profit,
            max_risk_tolerance=request.constraints.max_risk_tolerance,
            target_customers=request.constraints.target_customers,
            target_roi=request.constraints.target_roi,
            time_horizon=request.constraints.time_horizon
        )
        
        # 並列実行で高速化
        market_prediction_task = market_engine.predict_market(business_profile)
        
        # 同期関数を非同期タスクで実行
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor() as executor:
            optimization_future = executor.submit(
                risk_engine.optimize_marketing_budget,
                constraints=constraints,
                industry=request.business_profile.industry,
                selected_channels=request.selected_channels
            )
            seasonal_future = executor.submit(
                seasonal_analyzer.analyze_seasonal_trends,
                business_profile
            )
        
            # 結果取得
            market_prediction = await market_prediction_task
            optimization_result = optimization_future.result()
            seasonal_data = seasonal_future.result()
        
        # 統合分析結果
        integrated_insights = _generate_integrated_insights(
            market_prediction, optimization_result, seasonal_data
        )
        
        return {
            "status": "success",
            "comprehensive_analysis": {
                "market_prediction": {
                    "total_market_size": market_prediction.total_market_size,
                    "addressable_market": market_prediction.addressable_market,
                    "monthly_demand": market_prediction.monthly_demand,
                    "competition_score": market_prediction.competition_score,
                    "market_saturation": market_prediction.market_saturation,
                    "growth_potential": market_prediction.growth_potential,
                    "risk_score": market_prediction.risk_score,
                    "confidence": market_prediction.confidence,
                    "key_insights": market_prediction.key_insights,
                    "recommendations": market_prediction.recommendations
                },
                "risk_optimization": {
                    "recommended_allocation": optimization_result.recommended_allocation,
                    "expected_roi": optimization_result.expected_roi,
                    "expected_customers": optimization_result.expected_customers,
                    "expected_revenue": optimization_result.expected_revenue,
                    "risk_score": optimization_result.risk_score,
                    "confidence": optimization_result.confidence,
                    "monthly_projections": optimization_result.monthly_projections,
                    "risk_mitigation_plan": optimization_result.risk_mitigation_plan,
                    "alternative_scenarios": optimization_result.alternative_scenarios
                },
                "seasonal_analysis": seasonal_data,
                "integrated_insights": integrated_insights
            },
            "analysis_timestamp": asyncio.get_event_loop().time(),
            "processing_time": "< 3 seconds"  # 目標性能
        }
        
    except Exception as e:
        logger.error(f"包括的分析エラー: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"包括的分析でエラーが発生しました: {str(e)}"
        )

@router.post("/realtime-optimization", response_model=Dict)
async def analyze_realtime_performance(request: CurrentMetricsRequest):
    """
    リアルタイム最適化API
    現在の成果を分析し、即座に改善提案を生成
    """
    try:
        current_metrics = {
            "roi": request.roi,
            "cpa": request.cpa,
            "cvr": request.cvr,
            "cost": request.monthly_cost,
            "revenue": request.monthly_revenue
        }
        
        # リアルタイム分析実行
        realtime_analysis = realtime_optimizer.analyze_performance(current_metrics)
        
        return {
            "status": "success",
            "realtime_analysis": realtime_analysis,
            "analysis_timestamp": asyncio.get_event_loop().time()
        }
        
    except Exception as e:
        logger.error(f"リアルタイム最適化エラー: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"リアルタイム最適化でエラーが発生しました: {str(e)}"
        )

@router.get("/available-channels", response_model=Dict)
async def get_available_channels():
    """
    利用可能なマーケティングチャネル一覧取得
    """
    channels = {}
    for name, channel in risk_engine.channels.items():
        channels[name] = {
            "name": channel.name,
            "min_budget": channel.min_budget,
            "max_budget": channel.max_budget,
            "expected_cpc": channel.expected_cpc,
            "expected_ctr": channel.expected_ctr,
            "expected_cvr": channel.expected_cvr,
            "setup_cost": channel.setup_cost,
            "risk_factors": channel.risk_factors
        }
    
    return {
        "status": "success",
        "channels": channels
    }

@router.get("/industry-benchmarks/{industry}", response_model=Dict)
async def get_industry_benchmarks(industry: str):
    """
    業界ベンチマークデータ取得
    """
    if industry not in market_engine.industry_data:
        raise HTTPException(
            status_code=404,
            detail=f"業界データが見つかりません: {industry}"
        )
    
    industry_data = market_engine.industry_data[industry]
    
    return {
        "status": "success",
        "industry": industry,
        "benchmarks": {
            "penetration_rate": industry_data["penetration_rate"],
            "frequency_monthly": industry_data["frequency_monthly"],
            "seasonal_patterns": industry_data["seasonal_patterns"],
            "competition_threshold": industry_data["competition_threshold"],
            "avg_customer_lifetime": industry_data["avg_customer_lifetime"]
        }
    }

def _generate_integrated_insights(
    market_prediction: MarketPrediction, 
    optimization_result: OptimizationResult, 
    seasonal_data: Dict
) -> List[str]:
    """
    統合洞察生成
    """
    insights = []
    
    # 市場とマーケティングの整合性チェック
    market_demand = market_prediction.monthly_demand
    marketing_customers = optimization_result.expected_customers
    
    if marketing_customers > market_demand * 0.8:
        insights.append(
            f"🎯 マーケティング目標（{marketing_customers}人）が市場需要（{market_demand}人）に対して適切な水準"
        )
    elif marketing_customers < market_demand * 0.3:
        insights.append(
            f"📈 市場需要（{market_demand}人）に対してマーケティング目標が控えめ - 攻めの余地あり"
        )
    
    # リスクとリターンのバランス評価
    if optimization_result.risk_score < 0.3 and optimization_result.expected_roi > 200:
        insights.append("⭐ 低リスク・高リターンの理想的なポートフォリオ")
    elif optimization_result.risk_score > 0.6:
        insights.append("⚠️ リスクレベルが高め - 段階的投資を推奨")
    
    # 季節性との連動性
    peak_months = seasonal_data.get("peak_months", [])
    if peak_months:
        insights.append(
            f"📅 {', '.join(peak_months)}がピーク期 - この時期の予算増額を検討"
        )
    
    # 総合評価
    overall_confidence = (market_prediction.confidence + optimization_result.confidence) / 2
    if overall_confidence > 0.8:
        insights.append("🎉 高信頼度の分析結果 - 計画実行に適した条件")
    elif overall_confidence < 0.5:
        insights.append("📊 予測精度向上のため追加データ収集を推奨")
    
    return insights