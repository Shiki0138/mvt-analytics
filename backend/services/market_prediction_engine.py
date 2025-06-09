"""
ローカルビジネス向け市場予測エンジン
Market Prediction Engine for Local Business

主要機能:
1. 商圏人口・需要予測
2. 競合分析・飽和度計算
3. 季節性・トレンド分析
4. リスク評価・最適化提案
"""

import json
import asyncio
import httpx
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

@dataclass
class BusinessProfile:
    """ビジネスプロファイル"""
    industry: str
    location: str
    target_radius: int = 500  # meters
    target_age_min: int = 20
    target_age_max: int = 60
    average_spend: float = 5000
    monthly_capacity: int = 1000

@dataclass
class MarketPrediction:
    """市場予測結果"""
    total_market_size: int
    addressable_market: int
    monthly_demand: int
    competition_score: float
    market_saturation: float
    growth_potential: float
    risk_score: float
    confidence: float
    key_insights: List[str]
    recommendations: List[str]

class MarketPredictionEngine:
    """市場予測エンジン"""
    
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)
        
        # 業界別データ（実データベース化予定）
        self.industry_data = {
            "beauty": {
                "penetration_rate": 0.08,  # 人口の8%が月1回利用
                "frequency_monthly": 1.2,
                "seasonal_patterns": [0.9, 1.0, 1.3, 1.1, 1.0, 0.9, 0.8, 0.8, 1.0, 1.1, 1.2, 1.4],
                "competition_threshold": 0.3,  # 1000人あたり0.3店舗で飽和
                "avg_customer_lifetime": 18  # months
            },
            "restaurant": {
                "penetration_rate": 0.25,
                "frequency_monthly": 4.5,
                "seasonal_patterns": [0.8, 0.9, 1.0, 1.1, 1.0, 1.1, 1.2, 1.1, 1.0, 1.0, 1.1, 1.3],
                "competition_threshold": 1.2,
                "avg_customer_lifetime": 24
            },
            "healthcare": {
                "penetration_rate": 0.15,
                "frequency_monthly": 2.0,
                "seasonal_patterns": [1.2, 1.1, 1.0, 0.9, 0.9, 0.8, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3],
                "competition_threshold": 0.8,
                "avg_customer_lifetime": 36
            },
            "fitness": {
                "penetration_rate": 0.12,
                "frequency_monthly": 8.0,
                "seasonal_patterns": [1.4, 1.2, 1.1, 1.0, 1.0, 0.9, 0.8, 0.9, 1.0, 1.1, 1.0, 1.2],
                "competition_threshold": 0.5,
                "avg_customer_lifetime": 12
            }
        }
    
    async def predict_market(self, business: BusinessProfile) -> MarketPrediction:
        """
        包括的市場予測を実行
        """
        try:
            # 並列で各種データを取得
            demographic_data, competitor_data, economic_data = await asyncio.gather(
                self._get_demographic_data(business.location, business.target_radius),
                self._analyze_competitors(business.location, business.industry, business.target_radius),
                self._get_economic_indicators(business.location),
                return_exceptions=True
            )
            
            # 基本市場サイズ計算
            market_size = self._calculate_market_size(demographic_data, business)
            
            # 競合分析
            competition_analysis = self._analyze_competition(competitor_data, market_size, business)
            
            # 需要予測
            demand_forecast = self._forecast_demand(market_size, competition_analysis, business)
            
            # リスク評価
            risk_assessment = self._assess_risks(demographic_data, competitor_data, economic_data, business)
            
            # 洞察と推奨事項生成
            insights, recommendations = self._generate_insights(
                market_size, competition_analysis, demand_forecast, risk_assessment, business
            )
            
            return MarketPrediction(
                total_market_size=market_size["total"],
                addressable_market=market_size["addressable"],
                monthly_demand=demand_forecast["monthly_customers"],
                competition_score=competition_analysis["score"],
                market_saturation=competition_analysis["saturation"],
                growth_potential=demand_forecast["growth_potential"],
                risk_score=risk_assessment["overall_risk"],
                confidence=self._calculate_confidence(demographic_data, competitor_data),
                key_insights=insights,
                recommendations=recommendations
            )
            
        except Exception as e:
            logger.error(f"市場予測エラー: {str(e)}")
            return self._get_fallback_prediction(business)
    
    async def _get_demographic_data(self, location: str, radius: int) -> Dict:
        """
        商圏内の人口統計データを取得
        将来的には e-Stat API や RESAS API を使用
        """
        # MVP版はモックデータ
        base_population = 45000
        
        return {
            "total_population": base_population,
            "households": int(base_population / 2.3),
            "age_distribution": {
                "0-19": int(base_population * 0.18),
                "20-29": int(base_population * 0.13),
                "30-39": int(base_population * 0.16),
                "40-49": int(base_population * 0.15),
                "50-59": int(base_population * 0.14),
                "60+": int(base_population * 0.24)
            },
            "income_distribution": {
                "low": int(base_population * 0.28),
                "middle": int(base_population * 0.52),
                "high": int(base_population * 0.20)
            },
            "working_population": int(base_population * 0.65),
            "commuter_ratio": 0.35  # 昼間人口変動
        }
    
    async def _analyze_competitors(self, location: str, industry: str, radius: int) -> Dict:
        """
        競合店舗分析
        将来的には Google Places API を使用
        """
        # 業界別の競合密度を模擬
        industry_competitor_counts = {
            "beauty": 8,
            "restaurant": 15,
            "healthcare": 5,
            "fitness": 3
        }
        
        competitor_count = industry_competitor_counts.get(industry, 6)
        
        return {
            "total_competitors": competitor_count,
            "competitors": [
                {
                    "name": f"競合店{i+1}",
                    "distance": 200 + i * 100,
                    "rating": 3.2 + (i % 4) * 0.3,
                    "estimated_customers": 400 + i * 50,
                    "price_range": "middle" if i % 2 == 0 else "low"
                }
                for i in range(competitor_count)
            ]
        }
    
    async def _get_economic_indicators(self, location: str) -> Dict:
        """
        地域経済指標取得
        """
        return {
            "gdp_growth": 0.012,
            "employment_rate": 0.97,
            "consumer_confidence": 105.2,
            "local_income_trend": "stable",
            "development_projects": 2  # 近隣開発プロジェクト数
        }
    
    def _calculate_market_size(self, demographic: Dict, business: BusinessProfile) -> Dict:
        """
        市場規模計算
        """
        if not demographic:
            demographic = {"total_population": 40000, "age_distribution": {}}
        
        total_pop = demographic["total_population"]
        age_dist = demographic.get("age_distribution", {})
        
        # ターゲット年齢層の人口計算
        target_population = 0
        for age_range, population in age_dist.items():
            # 簡易的な年齢層マッチング
            if any(str(age) in age_range for age in range(business.target_age_min, business.target_age_max + 1)):
                target_population += population
        
        # フォールバック
        if target_population == 0:
            target_population = int(total_pop * 0.4)  # 40%をターゲット層と仮定
        
        # 業界データ適用
        industry_data = self.industry_data.get(business.industry, self.industry_data["beauty"])
        
        # 理論市場規模
        theoretical_market = int(target_population * industry_data["penetration_rate"])
        
        # 実際にアクセス可能な市場（通勤・移動パターン考慮）
        accessibility_factor = 0.7 if business.target_radius <= 500 else 0.5
        addressable_market = int(theoretical_market * accessibility_factor)
        
        return {
            "total": theoretical_market,
            "addressable": addressable_market,
            "target_population": target_population
        }
    
    def _analyze_competition(self, competitor_data: Dict, market_size: Dict, business: BusinessProfile) -> Dict:
        """
        競合分析・市場飽和度計算
        """
        if not competitor_data:
            competitor_data = {"total_competitors": 5, "competitors": []}
        
        competitor_count = competitor_data["total_competitors"]
        population = market_size["target_population"]
        
        # 業界データ取得
        industry_data = self.industry_data.get(business.industry, self.industry_data["beauty"])
        
        # 競合密度計算（1000人あたりの店舗数）
        competition_density = (competitor_count / population) * 1000
        
        # 飽和度計算
        saturation = competition_density / industry_data["competition_threshold"]
        
        # 競合スコア（0-100、低いほど競合が少ない）
        competition_score = min(saturation * 100, 100)
        
        return {
            "density": competition_density,
            "saturation": saturation,
            "score": competition_score,
            "market_share_available": max(0, 1 - saturation)
        }
    
    def _forecast_demand(self, market_size: Dict, competition: Dict, business: BusinessProfile) -> Dict:
        """
        需要予測
        """
        industry_data = self.industry_data.get(business.industry, self.industry_data["beauty"])
        
        # 基本需要（月次）
        addressable_market = market_size["addressable"]
        monthly_frequency = industry_data["frequency_monthly"]
        
        # 理論的月次需要
        theoretical_monthly_demand = int(addressable_market * monthly_frequency)
        
        # 競合による調整
        market_share = 1.0 / (1 + competition["density"])  # 競合が多いほどシェア減少
        adjusted_demand = int(theoretical_monthly_demand * market_share)
        
        # 成長ポテンシャル
        growth_potential = 1 - competition["saturation"]
        growth_potential = max(0, min(1, growth_potential))
        
        return {
            "monthly_customers": adjusted_demand,
            "growth_potential": growth_potential,
            "theoretical_max": theoretical_monthly_demand
        }
    
    def _assess_risks(self, demographic: Dict, competitor: Dict, economic: Dict, business: BusinessProfile) -> Dict:
        """
        リスク評価
        """
        risks = []
        risk_score = 0.0
        
        # 人口リスク
        if demographic and demographic["total_population"] < 30000:
            risks.append("商圏人口が小規模")
            risk_score += 0.2
        
        # 競合リスク
        if competitor and competitor["total_competitors"] > 10:
            risks.append("競合密度が高い")
            risk_score += 0.3
        
        # 経済リスク
        if economic and economic.get("gdp_growth", 0) < 0:
            risks.append("地域経済の成長鈍化")
            risk_score += 0.2
        
        # 業界特有リスク
        industry_data = self.industry_data.get(business.industry, {})
        if industry_data.get("avg_customer_lifetime", 12) < 12:
            risks.append("顧客離反率が高い業界")
            risk_score += 0.1
        
        return {
            "overall_risk": min(risk_score, 1.0),
            "risk_factors": risks
        }
    
    def _generate_insights(self, market_size: Dict, competition: Dict, demand: Dict, risk: Dict, business: BusinessProfile) -> Tuple[List[str], List[str]]:
        """
        洞察と推奨事項生成
        """
        insights = []
        recommendations = []
        
        # 市場サイズ関連
        addressable = market_size["addressable"]
        if addressable > 5000:
            insights.append(f"商圏内のターゲット顧客は{addressable:,}人と十分な規模")
        else:
            insights.append(f"商圏内のターゲット顧客は{addressable:,}人と限定的")
            recommendations.append("商圏拡大またはターゲット層の見直しを検討")
        
        # 競合関連
        if competition["saturation"] < 0.7:
            insights.append("市場にまだ参入余地あり")
            recommendations.append("早期参入で先行者利益を確保")
        else:
            insights.append("市場の競合密度が高い")
            recommendations.append("差別化戦略とニッチ市場開拓が重要")
        
        # 需要関連
        monthly_demand = demand["monthly_customers"]
        if monthly_demand >= business.monthly_capacity:
            insights.append(f"月間予想需要{monthly_demand:,}人で収容能力を上回る")
            recommendations.append("追加の収容能力確保を検討")
        elif monthly_demand < business.monthly_capacity * 0.5:
            insights.append("需要に対して収容能力が過大")
            recommendations.append("コスト構造の見直しまたは需要創出施策")
        
        # リスク関連
        if risk["overall_risk"] > 0.6:
            recommendations.append("リスク軽減策の事前準備が必要")
        
        return insights, recommendations
    
    def _calculate_confidence(self, demographic: Dict, competitor: Dict) -> float:
        """
        予測信頼度計算
        """
        confidence = 0.8  # ベース信頼度
        
        if not demographic:
            confidence -= 0.2
        if not competitor:
            confidence -= 0.1
        
        return max(0.3, confidence)
    
    def _get_fallback_prediction(self, business: BusinessProfile) -> MarketPrediction:
        """
        エラー時のフォールバック予測
        """
        return MarketPrediction(
            total_market_size=1000,
            addressable_market=700,
            monthly_demand=350,
            competition_score=50.0,
            market_saturation=0.5,
            growth_potential=0.3,
            risk_score=0.4,
            confidence=0.3,
            key_insights=["データ取得に失敗したため簡易予測を表示"],
            recommendations=["詳細分析のため再実行を推奨"]
        )

# 季節性・トレンド分析機能
class SeasonalAnalyzer:
    """季節性・トレンド分析"""
    
    def __init__(self, prediction_engine: MarketPredictionEngine):
        self.engine = prediction_engine
    
    def analyze_seasonal_trends(self, business: BusinessProfile, months_ahead: int = 12) -> Dict:
        """
        季節性トレンド分析
        """
        industry_data = self.engine.industry_data.get(business.industry, {})
        seasonal_patterns = industry_data.get("seasonal_patterns", [1.0] * 12)
        
        current_month = datetime.now().month
        future_trends = []
        
        for i in range(months_ahead):
            month_index = (current_month - 1 + i) % 12
            seasonal_factor = seasonal_patterns[month_index]
            month_name = datetime(2024, month_index + 1, 1).strftime("%m月")
            
            future_trends.append({
                "month": month_name,
                "seasonal_factor": seasonal_factor,
                "demand_index": int(seasonal_factor * 100),
                "recommendation": self._get_seasonal_recommendation(seasonal_factor)
            })
        
        return {
            "seasonal_trends": future_trends,
            "peak_months": self._identify_peak_months(seasonal_patterns),
            "low_months": self._identify_low_months(seasonal_patterns)
        }
    
    def _get_seasonal_recommendation(self, factor: float) -> str:
        """季節要因に基づく推奨事項"""
        if factor > 1.2:
            return "需要増期 - 在庫・スタッフ増強"
        elif factor > 1.0:
            return "通常期 - 標準運営"
        else:
            return "需要減期 - プロモーション強化"
    
    def _identify_peak_months(self, patterns: List[float]) -> List[str]:
        """ピーク月特定"""
        max_factor = max(patterns)
        peak_indices = [i for i, factor in enumerate(patterns) if factor >= max_factor * 0.9]
        return [datetime(2024, i + 1, 1).strftime("%m月") for i in peak_indices]
    
    def _identify_low_months(self, patterns: List[float]) -> List[str]:
        """低需要月特定"""
        min_factor = min(patterns)
        low_indices = [i for i, factor in enumerate(patterns) if factor <= min_factor * 1.1]
        return [datetime(2024, i + 1, 1).strftime("%m月") for i in low_indices]

# 使用例とテスト
async def test_market_prediction():
    """テスト関数"""
    engine = MarketPredictionEngine()
    
    business = BusinessProfile(
        industry="beauty",
        location="東京都渋谷区",
        target_radius=800,
        target_age_min=25,
        target_age_max=45,
        average_spend=8000,
        monthly_capacity=500
    )
    
    prediction = await engine.predict_market(business)
    
    print("=== 市場予測結果 ===")
    print(f"総市場規模: {prediction.total_market_size:,}人")
    print(f"獲得可能市場: {prediction.addressable_market:,}人") 
    print(f"月間予想需要: {prediction.monthly_demand:,}人")
    print(f"競合スコア: {prediction.competition_score:.1f}/100")
    print(f"市場飽和度: {prediction.market_saturation:.1%}")
    print(f"成長ポテンシャル: {prediction.growth_potential:.1%}")
    print(f"リスクスコア: {prediction.risk_score:.1%}")
    print(f"予測信頼度: {prediction.confidence:.1%}")
    
    print("\n=== 主要洞察 ===")
    for insight in prediction.key_insights:
        print(f"• {insight}")
    
    print("\n=== 推奨事項 ===")
    for rec in prediction.recommendations:
        print(f"• {rec}")

if __name__ == "__main__":
    asyncio.run(test_market_prediction())