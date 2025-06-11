#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
包括的なテストデータ作成スクリプト
"""

import sys
import os
import sqlite3
from datetime import datetime, timedelta
import json
import uuid

# Add the parent directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def create_comprehensive_test_data():
    """包括的なテストデータを作成"""
    
    # データベース接続
    db_path = "/Users/MBP/mvt-analytics/backend/mvt_analytics.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("🗑️ 既存データをクリア中...")
        
        # 既存データを削除
        cursor.execute("DELETE FROM analyses")
        cursor.execute("DELETE FROM projects")
        cursor.execute("DELETE FROM sales_simulations") 
        
        print("📝 新しいテストプロジェクトを作成中...")
        
        # テストプロジェクト作成
        projects = [
            {
                "id": "proj-001",
                "name": "SHIBUYA美容室プロジェクト",
                "description": "渋谷駅徒歩3分の美容室。ターゲットは20-35歳女性。Google Maps API連携による競合分析実装済み",
                "industry_type": "beauty",
                "target_area": "東京都渋谷区",
                "status": "active",
                "created_at": "2025-06-09 15:25:18",
                "updated_at": "2025-06-10 14:30:00"
            },
            {
                "id": "proj-002", 
                "name": "新宿カフェ＆コワーキング",
                "description": "新宿南口のカフェ併設コワーキングスペース。リモートワーカーとカフェ利用者の両方をターゲット",
                "industry_type": "restaurant",
                "target_area": "東京都新宿区",
                "status": "active",
                "created_at": "2025-06-08 10:15:30",
                "updated_at": "2025-06-10 09:45:22"
            },
            {
                "id": "proj-003",
                "name": "大阪・吹田フィットネスジム",
                "description": "大阪府吹田市千里丘下エリアの24時間フィットネスジム。実際のGoogle Maps APIで競合分析済み",
                "industry_type": "fitness",
                "target_area": "大阪府吹田市",
                "status": "active", 
                "created_at": "2025-06-07 14:20:10",
                "updated_at": "2025-06-10 11:20:15"
            },
            {
                "id": "proj-004",
                "name": "名古屋駅前レストラン",
                "description": "名古屋駅徒歩5分の和洋折衷レストラン。ビジネスランチと接待ディナーが主軸",
                "industry_type": "restaurant", 
                "target_area": "愛知県名古屋市",
                "status": "planning",
                "created_at": "2025-06-06 16:30:45",
                "updated_at": "2025-06-09 13:25:30"
            },
            {
                "id": "proj-005",
                "name": "横浜みなとみらいスパ",
                "description": "みなとみらい地区の高級デイスパ。景観を活かした癒し空間とプレミアムサービス",
                "industry_type": "beauty",
                "target_area": "神奈川県横浜市",
                "status": "completed",
                "created_at": "2025-06-05 11:45:20", 
                "updated_at": "2025-06-08 17:30:12"
            }
        ]
        
        # プロジェクト挿入
        for project in projects:
            cursor.execute("""
                INSERT INTO projects (id, name, description, industry_type, target_area, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                project["id"], project["name"], project["description"], 
                project["industry_type"], project["target_area"], project["status"],
                project["created_at"], project["updated_at"]
            ))
        
        print("📊 分析データを作成中...")
        
        # 分析データ作成
        analyses = [
            {
                "id": f"ana-{uuid.uuid4().hex[:8]}",
                "project_id": "proj-001",
                "analysis_type": "demographics",
                "status": "completed",
                "demographics_data": json.dumps({
                    "total_population": 18500,
                    "target_population": 4200, 
                    "age_groups": {"20-29": 0.35, "30-39": 0.40, "40-49": 0.25},
                    "gender_ratio": {"male": 0.20, "female": 0.80},
                    "income_levels": {"low": 0.15, "medium": 0.60, "high": 0.25}
                }),
                "competitors_data": json.dumps({
                    "total_competitors": 8,
                    "direct_competitors": 5,
                    "average_distance": 450,
                    "price_range": {"min": 4000, "max": 15000, "average": 8500}
                }),
                "demand_forecast": json.dumps({
                    "market_size": 680000000,
                    "growth_rate": 0.12,
                    "seasonality": {"spring": 1.1, "summer": 0.9, "autumn": 1.0, "winter": 1.2}
                }),
                "roi_projections": json.dumps({
                    "year1": {"revenue": 18000000, "profit": 3200000},
                    "year2": {"revenue": 22000000, "profit": 4800000},
                    "year3": {"revenue": 26500000, "profit": 6400000}
                }),
                "created_at": "2025-06-10 14:25:30"
            },
            {
                "id": f"ana-{uuid.uuid4().hex[:8]}",
                "project_id": "proj-002", 
                "analysis_type": "competitors",
                "status": "completed",
                "demographics_data": json.dumps({
                    "total_population": 45000,
                    "target_population": 12000,
                    "age_groups": {"20-29": 0.30, "30-39": 0.35, "40-49": 0.35},
                    "gender_ratio": {"male": 0.55, "female": 0.45}
                }),
                "competitors_data": json.dumps({
                    "total_competitors": 15,
                    "direct_competitors": 8,
                    "average_distance": 280,
                    "price_range": {"min": 500, "max": 2500, "average": 1200}
                }),
                "demand_forecast": json.dumps({
                    "market_size": 420000000,
                    "growth_rate": 0.08,
                    "seasonality": {"spring": 1.0, "summer": 1.1, "autumn": 0.9, "winter": 1.0}
                }),
                "created_at": "2025-06-10 12:15:45"
            },
            {
                "id": f"ana-{uuid.uuid4().hex[:8]}",
                "project_id": "proj-003",
                "analysis_type": "demographics", 
                "status": "completed",
                "demographics_data": json.dumps({
                    "total_population": 6800,
                    "target_population": 2100,
                    "age_groups": {"20-29": 0.25, "30-39": 0.40, "40-49": 0.35},
                    "gender_ratio": {"male": 0.60, "female": 0.40}
                }),
                "competitors_data": json.dumps({
                    "total_competitors": 3,
                    "direct_competitors": 2, 
                    "average_distance": 850,
                    "price_range": {"min": 6000, "max": 12000, "average": 8500}
                }),
                "demand_forecast": json.dumps({
                    "market_size": 95000000,
                    "growth_rate": 0.18,
                    "seasonality": {"spring": 1.0, "summer": 1.2, "autumn": 1.0, "winter": 0.8}
                }),
                "created_at": "2025-06-10 11:30:20"
            }
        ]
        
        # 分析データ挿入
        for analysis in analyses:
            cursor.execute("""
                INSERT INTO analyses (id, project_id, analysis_type, status, population_data, 
                                    competitor_data, demand_metrics, roi_projections, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                analysis["id"], analysis["project_id"], analysis["analysis_type"], 
                analysis["status"], analysis["demographics_data"], analysis["competitors_data"],
                analysis["demand_forecast"], analysis.get("roi_projections"), analysis["created_at"]
            ))
        
        print("🎯 シミュレーションデータを作成中...")
        
        # シミュレーションデータ作成
        simulations = [
            {
                "id": f"sim-{uuid.uuid4().hex[:8]}",
                "project_id": "proj-001",
                "initial_investment": 15000000,
                "monthly_revenue": 1800000,
                "monthly_costs": 1200000,
                "monthly_profit": 600000,
                "roi_percentage": 48.0,
                "breakeven_months": 8,
                "parameters": json.dumps({
                    "selected_media": ["google_ads", "instagram_ads", "local_promotion"],
                    "target_customers": 150,
                    "advertising_budget": 180000,
                    "pricing_strategy": "premium"
                }),
                "created_at": "2025-06-10 13:45:30"
            },
            {
                "id": f"sim-{uuid.uuid4().hex[:8]}",
                "project_id": "proj-002",
                "initial_investment": 8000000, 
                "monthly_revenue": 950000,
                "monthly_costs": 680000,
                "monthly_profit": 270000,
                "roi_percentage": 40.5,
                "breakeven_months": 12,
                "parameters": json.dumps({
                    "selected_media": ["google_ads", "facebook_ads", "seo_content"],
                    "target_customers": 200,
                    "advertising_budget": 120000,
                    "pricing_strategy": "competitive"
                }),
                "created_at": "2025-06-10 10:20:15"
            }
        ]
        
        # シミュレーションデータ挿入
        for simulation in simulations:
            cursor.execute("""
                INSERT INTO sales_simulations (id, project_id, target_monthly_sales, average_order_value, 
                                             conversion_rate, selected_media, required_customers, 
                                             required_reach, required_budget, breakeven_months, 
                                             funnel_data, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                simulation["id"], simulation["project_id"], simulation["monthly_revenue"],
                8500, 0.035, simulation["parameters"], 120, 15000, 
                simulation.get("advertising_budget", 150000), simulation["breakeven_months"], 
                json.dumps({"funnel": "test"}), simulation["created_at"]
            ))
        
        # 変更をコミット
        conn.commit()
        
        print("✅ 包括的なテストデータの作成が完了しました！")
        print(f"📊 作成されたデータ:")
        print(f"   - プロジェクト: {len(projects)}件")
        print(f"   - 分析データ: {len(analyses)}件")
        print(f"   - シミュレーション: {len(simulations)}件")
        print(f"\n🔗 テスト用プロジェクトID:")
        for project in projects:
            print(f"   - {project['id']}: {project['name']} ({project['status']})")
        
    except Exception as e:
        print(f"❌ エラー: {e}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    create_comprehensive_test_data()