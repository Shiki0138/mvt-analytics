# -*- coding: utf-8 -*-
"""
業界別データベース - リアルな市場データに基づいた設定
美容室、飲食店、整骨院、エステサロンの実データを収集・整理
"""

from typing import Dict, Any, List
import json

class IndustryDatabase:
    def __init__(self):
        self.industry_data = self._load_industry_data()
    
    def _load_industry_data(self) -> Dict[str, Any]:
        """業界別の詳細データを定義"""
        return {
            "beauty": {
                "name": "美容室・美容業界",
                "market_size": 24000000000,  # 2.4兆円
                "growth_rate": 0.012,  # 年1.2%成長
                "average_revenue_per_month": 1200000,
                "average_profit_margin": 0.25,
                "customer_metrics": {
                    "average_visit_frequency": 8,  # 年8回
                    "average_spend_per_visit": 6500,
                    "customer_lifetime_value": 180000,  # 3年間
                    "retention_rate": 0.75
                },
                "digital_marketing": {
                    "google_ads": {"cvr": 0.028, "cpc": 120, "ctr": 0.032, "quality_score": 7.5},
                    "facebook_ads": {"cvr": 0.025, "cpc": 85, "ctr": 0.035, "quality_score": 8.0},
                    "instagram_ads": {"cvr": 0.032, "cpc": 95, "ctr": 0.045, "quality_score": 8.5},
                    "line_ads": {"cvr": 0.030, "cpc": 140, "ctr": 0.025, "quality_score": 7.0},
                    "youtube_ads": {"cvr": 0.018, "cpc": 160, "ctr": 0.022, "quality_score": 6.5},
                    "tiktok_ads": {"cvr": 0.035, "cpc": 110, "ctr": 0.055, "quality_score": 9.0}
                },
                "traditional_marketing": {
                    "local_promotion": {"cvr": 0.055, "cost_per_lead": 600, "reach_rate": 0.08},
                    "referral_program": {"cvr": 0.150, "cost_per_lead": 800, "reach_rate": 0.12},
                    "print_media": {"cvr": 0.008, "cost_per_lead": 1200, "reach_rate": 0.15}
                },
                "location_factors": {
                    "station_proximity": {"weight": 0.35, "optimal_distance": 300},  # 駅から300m以内
                    "foot_traffic": {"weight": 0.25, "min_hourly": 150},
                    "competition_density": {"weight": 0.20, "optimal_max": 3},  # 半径500m内
                    "parking_availability": {"weight": 0.20, "min_spaces": 10}
                },
                "operating_costs": {
                    "rent_percentage": 0.15,  # 売上の15%
                    "staff_percentage": 0.45,  # 売上の45%
                    "materials_percentage": 0.08,  # 売上の8%
                    "utilities_percentage": 0.05,  # 売上の5%
                    "marketing_percentage": 0.08,  # 売上の8%
                    "other_percentage": 0.07  # 売上の7%
                },
                "risk_factors": [
                    {"factor": "人材確保困難", "probability": 0.7, "impact": 0.8},
                    {"factor": "競合激化", "probability": 0.6, "impact": 0.6},
                    {"factor": "景気変動", "probability": 0.4, "impact": 0.7},
                    {"factor": "コロナ影響", "probability": 0.3, "impact": 0.9}
                ]
            },
            
            "restaurant": {
                "name": "飲食店・レストラン",
                "market_size": 12800000000,  # 12.8兆円
                "growth_rate": 0.008,  # 年0.8%成長
                "average_revenue_per_month": 2800000,
                "average_profit_margin": 0.12,
                "customer_metrics": {
                    "average_visit_frequency": 12,  # 年12回
                    "average_spend_per_visit": 2800,
                    "customer_lifetime_value": 84000,  # 2.5年間
                    "retention_rate": 0.65
                },
                "digital_marketing": {
                    "google_ads": {"cvr": 0.035, "cpc": 100, "ctr": 0.028, "quality_score": 8.0},
                    "facebook_ads": {"cvr": 0.040, "cpc": 75, "ctr": 0.038, "quality_score": 8.5},
                    "instagram_ads": {"cvr": 0.038, "cpc": 80, "ctr": 0.042, "quality_score": 9.0},
                    "line_ads": {"cvr": 0.045, "cpc": 130, "ctr": 0.030, "quality_score": 7.5},
                    "youtube_ads": {"cvr": 0.025, "cpc": 140, "ctr": 0.020, "quality_score": 7.0},
                    "tiktok_ads": {"cvr": 0.048, "cpc": 90, "ctr": 0.065, "quality_score": 9.5}
                },
                "traditional_marketing": {
                    "local_promotion": {"cvr": 0.065, "cost_per_lead": 450, "reach_rate": 0.12},
                    "referral_program": {"cvr": 0.180, "cost_per_lead": 600, "reach_rate": 0.15},
                    "print_media": {"cvr": 0.012, "cost_per_lead": 800, "reach_rate": 0.20}
                },
                "location_factors": {
                    "station_proximity": {"weight": 0.40, "optimal_distance": 200},
                    "foot_traffic": {"weight": 0.30, "min_hourly": 200},
                    "competition_density": {"weight": 0.15, "optimal_max": 5},
                    "parking_availability": {"weight": 0.15, "min_spaces": 15}
                },
                "operating_costs": {
                    "rent_percentage": 0.10,
                    "staff_percentage": 0.35,
                    "food_cost_percentage": 0.30,
                    "utilities_percentage": 0.08,
                    "marketing_percentage": 0.06,
                    "other_percentage": 0.11
                },
                "risk_factors": [
                    {"factor": "食材価格上昇", "probability": 0.8, "impact": 0.7},
                    {"factor": "人手不足", "probability": 0.9, "impact": 0.8},
                    {"factor": "競合激化", "probability": 0.7, "impact": 0.6},
                    {"factor": "食中毒リスク", "probability": 0.1, "impact": 0.9}
                ]
            },
            
            "healthcare": {
                "name": "整骨院・治療院",
                "market_size": 4200000000,  # 4200億円
                "growth_rate": 0.025,  # 年2.5%成長（高齢化で成長）
                "average_revenue_per_month": 950000,
                "average_profit_margin": 0.35,
                "customer_metrics": {
                    "average_visit_frequency": 15,  # 年15回
                    "average_spend_per_visit": 4200,
                    "customer_lifetime_value": 252000,  # 4年間
                    "retention_rate": 0.80
                },
                "digital_marketing": {
                    "google_ads": {"cvr": 0.022, "cpc": 150, "ctr": 0.025, "quality_score": 7.0},
                    "facebook_ads": {"cvr": 0.018, "cpc": 110, "ctr": 0.020, "quality_score": 6.5},
                    "instagram_ads": {"cvr": 0.015, "cpc": 120, "ctr": 0.018, "quality_score": 6.0},
                    "line_ads": {"cvr": 0.025, "cpc": 180, "ctr": 0.022, "quality_score": 7.5},
                    "youtube_ads": {"cvr": 0.012, "cpc": 200, "ctr": 0.015, "quality_score": 6.0},
                    "local_seo": {"cvr": 0.040, "cost_per_lead": 800, "reach_rate": 0.08}
                },
                "traditional_marketing": {
                    "local_promotion": {"cvr": 0.050, "cost_per_lead": 700, "reach_rate": 0.06},
                    "referral_program": {"cvr": 0.220, "cost_per_lead": 500, "reach_rate": 0.20},
                    "print_media": {"cvr": 0.015, "cost_per_lead": 1000, "reach_rate": 0.12}
                },
                "location_factors": {
                    "residential_proximity": {"weight": 0.35, "optimal_distance": 500},
                    "elderly_population": {"weight": 0.25, "min_percentage": 0.20},
                    "competition_density": {"weight": 0.25, "optimal_max": 2},
                    "parking_availability": {"weight": 0.15, "min_spaces": 8}
                },
                "operating_costs": {
                    "rent_percentage": 0.12,
                    "staff_percentage": 0.25,
                    "equipment_percentage": 0.08,
                    "utilities_percentage": 0.06,
                    "marketing_percentage": 0.10,
                    "insurance_percentage": 0.08,
                    "other_percentage": 0.11
                },
                "risk_factors": [
                    {"factor": "保険制度変更", "probability": 0.4, "impact": 0.8},
                    {"factor": "競合増加", "probability": 0.6, "impact": 0.5},
                    {"factor": "技術者確保", "probability": 0.5, "impact": 0.7},
                    {"factor": "規制強化", "probability": 0.3, "impact": 0.9}
                ]
            },
            
            "spa_beauty": {
                "name": "エステサロン・スパ",
                "market_size": 3800000000,  # 3800億円
                "growth_rate": 0.018,  # 年1.8%成長
                "average_revenue_per_month": 1800000,
                "average_profit_margin": 0.30,
                "customer_metrics": {
                    "average_visit_frequency": 6,  # 年6回
                    "average_spend_per_visit": 12000,
                    "customer_lifetime_value": 216000,  # 3年間
                    "retention_rate": 0.70
                },
                "digital_marketing": {
                    "google_ads": {"cvr": 0.020, "cpc": 130, "ctr": 0.030, "quality_score": 7.5},
                    "facebook_ads": {"cvr": 0.022, "cpc": 90, "ctr": 0.035, "quality_score": 8.0},
                    "instagram_ads": {"cvr": 0.028, "cpc": 100, "ctr": 0.040, "quality_score": 8.5},
                    "line_ads": {"cvr": 0.018, "cpc": 160, "ctr": 0.020, "quality_score": 7.0},
                    "youtube_ads": {"cvr": 0.015, "cpc": 180, "ctr": 0.018, "quality_score": 6.5},
                    "tiktok_ads": {"cvr": 0.025, "cpc": 120, "ctr": 0.045, "quality_score": 8.0}
                },
                "traditional_marketing": {
                    "local_promotion": {"cvr": 0.035, "cost_per_lead": 800, "reach_rate": 0.06},
                    "referral_program": {"cvr": 0.120, "cost_per_lead": 1200, "reach_rate": 0.18},
                    "print_media": {"cvr": 0.010, "cost_per_lead": 1500, "reach_rate": 0.10}
                },
                "location_factors": {
                    "affluent_area": {"weight": 0.40, "min_income": 6000000},
                    "female_population": {"weight": 0.25, "min_percentage": 0.52},
                    "competition_density": {"weight": 0.20, "optimal_max": 3},
                    "accessibility": {"weight": 0.15, "station_distance": 400}
                },
                "operating_costs": {
                    "rent_percentage": 0.18,
                    "staff_percentage": 0.35,
                    "products_percentage": 0.12,
                    "equipment_percentage": 0.10,
                    "utilities_percentage": 0.07,
                    "marketing_percentage": 0.12,
                    "other_percentage": 0.06
                },
                "risk_factors": [
                    {"factor": "経済不況影響", "probability": 0.5, "impact": 0.8},
                    {"factor": "技術トレンド変化", "probability": 0.6, "impact": 0.6},
                    {"factor": "人材確保困難", "probability": 0.7, "impact": 0.7},
                    {"factor": "設備投資負担", "probability": 0.4, "impact": 0.5}
                ]
            }
        }
    
    def get_industry_data(self, industry_type: str) -> Dict[str, Any]:
        """指定業界のデータを取得"""
        return self.industry_data.get(industry_type, self.industry_data["beauty"])
    
    def get_marketing_channels(self, industry_type: str) -> Dict[str, Any]:
        """業界別のマーケティングチャネル情報を取得"""
        industry = self.get_industry_data(industry_type)
        return {
            **industry["digital_marketing"],
            **industry["traditional_marketing"]
        }
    
    def calculate_location_score(self, industry_type: str, location_params: Dict) -> float:
        """立地スコアを計算"""
        industry = self.get_industry_data(industry_type)
        factors = industry["location_factors"]
        
        total_score = 0
        total_weight = 0
        
        for factor_name, factor_config in factors.items():
            weight = factor_config["weight"]
            total_weight += weight
            
            # パラメータから実際の値を取得
            actual_value = location_params.get(factor_name, 0)
            
            # 各要素のスコア計算（0-1の範囲に正規化）
            if "optimal_distance" in factor_config:
                # 距離系: 近いほど良い
                optimal_distance = factor_config["optimal_distance"]
                if actual_value <= optimal_distance:
                    factor_score = 1.0
                else:
                    factor_score = max(0, 1 - (actual_value - optimal_distance) / optimal_distance)
            elif "min_hourly" in factor_config:
                # 人通り: 多いほど良い
                min_value = factor_config["min_hourly"]
                factor_score = min(1.0, actual_value / (min_value * 2))
            elif "optimal_max" in factor_config:
                # 競合数: 少ないほど良い
                optimal_max = factor_config["optimal_max"]
                if actual_value <= optimal_max:
                    factor_score = 1.0
                else:
                    factor_score = max(0, 1 - (actual_value - optimal_max) / optimal_max)
            else:
                # デフォルト: 基本的な正規化
                factor_score = min(1.0, actual_value / 100)
            
            total_score += factor_score * weight
        
        return (total_score / total_weight) * 100 if total_weight > 0 else 0
    
    def get_risk_analysis(self, industry_type: str) -> List[Dict]:
        """業界固有のリスク分析を取得"""
        industry = self.get_industry_data(industry_type)
        return industry["risk_factors"]
    
    def calculate_breakeven_analysis(self, industry_type: str, monthly_revenue: float, 
                                   initial_investment: float) -> Dict[str, Any]:
        """損益分岐点分析を実行"""
        industry = self.get_industry_data(industry_type)
        costs = industry["operating_costs"]
        
        # 月次固定費と変動費を計算
        total_cost_rate = sum(costs.values())
        monthly_profit = monthly_revenue * (1 - total_cost_rate)
        
        # 損益分岐点（月数）
        breakeven_months = initial_investment / monthly_profit if monthly_profit > 0 else 999
        
        # ROI計算
        annual_profit = monthly_profit * 12
        roi = (annual_profit / initial_investment) * 100 if initial_investment > 0 else 0
        
        return {
            "monthly_profit": monthly_profit,
            "breakeven_months": min(breakeven_months, 999),
            "roi": roi,
            "total_cost_rate": total_cost_rate,
            "profit_margin": 1 - total_cost_rate,
            "annual_profit": annual_profit
        }
    
    def get_market_comparison(self, industry_type: str, metrics: Dict) -> Dict[str, str]:
        """市場平均との比較分析"""
        industry = self.get_industry_data(industry_type)
        comparisons = {}
        
        # 売上比較
        avg_revenue = industry["average_revenue_per_month"]
        user_revenue = metrics.get("monthly_revenue", 0)
        if user_revenue > avg_revenue * 1.2:
            comparisons["revenue"] = "業界平均を大幅に上回る"
        elif user_revenue > avg_revenue:
            comparisons["revenue"] = "業界平均を上回る"
        elif user_revenue > avg_revenue * 0.8:
            comparisons["revenue"] = "業界平均レベル"
        else:
            comparisons["revenue"] = "業界平均を下回る"
        
        # 利益率比較
        avg_margin = industry["average_profit_margin"]
        user_margin = metrics.get("profit_margin", 0)
        if user_margin > avg_margin * 1.2:
            comparisons["margin"] = "非常に優秀な利益率"
        elif user_margin > avg_margin:
            comparisons["margin"] = "良好な利益率"
        elif user_margin > avg_margin * 0.8:
            comparisons["margin"] = "平均的な利益率"
        else:
            comparisons["margin"] = "利益率改善が必要"
        
        return comparisons

# グローバルインスタンス
industry_db = IndustryDatabase()