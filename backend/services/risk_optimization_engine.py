"""
リスク最適化エンジン
Risk Optimization Engine for Local Business Marketing

主要機能:
1. マーケティング予算最適化
2. リスク要因分析・評価
3. シナリオ別ROI計算
4. 段階的投資戦略提案
5. リアルタイム最適化推奨
"""

import json
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, asdict
from enum import Enum
import logging

logger = logging.getLogger(__name__)

class RiskLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class MarketingChannel:
    """マーケティングチャネル定義"""
    name: str
    min_budget: int
    max_budget: int
    expected_cpc: float
    expected_ctr: float
    expected_cvr: float
    setup_cost: int = 0
    risk_factors: List[str] = None

@dataclass
class BusinessConstraints:
    """ビジネス制約条件"""
    total_budget: int
    monthly_budget_limit: int
    min_monthly_profit: int
    max_risk_tolerance: float  # 0.0-1.0
    target_customers: int
    target_roi: float  # 目標ROI
    time_horizon: int = 12  # months

@dataclass
class OptimizationResult:
    """最適化結果"""
    recommended_allocation: Dict[str, int]
    expected_roi: float
    expected_customers: int
    expected_revenue: int
    risk_score: float
    confidence: float
    monthly_projections: List[Dict]
    risk_mitigation_plan: List[str]
    alternative_scenarios: List[Dict]

class RiskOptimizationEngine:
    """リスク最適化エンジン"""
    
    def __init__(self):
        # マーケティングチャネル定義
        self.channels = {
            "google_ads": MarketingChannel(
                name="Google広告",
                min_budget=30000,
                max_budget=1000000,
                expected_cpc=120,
                expected_ctr=0.03,
                expected_cvr=0.025,
                setup_cost=50000,
                risk_factors=["競合入札激化", "品質スコア変動", "季節性影響"]
            ),
            "facebook_ads": MarketingChannel(
                name="Facebook広告",
                min_budget=20000,
                max_budget=800000,
                expected_cpc=80,
                expected_ctr=0.035,
                expected_cvr=0.02,
                setup_cost=30000,
                risk_factors=["アルゴリズム変更", "オーディエンス枯渇", "広告疲れ"]
            ),
            "instagram_ads": MarketingChannel(
                name="Instagram広告",
                min_budget=20000,
                max_budget=800000,
                expected_cpc=90,
                expected_ctr=0.04,
                expected_cvr=0.018,
                setup_cost=30000,
                risk_factors=["若年層離れ", "コンテンツ品質依存", "視覚的競争"]
            ),
            "line_ads": MarketingChannel(
                name="LINE広告",
                min_budget=50000,
                max_budget=1500000,
                expected_cpc=150,
                expected_ctr=0.025,
                expected_cvr=0.03,
                setup_cost=100000,
                risk_factors=["ユーザー層限定", "高コスト", "配信量制限"]
            ),
            "seo_content": MarketingChannel(
                name="SEO・コンテンツ",
                min_budget=100000,
                max_budget=500000,
                expected_cpc=0,  # オーガニック
                expected_ctr=0.05,
                expected_cvr=0.035,
                setup_cost=200000,
                risk_factors=["効果発現遅延", "アルゴリズム変更", "競合コンテンツ"]
            ),
            "local_promotion": MarketingChannel(
                name="地域プロモーション",
                min_budget=50000,
                max_budget=300000,
                expected_cpc=50,
                expected_ctr=0.08,
                expected_cvr=0.05,
                setup_cost=20000,
                risk_factors=["地域限定効果", "測定困難", "天候影響"]
            )
        }
        
        # リスク要因データベース
        self.risk_factors = {
            "market_risks": {
                "新規競合参入": {"probability": 0.3, "impact": 0.4},
                "価格競争激化": {"probability": 0.4, "impact": 0.3},
                "需要減少": {"probability": 0.2, "impact": 0.6},
                "経済状況悪化": {"probability": 0.25, "impact": 0.5}
            },
            "operational_risks": {
                "スタッフ不足": {"probability": 0.4, "impact": 0.3},
                "品質問題": {"probability": 0.15, "impact": 0.7},
                "設備故障": {"probability": 0.2, "impact": 0.4},
                "供給網問題": {"probability": 0.3, "impact": 0.3}
            },
            "marketing_risks": {
                "広告効果低下": {"probability": 0.5, "impact": 0.4},
                "ブランド毀損": {"probability": 0.1, "impact": 0.8},
                "予算オーバー": {"probability": 0.3, "impact": 0.3},
                "測定誤差": {"probability": 0.4, "impact": 0.2}
            }
        }
    
    def optimize_marketing_budget(
        self, 
        constraints: BusinessConstraints,
        industry: str = "beauty",
        selected_channels: List[str] = None
    ) -> OptimizationResult:
        """
        マーケティング予算最適化
        """
        try:
            # チャネル選択
            if not selected_channels:
                selected_channels = ["google_ads", "facebook_ads", "local_promotion"]
            
            available_channels = {k: v for k, v in self.channels.items() if k in selected_channels}
            
            # 制約条件チェック
            if not self._validate_constraints(constraints, available_channels):
                return self._get_fallback_optimization()
            
            # 最適化実行
            optimal_allocation = self._run_optimization(constraints, available_channels, industry)
            
            # ROI・顧客数予測
            projections = self._calculate_projections(optimal_allocation, available_channels, constraints)
            
            # リスク評価
            risk_assessment = self._assess_portfolio_risk(optimal_allocation, available_channels, constraints)
            
            # 代替シナリオ生成
            alternatives = self._generate_alternative_scenarios(constraints, available_channels, industry)
            
            # リスク軽減計画
            mitigation_plan = self._create_mitigation_plan(risk_assessment, optimal_allocation)
            
            return OptimizationResult(
                recommended_allocation=optimal_allocation,
                expected_roi=projections["total_roi"],
                expected_customers=projections["total_customers"],
                expected_revenue=projections["total_revenue"],
                risk_score=risk_assessment["overall_risk"],
                confidence=projections["confidence"],
                monthly_projections=projections["monthly_data"],
                risk_mitigation_plan=mitigation_plan,
                alternative_scenarios=alternatives
            )
            
        except Exception as e:
            logger.error(f"最適化エラー: {str(e)}")
            return self._get_fallback_optimization()
    
    def _validate_constraints(self, constraints: BusinessConstraints, channels: Dict) -> bool:
        """制約条件バリデーション"""
        min_total_budget = sum(channel.min_budget for channel in channels.values())
        
        if constraints.total_budget < min_total_budget:
            logger.warning(f"予算不足: 最小予算{min_total_budget:,}円が必要")
            return False
        
        if constraints.max_risk_tolerance < 0 or constraints.max_risk_tolerance > 1:
            logger.warning("リスク許容度は0-1の範囲で指定してください")
            return False
        
        return True
    
    def _run_optimization(
        self, 
        constraints: BusinessConstraints, 
        channels: Dict[str, MarketingChannel], 
        industry: str
    ) -> Dict[str, int]:
        """
        実際の最適化アルゴリズム実行
        簡易版: 期待値計算ベースの最適化
        """
        total_budget = constraints.total_budget
        monthly_budget = constraints.monthly_budget_limit
        
        # 業界調整ファクター
        industry_factors = {
            "beauty": {"google": 1.2, "facebook": 1.1, "instagram": 1.3, "line": 0.9, "seo": 1.0, "local": 1.1},
            "restaurant": {"google": 1.0, "facebook": 1.2, "instagram": 1.1, "line": 1.1, "seo": 0.9, "local": 1.3},
            "healthcare": {"google": 1.1, "facebook": 0.8, "instagram": 0.7, "line": 1.0, "seo": 1.3, "local": 1.2},
            "fitness": {"google": 1.0, "facebook": 1.1, "instagram": 1.4, "line": 0.8, "seo": 1.1, "local": 1.0}
        }
        
        factors = industry_factors.get(industry, industry_factors["beauty"])
        
        # 各チャネルの効率性計算（ROI期待値）
        channel_efficiency = {}
        for name, channel in channels.items():
            factor_key = name.split('_')[0]  # google_ads -> google
            industry_factor = factors.get(factor_key, 1.0)
            
            # 効率性 = (CVR * CTR * 業界ファクター) / CPC
            if channel.expected_cpc > 0:
                efficiency = (channel.expected_cvr * channel.expected_ctr * industry_factor) / (channel.expected_cpc / 1000)
            else:
                efficiency = channel.expected_cvr * channel.expected_ctr * industry_factor * 10  # SEO等
            
            channel_efficiency[name] = efficiency
        
        # 効率性順でソート
        sorted_channels = sorted(channel_efficiency.items(), key=lambda x: x[1], reverse=True)
        
        # 予算配分（効率性重視 + リスク分散）
        allocation = {}
        remaining_budget = total_budget
        
        # セットアップコストを先に控除
        for name, channel in channels.items():
            remaining_budget -= channel.setup_cost
        
        # リスク許容度に応じた分散度合い調整
        if constraints.max_risk_tolerance > 0.7:
            # 高リスク許容: 効率重視（上位1-2チャネルに集中）
            concentration_factor = 0.8
        elif constraints.max_risk_tolerance > 0.4:
            # 中リスク許容: バランス
            concentration_factor = 0.6
        else:
            # 低リスク許容: 分散重視
            concentration_factor = 0.4
        
        # 最効率チャネルに予算集中
        primary_channel = sorted_channels[0][0]
        primary_budget = int(remaining_budget * concentration_factor)
        primary_budget = max(channels[primary_channel].min_budget, 
                           min(primary_budget, channels[primary_channel].max_budget))
        allocation[primary_channel] = primary_budget
        remaining_budget -= primary_budget
        
        # 残り予算を他チャネルに分散
        other_channels = [ch for ch, _ in sorted_channels[1:]]
        if other_channels and remaining_budget > 0:
            budget_per_channel = remaining_budget // len(other_channels)
            
            for channel_name in other_channels:
                channel = channels[channel_name]
                if budget_per_channel >= channel.min_budget:
                    budget = min(budget_per_channel, channel.max_budget)
                    allocation[channel_name] = budget
                    remaining_budget -= budget
        
        # セットアップコストを加算
        for name, channel in channels.items():
            if name in allocation:
                allocation[name] += channel.setup_cost
        
        return allocation
    
    def _calculate_projections(
        self, 
        allocation: Dict[str, int], 
        channels: Dict[str, MarketingChannel],
        constraints: BusinessConstraints
    ) -> Dict:
        """
        ROI・顧客数予測計算
        """
        monthly_data = []
        total_customers = 0
        total_revenue = 0
        total_cost = sum(allocation.values())
        
        for month in range(1, min(constraints.time_horizon + 1, 13)):
            month_customers = 0
            month_revenue = 0
            month_cost = 0
            
            for channel_name, budget in allocation.items():
                if channel_name not in channels:
                    continue
                    
                channel = channels[channel_name]
                monthly_budget = budget / constraints.time_horizon
                
                # 月次顧客獲得数計算
                if channel.expected_cpc > 0:
                    clicks = monthly_budget / channel.expected_cpc
                else:
                    clicks = monthly_budget / 100  # SEO等の仮定値
                
                conversions = clicks * channel.expected_ctr * channel.expected_cvr
                
                # 季節性調整（簡易版）
                seasonal_factor = self._get_seasonal_factor(month, channel_name)
                conversions *= seasonal_factor
                
                month_customers += int(conversions)
                month_cost += monthly_budget
            
            # 月次売上計算（顧客単価は制約から逆算）
            avg_customer_value = constraints.target_roi * total_cost / constraints.target_customers if constraints.target_customers > 0 else 5000
            month_revenue = month_customers * avg_customer_value
            
            month_profit = month_revenue - month_cost
            month_roi = (month_profit / month_cost * 100) if month_cost > 0 else 0
            
            monthly_data.append({
                "month": month,
                "customers": month_customers,
                "revenue": int(month_revenue),
                "cost": int(month_cost),
                "profit": int(month_profit),
                "roi": round(month_roi, 1)
            })
            
            total_customers += month_customers
            total_revenue += month_revenue
        
        overall_roi = ((total_revenue - total_cost) / total_cost * 100) if total_cost > 0 else 0
        
        # 信頼度計算（データ品質・予測精度の評価）
        confidence = 0.8
        if len(allocation) == 1:
            confidence -= 0.1  # 単一チャネルはリスキー
        if total_cost > constraints.total_budget * 0.9:
            confidence -= 0.1  # 予算上限近くは予測困難
        
        return {
            "total_customers": total_customers,
            "total_revenue": int(total_revenue),
            "total_roi": round(overall_roi, 1),
            "monthly_data": monthly_data,
            "confidence": max(0.3, confidence)
        }
    
    def _get_seasonal_factor(self, month: int, channel: str) -> float:
        """
        季節性ファクター取得
        """
        # 簡易的な季節性パターン
        seasonal_patterns = {
            "google_ads": [0.9, 1.0, 1.2, 1.1, 1.0, 0.9, 0.8, 0.8, 1.0, 1.1, 1.1, 1.3],
            "facebook_ads": [0.8, 0.9, 1.1, 1.0, 1.0, 1.0, 0.9, 0.9, 1.0, 1.1, 1.2, 1.4],
            "local_promotion": [0.7, 0.8, 1.3, 1.2, 1.1, 1.0, 0.9, 0.8, 1.0, 1.1, 1.0, 1.2]
        }
        
        pattern = seasonal_patterns.get(channel, [1.0] * 12)
        return pattern[(month - 1) % 12]
    
    def _assess_portfolio_risk(
        self, 
        allocation: Dict[str, int], 
        channels: Dict[str, MarketingChannel],
        constraints: BusinessConstraints
    ) -> Dict:
        """
        ポートフォリオリスク評価
        """
        total_budget = sum(allocation.values())
        weighted_risks = []
        risk_details = {}
        
        for channel_name, budget in allocation.items():
            if channel_name not in channels:
                continue
                
            channel = channels[channel_name]
            weight = budget / total_budget
            
            # チャネル固有リスク評価
            channel_risk = self._evaluate_channel_risk(channel_name, budget, constraints)
            weighted_risks.append(channel_risk * weight)
            
            risk_details[channel_name] = {
                "risk_score": channel_risk,
                "weight": weight,
                "risk_factors": channel.risk_factors or []
            }
        
        # ポートフォリオ全体リスク
        portfolio_risk = sum(weighted_risks)
        
        # 集中リスク（ハーフィンダール・ハーシュマン指数）
        concentration_index = sum((budget / total_budget) ** 2 for budget in allocation.values())
        concentration_risk = concentration_index * 0.3  # 最大30%のリスク追加
        
        overall_risk = min(portfolio_risk + concentration_risk, 1.0)
        
        return {
            "overall_risk": overall_risk,
            "concentration_risk": concentration_risk,
            "channel_risks": risk_details,
            "risk_level": self._categorize_risk_level(overall_risk)
        }
    
    def _evaluate_channel_risk(self, channel_name: str, budget: int, constraints: BusinessConstraints) -> float:
        """
        個別チャネルリスク評価
        """
        base_risks = {
            "google_ads": 0.3,
            "facebook_ads": 0.4,
            "instagram_ads": 0.4,
            "line_ads": 0.5,
            "seo_content": 0.2,
            "local_promotion": 0.3
        }
        
        base_risk = base_risks.get(channel_name, 0.4)
        
        # 予算規模による調整
        if budget > constraints.monthly_budget_limit * 6:  # 半年分以上
            base_risk += 0.1
        elif budget < constraints.monthly_budget_limit * 2:  # 2ヶ月分未満
            base_risk += 0.05
        
        return min(base_risk, 1.0)
    
    def _categorize_risk_level(self, risk_score: float) -> RiskLevel:
        """リスクレベル分類"""
        if risk_score >= 0.7:
            return RiskLevel.CRITICAL
        elif risk_score >= 0.5:
            return RiskLevel.HIGH
        elif risk_score >= 0.3:
            return RiskLevel.MEDIUM
        else:
            return RiskLevel.LOW
    
    def _create_mitigation_plan(self, risk_assessment: Dict, allocation: Dict[str, int]) -> List[str]:
        """
        リスク軽減計画作成
        """
        mitigation_plan = []
        
        overall_risk = risk_assessment["overall_risk"]
        concentration_risk = risk_assessment["concentration_risk"]
        
        # 全体リスクが高い場合
        if overall_risk > 0.6:
            mitigation_plan.append("📊 週次効果測定と予算調整の実施")
            mitigation_plan.append("🎯 複数の成果指標（CVR, CPA, ROAS）による監視")
        
        # 集中リスクが高い場合
        if concentration_risk > 0.2:
            mitigation_plan.append("💰 予算配分の分散化（追加チャネル検討）")
            mitigation_plan.append("🔄 月次予算再配分の実施")
        
        # チャネル別リスク対策
        for channel, risk_data in risk_assessment["channel_risks"].items():
            if risk_data["risk_score"] > 0.5:
                if channel == "google_ads":
                    mitigation_plan.append("🎯 Google広告: 品質スコア向上とキーワード分散")
                elif channel == "facebook_ads":
                    mitigation_plan.append("📱 Facebook広告: オーディエンス多様化とクリエイティブ最適化")
                elif channel == "seo_content":
                    mitigation_plan.append("📝 SEO: 複数検索エンジン対応とコンテンツ品質向上")
        
        # 一般的な推奨事項
        mitigation_plan.extend([
            "💡 A/Bテストによる継続的最適化",
            "📈 段階的予算投入（効果確認後の拡大）",
            "🛡️ 緊急時予算停止基準の事前設定"
        ])
        
        return mitigation_plan[:7]  # 最大7項目
    
    def _generate_alternative_scenarios(
        self, 
        constraints: BusinessConstraints, 
        channels: Dict[str, MarketingChannel], 
        industry: str
    ) -> List[Dict]:
        """
        代替シナリオ生成
        """
        scenarios = []
        
        # 保守的シナリオ
        conservative_constraints = BusinessConstraints(
            total_budget=int(constraints.total_budget * 0.7),
            monthly_budget_limit=constraints.monthly_budget_limit,
            min_monthly_profit=constraints.min_monthly_profit,
            max_risk_tolerance=0.3,
            target_customers=int(constraints.target_customers * 0.8),
            target_roi=constraints.target_roi * 0.8,
            time_horizon=constraints.time_horizon
        )
        
        conservative_result = self.optimize_marketing_budget(
            conservative_constraints, industry, ["google_ads", "local_promotion"]
        )
        
        scenarios.append({
            "name": "保守的シナリオ",
            "description": "リスクを最小限に抑えた安全策",
            "allocation": conservative_result.recommended_allocation,
            "expected_roi": conservative_result.expected_roi,
            "risk_score": conservative_result.risk_score
        })
        
        # 積極的シナリオ
        aggressive_constraints = BusinessConstraints(
            total_budget=int(constraints.total_budget * 1.2),
            monthly_budget_limit=int(constraints.monthly_budget_limit * 1.3),
            min_monthly_profit=constraints.min_monthly_profit,
            max_risk_tolerance=0.8,
            target_customers=int(constraints.target_customers * 1.3),
            target_roi=constraints.target_roi * 1.2,
            time_horizon=constraints.time_horizon
        )
        
        aggressive_result = self.optimize_marketing_budget(
            aggressive_constraints, industry, list(channels.keys())
        )
        
        scenarios.append({
            "name": "積極的シナリオ",
            "description": "高リターンを狙った攻めの戦略",
            "allocation": aggressive_result.recommended_allocation,
            "expected_roi": aggressive_result.expected_roi,
            "risk_score": aggressive_result.risk_score
        })
        
        return scenarios
    
    def _get_fallback_optimization(self) -> OptimizationResult:
        """
        フォールバック最適化結果
        """
        return OptimizationResult(
            recommended_allocation={"google_ads": 300000, "local_promotion": 200000},
            expected_roi=180.0,
            expected_customers=250,
            expected_revenue=1250000,
            risk_score=0.4,
            confidence=0.3,
            monthly_projections=[
                {"month": i, "customers": 20, "revenue": 100000, "cost": 40000, "profit": 60000, "roi": 150}
                for i in range(1, 13)
            ],
            risk_mitigation_plan=["データ不足のため簡易計算", "詳細分析の再実行推奨"],
            alternative_scenarios=[]
        )

# リアルタイム最適化クラス
class RealTimeOptimizer:
    """リアルタイム最適化"""
    
    def __init__(self, optimization_engine: RiskOptimizationEngine):
        self.engine = optimization_engine
        self.performance_history = []
    
    def analyze_performance(self, current_metrics: Dict) -> Dict:
        """
        現在の成果分析と最適化提案
        """
        # 成果履歴に追加
        self.performance_history.append({
            "timestamp": datetime.now(),
            "metrics": current_metrics
        })
        
        # トレンド分析
        trends = self._analyze_trends()
        
        # 最適化提案生成
        recommendations = self._generate_realtime_recommendations(current_metrics, trends)
        
        return {
            "current_performance": current_metrics,
            "trends": trends,
            "recommendations": recommendations,
            "urgency": self._assess_urgency(current_metrics)
        }
    
    def _analyze_trends(self) -> Dict:
        """パフォーマンストレンド分析"""
        if len(self.performance_history) < 2:
            return {"status": "insufficient_data"}
        
        recent = self.performance_history[-3:]  # 最新3件
        
        # 簡易トレンド計算
        roi_trend = "improving" if recent[-1]["metrics"].get("roi", 0) > recent[0]["metrics"].get("roi", 0) else "declining"
        cost_trend = "increasing" if recent[-1]["metrics"].get("cost", 0) > recent[0]["metrics"].get("cost", 0) else "decreasing"
        
        return {
            "roi_trend": roi_trend,
            "cost_trend": cost_trend,
            "data_points": len(self.performance_history)
        }
    
    def _generate_realtime_recommendations(self, metrics: Dict, trends: Dict) -> List[str]:
        """リアルタイム推奨事項生成"""
        recommendations = []
        
        current_roi = metrics.get("roi", 0)
        current_cpa = metrics.get("cpa", 0)
        
        if current_roi < 120:
            recommendations.append("🚨 ROI低下: 低効率キーワード・オーディエンスの停止検討")
        
        if current_cpa > 8000:
            recommendations.append("💰 CPA高騰: 入札単価調整または品質改善が必要")
        
        if trends.get("roi_trend") == "declining":
            recommendations.append("📉 効果低下傾向: クリエイティブ・ターゲティング見直し")
        
        return recommendations
    
    def _assess_urgency(self, metrics: Dict) -> str:
        """緊急度評価"""
        roi = metrics.get("roi", 0)
        
        if roi < 100:
            return "critical"
        elif roi < 130:
            return "high"
        elif roi < 180:
            return "medium"
        else:
            return "low"

# 使用例とテスト
def test_risk_optimization():
    """テスト関数"""
    engine = RiskOptimizationEngine()
    
    constraints = BusinessConstraints(
        total_budget=2000000,
        monthly_budget_limit=200000,
        min_monthly_profit=150000,
        max_risk_tolerance=0.5,
        target_customers=400,
        target_roi=200.0,
        time_horizon=12
    )
    
    result = engine.optimize_marketing_budget(
        constraints=constraints,
        industry="beauty",
        selected_channels=["google_ads", "facebook_ads", "instagram_ads", "local_promotion"]
    )
    
    print("=== リスク最適化結果 ===")
    print(f"推奨予算配分:")
    for channel, budget in result.recommended_allocation.items():
        print(f"  {channel}: {budget:,}円")
    
    print(f"\n期待ROI: {result.expected_roi:.1f}%")
    print(f"予想顧客数: {result.expected_customers:,}人")
    print(f"予想売上: {result.expected_revenue:,}円")
    print(f"リスクスコア: {result.risk_score:.1%}")
    print(f"予測信頼度: {result.confidence:.1%}")
    
    print(f"\n=== リスク軽減計画 ===")
    for plan in result.risk_mitigation_plan:
        print(f"• {plan}")
    
    print(f"\n=== 代替シナリオ ===")
    for scenario in result.alternative_scenarios:
        print(f"• {scenario['name']}: ROI {scenario['expected_roi']:.1f}%")

if __name__ == "__main__":
    test_risk_optimization()