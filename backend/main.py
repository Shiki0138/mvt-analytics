# -*- coding: utf-8 -*-
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import sqlite3
import os
import json
from datetime import datetime
import httpx
import asyncio
from urllib.parse import quote
from dotenv import load_dotenv

app = FastAPI(title="MVT Analytics API", version="1.0.0")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# データベース初期化
def init_db():
    conn = sqlite3.connect('mvt_analytics.db')
    cursor = conn.cursor()
    
    # 既存テーブルを削除（完全リセット）
    cursor.execute('DROP TABLE IF EXISTS projects')
    cursor.execute('DROP TABLE IF EXISTS reports')
    cursor.execute('DROP TABLE IF EXISTS report_templates')
    
    # プロジェクトテーブル（拡張版）
    cursor.execute('''
    CREATE TABLE projects (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        industry_type TEXT DEFAULT 'beauty',
        target_area TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # レポートテーブル
    cursor.execute('''
    CREATE TABLE reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        charts_data TEXT,
        pdf_path TEXT,
        pptx_path TEXT,
        template_id TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects (id),
        FOREIGN KEY (template_id) REFERENCES report_templates (id)
    )
    ''')
    
    # レポートテンプレートテーブル
    cursor.execute('''
    CREATE TABLE report_templates (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        sections TEXT NOT NULL,
        type TEXT DEFAULT 'business_plan',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # サンプルデータ挿入（プロジェクト）
    cursor.execute('''
    INSERT INTO projects (id, name, description, industry_type, target_area, status) VALUES 
    ('proj-001', 'サンプル美容室', '渋谷区の美容室事業プロジェクト', 'beauty', '渋谷区', 'active'),
    ('proj-002', 'カフェプロジェクト', '新宿区のカフェ事業計画', 'restaurant', '新宿区', 'completed'),
    ('proj-003', 'フィットネスジム', '池袋区のフィットネス事業', 'healthcare', '池袋区', 'active')
    ''')
    
    # サンプルデータ挿入（レポートテンプレート）
    business_plan_sections = json.dumps([
        {
            "id": "executive_summary",
            "title": "エグゼクティブサマリー",
            "required": True,
            "subsections": [
                {"id": "business_concept", "title": "事業コンセプト"},
                {"id": "market_opportunity", "title": "市場機会"},
                {"id": "financial_highlights", "title": "財務ハイライト"}
            ]
        },
        {
            "id": "market_analysis",
            "title": "市場分析",
            "required": True,
            "subsections": [
                {"id": "market_size", "title": "市場規模"},
                {"id": "target_segments", "title": "ターゲットセグメント"},
                {"id": "competition", "title": "競合分析"}
            ]
        },
        {
            "id": "business_strategy",
            "title": "事業戦略",
            "required": True,
            "subsections": [
                {"id": "value_proposition", "title": "価値提案"},
                {"id": "revenue_model", "title": "収益モデル"},
                {"id": "marketing_strategy", "title": "マーケティング戦略"}
            ]
        }
    ])
    
    market_analysis_sections = json.dumps([
        {
            "id": "market_overview",
            "title": "市場概要",
            "required": True,
            "subsections": [
                {"id": "market_size", "title": "市場規模"},
                {"id": "growth_trends", "title": "成長トレンド"},
                {"id": "market_drivers", "title": "市場ドライバー"}
            ]
        },
        {
            "id": "competitive_analysis",
            "title": "競合分析",
            "required": True,
            "subsections": [
                {"id": "competitor_profiles", "title": "競合プロフィール"},
                {"id": "market_share", "title": "市場シェア"},
                {"id": "competitive_advantages", "title": "競争優位性"}
            ]
        },
        {
            "id": "customer_analysis",
            "title": "顧客分析",
            "required": True,
            "subsections": [
                {"id": "customer_segments", "title": "顧客セグメント"},
                {"id": "customer_needs", "title": "顧客ニーズ"},
                {"id": "buying_behavior", "title": "購買行動"}
            ]
        }
    ])
    
    cursor.execute('''
    INSERT INTO report_templates (id, name, description, sections, type) VALUES 
    ('tmpl-001', '事業計画書', '包括的な事業計画書テンプレート', ?, 'business_plan'),
    ('tmpl-002', '市場分析レポート', '詳細な市場分析レポートテンプレート', ?, 'market_analysis')
    ''', (business_plan_sections, market_analysis_sections))
    
    conn.commit()
    conn.close()

# 起動時にDB初期化
init_db()

# データモデル（拡張版）
class Project(BaseModel):
    id: Optional[int] = None
    name: str
    description: Optional[str] = None
    industry_type: str = 'beauty'
    target_area: Optional[str] = None
    status: str = 'active'
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

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

class Report(BaseModel):
    id: Optional[int] = None
    project_id: str
    title: str
    content: Optional[dict] = None
    charts_data: Optional[dict] = None
    template_id: Optional[str] = None
    pdf_path: Optional[str] = None
    pptx_path: Optional[str] = None
    created_at: Optional[str] = None

class ReportTemplate(BaseModel):
    id: Optional[str] = None
    name: str
    description: str
    sections: List[dict]
    type: str = 'business_plan'
    created_at: Optional[str] = None

# 基本エンドポイント
@app.get("/")
def read_root():
    return {"message": "MVT Analytics API", "status": "working", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "ok", "service": "mvt-analytics", "timestamp": datetime.now().isoformat()}

@app.get("/api/dashboard/stats")
def get_dashboard_stats():
    """ダッシュボード統計データ取得"""
    try:
        conn = sqlite3.connect('mvt_analytics.db')
        cursor = conn.cursor()
        
        # プロジェクト数
        cursor.execute("SELECT COUNT(*) FROM projects")
        total_projects = cursor.fetchone()[0]
        
        # アクティブプロジェクト数
        cursor.execute("SELECT COUNT(*) FROM projects WHERE status = 'active'")
        active_projects = cursor.fetchone()[0]
        
        # レポート数（analyses テーブルの代わりに reports テーブルを使用）
        cursor.execute("SELECT COUNT(*) FROM reports")
        total_analyses = cursor.fetchone()[0]
        
        # 平均損益分岐月数（モックデータを使用、実際のテーブルがないため）
        avg_breakeven = 8.5  # デフォルト値
        
        # 実際のシミュレーションデータがある場合は別途取得
        # 将来的に sales_simulations テーブルが作成された場合に対応
        try:
            cursor.execute("SELECT AVG(breakeven_months) FROM sales_simulations WHERE breakeven_months IS NOT NULL")
            avg_breakeven_result = cursor.fetchone()[0]
            if avg_breakeven_result:
                avg_breakeven = round(avg_breakeven_result, 1)
        except sqlite3.OperationalError:
            # テーブルが存在しない場合はデフォルト値を使用
            pass
        
        conn.close()
        
        return {
            "total_projects": total_projects,
            "completed_analyses": total_analyses,
            "active_projects": active_projects,
            "average_breakeven_months": avg_breakeven
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"統計データ取得エラー: {str(e)}")

# プロジェクト API（完全版）
@app.get("/api/projects")
def get_projects():
    conn = sqlite3.connect('mvt_analytics.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, description, industry_type, target_area, status, created_at, updated_at FROM projects")
    rows = cursor.fetchall()
    conn.close()
    
    return [
        {
            "id": str(row[0]),
            "name": row[1],
            "description": row[2],
            "industry_type": row[3],
            "target_area": row[4],
            "status": row[5],
            "created_at": row[6],
            "updated_at": row[7]
        }
        for row in rows
    ]

@app.get("/api/projects/{project_id}")
def get_project(project_id: str):
    conn = sqlite3.connect('mvt_analytics.db')
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, name, description, industry_type, target_area, status, created_at, updated_at 
        FROM projects 
        WHERE id = ?
    """, (project_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            "id": row[0],
            "name": row[1],
            "description": row[2],
            "industry_type": row[3],
            "target_area": row[4],
            "status": row[5],
            "created_at": row[6],
            "updated_at": row[7]
        }
    raise HTTPException(status_code=404, detail="Project not found")

@app.post("/api/projects")
def create_project(project: Project):
    conn = sqlite3.connect('mvt_analytics.db')
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO projects (name, description, industry_type, target_area, status) VALUES (?, ?, ?, ?, ?)",
        (project.name, project.description, project.industry_type, project.target_area, project.status)
    )
    project_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return {"id": project_id, "message": "Project created successfully"}

@app.put("/api/projects/{project_id}")
def update_project(project_id: int, project: Project):
    conn = sqlite3.connect('mvt_analytics.db')
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE projects SET name = ?, description = ?, industry_type = ?, target_area = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        (project.name, project.description, project.industry_type, project.target_area, project.status, project_id)
    )
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Project not found")
    
    conn.commit()
    conn.close()
    return {"message": "Project updated successfully"}

@app.delete("/api/projects/{project_id}")
def delete_project(project_id: int):
    conn = sqlite3.connect('mvt_analytics.db')
    cursor = conn.cursor()
    cursor.execute("DELETE FROM projects WHERE id = ?", (project_id,))
    
    if cursor.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Project not found")
    
    conn.commit()
    conn.close()
    return {"message": "Project deleted successfully"}

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
    conn = sqlite3.connect('mvt_analytics.db')
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, title, content, charts_data, pdf_path, pptx_path, created_at
        FROM reports
        WHERE project_id = ?
        ORDER BY created_at DESC
    """, (project_id,))
    rows = cursor.fetchall()
    conn.close()
    
    return {
        "reports": [
            {
                "id": row[0],
                "title": row[1],
                "content": row[2],
                "charts_data": row[3],
                "pdf_path": row[4],
                "pptx_path": row[5],
                "created_at": row[6]
            }
            for row in rows
        ]
    }

@app.get("/api/reports/download/{report_id}")
def download_report(report_id: int, format: str):
    conn = sqlite3.connect('mvt_analytics.db')
    cursor = conn.cursor()
    
    try:
        # レポートの存在確認と内容取得
        cursor.execute("""
            SELECT r.id, r.project_id, r.title, r.content, r.template_id, t.sections
            FROM reports r
            LEFT JOIN report_templates t ON r.template_id = t.id
            WHERE r.id = ?
        """, (report_id,))
        report = cursor.fetchone()
        
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        
        # レポートデータの準備
        report_data = {
            "id": report[0],
            "project_id": report[1],
            "title": report[2],
            "content": json.loads(report[3]) if report[3] else {},
            "template": json.loads(report[5]) if report[5] else None
        }
        
        # エクスポートディレクトリの作成
        os.makedirs("exports", exist_ok=True)
        
        # ファイルパスの生成
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"report_{report_id}_{timestamp}.{format}"
        filepath = os.path.join("exports", filename)
        
        # テンプレートに基づいてレポートを生成
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(f"# {report_data['title']}\n\n")
            
            if report_data['template']:
                for section in report_data['template']:
                    f.write(f"## {section['title']}\n\n")
                    content = report_data['content'].get(section['id'], {})
                    
                    for subsection in section['subsections']:
                        f.write(f"### {subsection['title']}\n")
                        f.write(f"{content.get(subsection['id'], '内容なし')}\n\n")
            else:
                f.write("## レポート内容\n\n")
                f.write(str(report_data['content']))
        
        return {
            "message": f"{format.upper()} export completed",
            "download_url": f"/exports/{filename}"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# 外部APIクライアント
async def fetch_news_data(industry: str, area: str):
    """ニュースデータを取得"""
    api_key = os.getenv('NEWS_API_KEY')
    if not api_key:
        return {"articles": [], "error": "API key not configured"}
    
    # 業界と地域に基づいて検索クエリを作成
    query = f"{industry} {area}"
    encoded_query = quote(query)
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"https://newsapi.org/v2/everything",
                params={
                    "q": encoded_query,
                    "language": "ja",
                    "sortBy": "publishedAt",
                    "apiKey": api_key,
                    "pageSize": 5  # 最新の5件のみ取得
                }
            )
            if response.status_code == 200:
                data = response.json()
                return {
                    "articles": data.get("articles", []),
                    "status": "success"
                }
            else:
                return {
                    "articles": [],
                    "error": f"News API error: {response.status_code}",
                    "status": "error"
                }
        except Exception as e:
            return {
                "articles": [],
                "error": f"News API request failed: {str(e)}",
                "status": "error"
            }

async def fetch_weather_data(area: str):
    """天気データを取得"""
    api_key = os.getenv('OPENWEATHER_API_KEY')
    if not api_key:
        return {"weather": None, "error": "API key not configured"}
    
    # 地域名から緯度経度を取得（ジオコーディング）
    async with httpx.AsyncClient() as client:
        try:
            # まず地域の座標を取得
            geocoding_response = await client.get(
                "http://api.openweathermap.org/geo/1.0/direct",
                params={
                    "q": f"{area},JP",
                    "limit": 1,
                    "appid": api_key
                }
            )
            
            if geocoding_response.status_code != 200:
                return {
                    "weather": None,
                    "error": f"Geocoding failed: {geocoding_response.status_code}",
                    "status": "error"
                }
            
            locations = geocoding_response.json()
            if not locations:
                return {
                    "weather": None,
                    "error": "Location not found",
                    "status": "error"
                }
            
            lat = locations[0]["lat"]
            lon = locations[0]["lon"]
            
            # 天気データを取得
            weather_response = await client.get(
                "https://api.openweathermap.org/data/2.5/weather",
                params={
                    "lat": lat,
                    "lon": lon,
                    "appid": api_key,
                    "units": "metric",
                    "lang": "ja"
                }
            )
            
            if weather_response.status_code == 200:
                data = weather_response.json()
                return {
                    "weather": {
                        "description": data["weather"][0]["description"],
                        "temperature": data["main"]["temp"],
                        "humidity": data["main"]["humidity"],
                        "wind_speed": data["wind"]["speed"]
                    },
                    "status": "success"
                }
            else:
                return {
                    "weather": None,
                    "error": f"Weather API error: {weather_response.status_code}",
                    "status": "error"
                }
        except Exception as e:
            return {
                "weather": None,
                "error": f"Weather API request failed: {str(e)}",
                "status": "error"
            }

async def fetch_population_data(area: str):
    """人口統計データを取得（デモデータ）"""
    # 実際のAPIが利用可能になるまでデモデータを返す
    demo_data = {
        "渋谷区": {
            "total": 228000,
            "demographics": {
                "0-14": 0.10,
                "15-64": 0.75,
                "65+": 0.15
            },
            "growth_rate": 0.02
        },
        "新宿区": {
            "total": 347000,
            "demographics": {
                "0-14": 0.11,
                "15-64": 0.73,
                "65+": 0.16
            },
            "growth_rate": 0.015
        },
        "池袋区": {
            "total": 290000,
            "demographics": {
                "0-14": 0.12,
                "15-64": 0.71,
                "65+": 0.17
            },
            "growth_rate": 0.01
        }
    }
    
    return {
        "population": demo_data.get(area, {
            "total": 0,
            "demographics": {"0-14": 0, "15-64": 0, "65+": 0},
            "growth_rate": 0
        }),
        "status": "success"
    }

@app.post("/api/reports/generate")
async def generate_report(report: Report):
    try:
        # プロジェクト情報を取得
        conn = sqlite3.connect('mvt_analytics.db')
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM projects WHERE id = ?", (report.project_id,))
        project = cursor.fetchone()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # テンプレート情報を取得
        template_id = report.template_id
        if template_id:
            cursor.execute("SELECT * FROM report_templates WHERE id = ?", (template_id,))
            template = cursor.fetchone()
            if not template:
                raise HTTPException(status_code=404, detail="Template not found")
            template_sections = json.loads(template[3])  # sectionsカラムの値を取得
        else:
            template_sections = []
        
        # 外部データを非同期で取得
        industry_type = project[3]  # industry_typeカラムの値
        target_area = project[4]   # target_areaカラムの値
        
        # 外部APIからデータを取得
        news_data, weather_data, population_data = await asyncio.gather(
            fetch_news_data(industry_type, target_area),
            fetch_weather_data(target_area),
            fetch_population_data(target_area)
        )
        
        # レポートの内容を構築
        report_content = {
            "project_info": {
                "id": project[0],
                "name": project[1],
                "description": project[2],
                "industry_type": industry_type,
                "target_area": target_area
            },
            "market_data": {
                "news": {
                    "articles": news_data.get("articles", []),
                    "status": news_data.get("status", "error"),
                    "error": news_data.get("error")
                },
                "weather": {
                    "data": weather_data.get("weather", {}),
                    "status": weather_data.get("status", "error"),
                    "error": weather_data.get("error")
                },
                "population": {
                    "data": population_data.get("population", {}),
                    "status": population_data.get("status", "error"),
                    "error": population_data.get("error")
                }
            },
            "sections": template_sections
        }
        
        # レポートをデータベースに保存
        cursor.execute('''
        INSERT INTO reports (project_id, title, content, template_id, created_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        ''', (report.project_id, report.title, json.dumps(report_content), template_id))
        
        report_id = cursor.lastrowid
        conn.commit()
        
        return {
            "status": "success",
            "report_id": report_id,
            "content": report_content
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.post("/api/projects/{project_id}/simulate")
def simulate_project(project_id: str, simulation_data: dict):
    """
    売上シミュレーション実行
    """
    try:
        # 入力パラメータの取得
        target_monthly_sales = simulation_data.get("target_monthly_sales", 1000000)
        # フロントエンドとの互換性のため両方の名前をサポート
        average_customer_spend = simulation_data.get("average_customer_spend") or simulation_data.get("average_spend", 5000)
        selected_media = simulation_data.get("selected_media", ["google_ads"])
        media_budgets = simulation_data.get("media_budgets", {"google_ads": 50000})
        operating_costs = simulation_data.get("operating_costs", 300000)
        initial_costs = simulation_data.get("initial_costs", 1000000)
        
        # 総広告予算計算
        total_media_budget = sum(media_budgets.values())
        
        # 業界別・媒体別CVR設定（実データに基づく）
        industry_channel_metrics = {
            "beauty": {
                "google_ads": {"cvr": 0.028, "cpc": 120, "ctr": 0.032},
                "facebook_ads": {"cvr": 0.025, "cpc": 85, "ctr": 0.035},
                "instagram_ads": {"cvr": 0.032, "cpc": 95, "ctr": 0.045},
                "line_ads": {"cvr": 0.030, "cpc": 140, "ctr": 0.025},
                "seo_content": {"cvr": 0.035, "cpc": 0, "ctr": 0.055},
                "local_promotion": {"cvr": 0.055, "cpc": 60, "ctr": 0.080}
            },
            "restaurant": {
                "google_ads": {"cvr": 0.035, "cpc": 100, "ctr": 0.028},
                "facebook_ads": {"cvr": 0.040, "cpc": 75, "ctr": 0.038},
                "instagram_ads": {"cvr": 0.038, "cpc": 80, "ctr": 0.042},
                "line_ads": {"cvr": 0.045, "cpc": 130, "ctr": 0.030},
                "seo_content": {"cvr": 0.032, "cpc": 0, "ctr": 0.048},
                "local_promotion": {"cvr": 0.065, "cpc": 45, "ctr": 0.090}
            },
            "healthcare": {
                "google_ads": {"cvr": 0.022, "cpc": 150, "ctr": 0.025},
                "facebook_ads": {"cvr": 0.018, "cpc": 110, "ctr": 0.020},
                "instagram_ads": {"cvr": 0.015, "cpc": 120, "ctr": 0.018},
                "line_ads": {"cvr": 0.025, "cpc": 180, "ctr": 0.022},
                "seo_content": {"cvr": 0.040, "cpc": 0, "ctr": 0.065},
                "local_promotion": {"cvr": 0.050, "cpc": 70, "ctr": 0.075}
            },
            "fitness": {
                "google_ads": {"cvr": 0.020, "cpc": 130, "ctr": 0.030},
                "facebook_ads": {"cvr": 0.022, "cpc": 90, "ctr": 0.035},
                "instagram_ads": {"cvr": 0.028, "cpc": 100, "ctr": 0.040},
                "line_ads": {"cvr": 0.018, "cpc": 160, "ctr": 0.020},
                "seo_content": {"cvr": 0.025, "cpc": 0, "ctr": 0.045},
                "local_promotion": {"cvr": 0.035, "cpc": 80, "ctr": 0.060}
            }
        }
        
        # プロジェクト情報取得（業界判定のため）
        conn = sqlite3.connect('mvt_analytics.db')
        cursor = conn.cursor()
        cursor.execute("SELECT industry_type FROM projects WHERE id = ?", (project_id,))
        project_row = cursor.fetchone()
        industry = project_row[0] if project_row else "beauty"
        conn.close()
        
        # 業界データベースを使用した詳細計算
        marketing_channels = {}
        try:
            from services.industry_database import industry_db
            industry_data = industry_db.get_industry_data(industry)
            marketing_channels = industry_db.get_marketing_channels(industry)
        except Exception as e:
            print(f"業界データベースエラー: {e}")
            # フォールバック: 従来のハードコードデータ
            marketing_channels = industry_channel_metrics.get(industry, industry_channel_metrics["beauty"])
        
        total_expected_customers = 0
        total_expected_clicks = 0
        detailed_results = {}
        
        for media in selected_media:
            if media in media_budgets and media_budgets[media] > 0:
                budget = media_budgets[media]
                
                # 業界・媒体固有の指標を取得
                if marketing_channels and media in marketing_channels:
                    metrics = marketing_channels[media]
                else:
                    # フォールバック: 従来のデータを使用
                    fallback_data = industry_channel_metrics.get(industry, industry_channel_metrics["beauty"])
                    metrics = fallback_data.get(media, {
                        "cvr": 0.025, "cpc": 100, "ctr": 0.030
                    })
                
                media_cpc = metrics["cpc"]
                media_cvr = metrics["cvr"]
                media_ctr = metrics["ctr"]
                
                # 媒体別の計算
                media_clicks = budget / media_cpc if media_cpc > 0 else 0
                media_customers = int(media_clicks * media_cvr)
                
                total_expected_clicks += media_clicks
                total_expected_customers += media_customers
                
                detailed_results[media] = {
                    "budget": budget,
                    "expected_clicks": int(media_clicks),
                    "expected_customers": media_customers,
                    "cpc": media_cpc,
                    "cvr": media_cvr,
                    "ctr": media_ctr,
                    "quality_score": metrics.get("quality_score", 7.0)
                }
        
        # 総計算
        expected_customers = int(total_expected_customers)
        monthly_revenue = expected_customers * average_customer_spend
        monthly_profit = monthly_revenue - total_media_budget - operating_costs
        
        # 加重平均CVRを計算（結果表示用）
        weighted_cvr = 0
        if total_media_budget > 0:
            for media, budget in media_budgets.items():
                if budget > 0 and media in industry_channel_metrics.get(industry, {}):
                    weight = budget / total_media_budget
                    media_cvr = industry_channel_metrics[industry][media]["cvr"]
                    weighted_cvr += weight * media_cvr
        
        # ROI計算
        roi = (monthly_profit * 12) / (initial_costs + total_media_budget * 12) * 100 if (initial_costs + total_media_budget * 12) > 0 else 0
        
        # CAC計算
        customer_acquisition_cost = total_media_budget / expected_customers if expected_customers > 0 else 0
        
        # 必要顧客数
        required_customers = int(target_monthly_sales / average_customer_spend)
        
        # 損益分岐点
        if monthly_profit > 0:
            breakeven_months = max(1, int(initial_costs / monthly_profit))
        else:
            breakeven_months = 999  # 利益が出ない場合
        
        # 業界比較分析を追加
        industry_comparison = {}
        if 'industry_data' in locals():
            try:
                metrics_for_comparison = {
                    "monthly_revenue": monthly_revenue,
                    "profit_margin": monthly_profit / monthly_revenue if monthly_revenue > 0 else 0
                }
                industry_comparison = industry_db.get_market_comparison(industry, metrics_for_comparison)
                
                # リスク分析も追加
                risk_analysis = industry_db.get_risk_analysis(industry)
                
                # 損益分岐点詳細分析
                breakeven_analysis = industry_db.calculate_breakeven_analysis(
                    industry, monthly_revenue, initial_costs
                )
            except Exception as e:
                print(f"業界分析エラー: {e}")
                industry_comparison = {}
                risk_analysis = []
                breakeven_analysis = {}
        
        # 結果生成
        result = {
            "monthly_revenue": int(monthly_revenue),
            "monthly_profit": int(monthly_profit),
            "breakeven_months": breakeven_months,
            "roi": round(roi, 1),
            "customer_acquisition_cost": int(customer_acquisition_cost),
            "required_customers": required_customers,
            "expected_customers": expected_customers,
            "conversion_rate": weighted_cvr,
            "media_breakdown": detailed_results,
            "industry_comparison": industry_comparison,
            "risk_factors": risk_analysis if 'risk_analysis' in locals() else [],
            "enhanced_analysis": breakeven_analysis if 'breakeven_analysis' in locals() else {}
        }
        
        return {
            "id": "sim-" + datetime.now().strftime("%Y%m%d%H%M%S"),
            "project_id": project_id,
            "result": result,
            "params": simulation_data,
            "created_at": datetime.now().isoformat(),
            "status": "success"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"シミュレーション実行エラー: {str(e)}")

@app.post("/api/projects/{project_id}/analyze")
def analyze_project(project_id: str, analysis_type: str = "market"):
    # 分析結果を生成
    if analysis_type == "market":
        result = {
            "market_size": 500000000,
            "growth_rate": 0.15,
            "competitors": [
                {"name": "競合A", "market_share": 0.25},
                {"name": "競合B", "market_share": 0.15},
                {"name": "競合C", "market_share": 0.10}
            ],
            "target_segments": [
                {"name": "20代女性", "size": 150000},
                {"name": "30代女性", "size": 200000},
                {"name": "40代女性", "size": 100000}
            ]
        }
    else:
        result = {
            "risk_level": "medium",
            "opportunities": ["市場成長", "競合少数", "高い顧客ニーズ"],
            "threats": ["新規参入の可能性", "規制強化"],
            "recommendations": ["早期市場参入", "差別化戦略の構築"]
        }
    
    return {
        "id": "ana-" + datetime.now().strftime("%Y%m%d%H%M%S"),
        "project_id": project_id,
        "type": analysis_type,
        "result": result,
        "created_at": datetime.now().isoformat()
    }

# レポートテンプレートAPI
@app.get("/api/report-templates")
def get_report_templates():
    conn = sqlite3.connect('mvt_analytics.db')
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, description, sections, type, created_at FROM report_templates")
    rows = cursor.fetchall()
    conn.close()
    
    return [
        {
            "id": row[0],
            "name": row[1],
            "description": row[2],
            "sections": json.loads(row[3]),
            "type": row[4],
            "created_at": row[5]
        }
        for row in rows
    ]

@app.get("/api/report-templates/{template_id}")
def get_report_template(template_id: str):
    conn = sqlite3.connect('mvt_analytics.db')
    cursor = conn.cursor()
    cursor.execute("""
        SELECT id, name, description, sections, type, created_at 
        FROM report_templates 
        WHERE id = ?
    """, (template_id,))
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            "id": row[0],
            "name": row[1],
            "description": row[2],
            "sections": json.loads(row[3]),
            "type": row[4],
            "created_at": row[5]
        }
    raise HTTPException(status_code=404, detail="Report template not found")

@app.post("/api/report-templates")
def create_report_template(template: ReportTemplate):
    conn = sqlite3.connect('mvt_analytics.db')
    cursor = conn.cursor()
    
    try:
        template_id = f"tmpl-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        sections_json = json.dumps(template.sections)
        
        cursor.execute("""
            INSERT INTO report_templates (id, name, description, sections, type)
            VALUES (?, ?, ?, ?, ?)
        """, (
            template_id,
            template.name,
            template.description,
            sections_json,
            template.type
        ))
        
        conn.commit()
        
        return {
            "id": template_id,
            "message": "Report template created successfully"
        }
        
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

# レポート生成関連エンドポイント
@app.post("/api/reports/generate")
def generate_report(request: dict):
    """レポート生成API"""
    try:
        project_id = request.get('project_id')
        title = request.get('title')
        template_id = request.get('template_id')
        include_analysis = request.get('include_analysis', True)
        include_simulation = request.get('include_simulation', True)
        chart_types = request.get('chart_types', [])
        
        # レポート生成ロジック（実際の実装では外部ライブラリを使用）
        report_content = {
            "title": title,
            "template_id": template_id,
            "sections": [],
            "charts": chart_types,
            "generated_at": datetime.now().isoformat()
        }
        
        # データベースに保存
        conn = sqlite3.connect('mvt_analytics.db')
        cursor = conn.cursor()
        
        report_id = f"rpt-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        cursor.execute("""
            INSERT INTO reports (project_id, title, content, template_id)
            VALUES (?, ?, ?, ?)
        """, (
            project_id,
            title,
            json.dumps(report_content),
            template_id
        ))
        
        conn.commit()
        conn.close()
        
        return {
            "id": report_id,
            "title": title,
            "created_at": datetime.now().isoformat(),
            "has_pdf": False,
            "has_pptx": False,
            "template_type": template_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"レポート生成エラー: {str(e)}")

@app.get("/api/reports/{report_id}")
def get_report(report_id: str):
    """レポート詳細取得API"""
    conn = sqlite3.connect('mvt_analytics.db')
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, project_id, title, content, pdf_path, pptx_path, template_id, created_at
        FROM reports WHERE id = ?
    """, (report_id,))
    
    row = cursor.fetchone()
    conn.close()
    
    if row:
        return {
            "id": row[0],
            "project_id": row[1],
            "title": row[2],
            "content": json.loads(row[3]) if row[3] else {},
            "has_pdf": bool(row[4]),
            "has_pptx": bool(row[5]),
            "template_id": row[6],
            "created_at": row[7],
            "sections": [
                {"title": "プロジェクト概要", "content": "プロジェクトの概要説明..."},
                {"title": "市場分析", "content": "商圏分析の結果..."},
                {"title": "収益予測", "content": "シミュレーション結果..."}
            ]
        }
    
    raise HTTPException(status_code=404, detail="レポートが見つかりません")

@app.post("/api/reports/{report_id}/export")
def export_report(report_id: str, format: str):
    """レポートエクスポートAPI"""
    try:
        # 実際の実装では、PDFやPPTX生成ライブラリを使用
        if format == "pdf":
            # PDF生成処理
            pdf_path = f"reports/{report_id}.pdf"
            # 実際のPDF生成コードをここに追加
            pass
        elif format == "pptx":
            # PPTX生成処理
            pptx_path = f"reports/{report_id}.pptx"
            # 実際のPPTX生成コードをここに追加
            pass
        
        # データベース更新
        conn = sqlite3.connect('mvt_analytics.db')
        cursor = conn.cursor()
        
        if format == "pdf":
            cursor.execute("UPDATE reports SET pdf_path = ? WHERE id = ?", (pdf_path, report_id))
        elif format == "pptx":
            cursor.execute("UPDATE reports SET pptx_path = ? WHERE id = ?", (pptx_path, report_id))
        
        conn.commit()
        conn.close()
        
        return {"message": f"{format.upper()}エクスポートが完了しました"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"エクスポートエラー: {str(e)}")

@app.get("/api/projects/{project_id}/reports")
def get_project_reports(project_id: str):
    """プロジェクトのレポート一覧取得API"""
    conn = sqlite3.connect('mvt_analytics.db')
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, title, pdf_path, pptx_path, template_id, created_at
        FROM reports WHERE project_id = ?
        ORDER BY created_at DESC
    """, (project_id,))
    
    rows = cursor.fetchall()
    conn.close()
    
    reports = []
    for row in rows:
        reports.append({
            "id": row[0],
            "title": row[1],
            "has_pdf": bool(row[2]),
            "has_pptx": bool(row[3]),
            "template_type": row[4],
            "created_at": row[5]
        })
    
    return {"reports": reports}

@app.get("/api/reports/download/{report_id}")
def download_report(report_id: str, format: str = "pdf"):
    """レポートダウンロードAPI"""
    from fastapi.responses import FileResponse
    import os
    
    # 実際の実装では、レポートファイルの存在確認とパス取得
    if format == "pdf":
        # PDF生成の簡易実装
        try:
            # ここで実際のPDFファイルを生成またはキャッシュから取得
            # 今回はモック応答
            return {"message": f"PDF download for report {report_id} - 実装中"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"PDF生成エラー: {str(e)}")
    elif format == "pptx":
        try:
            return {"message": f"PPTX download for report {report_id} - 実装中"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"PPTX生成エラー: {str(e)}")
    else:
        raise HTTPException(status_code=400, detail="サポートされていないフォーマットです")

# 拡張分析エンドポイントを追加
try:
    from api.routes.enhanced_analysis import router as enhanced_router
    app.include_router(enhanced_router, prefix="/api/enhanced", tags=["Enhanced Analysis"])
    print("✅ 拡張分析機能が正常に読み込まれました")
except ImportError as e:
    print(f"⚠️  拡張分析機能の読み込みに失敗: {e}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 