# -*- coding: utf-8 -*-
from fastapi import FastAPI, HTTPException
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
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
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
    # シミュレーション結果を生成
    result = {
        "monthly_revenue": 1500000,
        "monthly_profit": 450000,
        "breakeven_months": 8,
        "roi": 0.25,
        "customer_acquisition_cost": 5000,
        "required_customers": 300,
        "expected_customers": 350,
        "conversion_rate": 0.15
    }
    
    return {
        "id": "sim-" + datetime.now().strftime("%Y%m%d%H%M%S"),
        "project_id": project_id,
        "result": result,
        "created_at": datetime.now().isoformat()
    }

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 