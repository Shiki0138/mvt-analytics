# MVT Analytics - 開発者向け最小コストデプロイメント

## 🎯 目標：月額 $0～$10 で運用

### 対象ユーザー
- 開発者自身
- 共同開発者（数名）
- 一般ユーザー認証は不要

---

## 🏆 推奨構成：Railway Free + Supabase Free

### 💰 コスト構成
```
Railway Free Plan:
- $0/月
- 512MB RAM、1GB Storage
- 500時間/月の稼働時間

Supabase Free Plan:
- $0/月
- 500MB Database
- 50,000 MAU (Monthly Active Users)
- 2GB bandwidth

Cloudflare:
- $0/月 (無料プラン)

合計: $0/月 ✨
```

### ⚠️ 制限事項
- Railway: 月500時間制限（約20日間常時稼働）
- Supabase: 500MB DB制限
- 認証なし（開発者のみアクセス）

---

## 🚀 セットアップ手順

### Step 1: Supabase無料セットアップ

#### 1.1 アカウント作成・プロジェクト作成
```bash
# 1. https://supabase.com でアカウント作成
# 2. New Project作成
# 3. Project settings > API から以下を取得：
#    - Project URL
#    - anon public key
#    - Database URL
```

#### 1.2 データベーススキーマ作成
```sql
-- Supabaseダッシュボードのクエリエディタで実行

-- プロジェクトテーブル（ユーザー認証なし版）
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  industry_type TEXT NOT NULL,
  target_area TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- シミュレーションテーブル
CREATE TABLE sales_simulations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  target_monthly_sales NUMERIC NOT NULL,
  average_order_value NUMERIC NOT NULL,
  conversion_rate NUMERIC NOT NULL,
  selected_media JSONB,
  required_customers NUMERIC,
  required_reach NUMERIC,
  required_budget NUMERIC,
  breakeven_months INTEGER,
  cashflow_projection JSONB,
  funnel_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 分析結果テーブル
CREATE TABLE analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  population_data JSONB,
  competitor_data JSONB,
  demand_metrics JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- レポートテーブル
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- サンプルデータ挿入
INSERT INTO projects (name, industry_type, target_area, description) VALUES
('サンプル美容室', 'beauty', '渋谷区', '新規美容室の市場分析プロジェクト'),
('カフェ出店計画', 'restaurant', '新宿区', 'カフェチェーン新店舗の戦略立案');
```

### Step 2: Railway無料デプロイ

#### 2.1 Railway準備
```bash
# Railway CLI インストール
npm install -g @railway/cli

# GitHub repository作成・プッシュ（必須）
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/mvt-analytics.git
git push -u origin main
```

#### 2.2 バックエンド用Dockerfile（軽量版）
```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# 最小限の依存関係のみ
COPY requirements_minimal.txt .
RUN pip install --no-cache-dir -r requirements_minimal.txt

COPY . .

# ポート設定
EXPOSE 8000

# 軽量起動（gunicorn不要）
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 2.3 最小限のrequirements
```python
# backend/requirements_minimal.txt
fastapi>=0.100.0
uvicorn[standard]>=0.20.0
sqlalchemy>=2.0.0
psycopg2-binary>=2.9.0
python-dotenv>=1.0.0
httpx>=0.24.0
pydantic>=2.0.0
```

#### 2.4 フロントエンド用Dockerfile（静的配信）
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 軽量Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# シンプルなnginx設定
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 2.5 Railway デプロイ
```bash
# 1. railway.app でアカウント作成
# 2. GitHub連携
# 3. Repository選択してデプロイ

# または CLI経由
railway login
railway init
railway up
```

### Step 3: 環境変数設定

#### 3.1 Railwayダッシュボードで設定
```bash
# バックエンドサービス環境変数
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
SUPABASE_URL=https://[PROJECT-ID].supabase.co
SUPABASE_ANON_KEY=[YOUR-ANON-KEY]

# フロントエンドサービス環境変数
VITE_API_URL=https://[BACKEND-RAILWAY-URL].railway.app
VITE_SUPABASE_URL=https://[PROJECT-ID].supabase.co
VITE_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
```

---

## 📱 代替案：完全無料構成

### Option A: Vercel + Supabase (無料)
```
コスト: $0/月

Vercel Hobby Plan:
- 無料
- 100GB bandwidth
- Serverless Functions

メリット:
- フロントエンド最適化
- 自動デプロイ
- 高速CDN

制限:
- バックエンド実装が複雑
- Serverless制約
```

### Option B: Netlify + Supabase (無料)
```
コスト: $0/月

Netlify Free Plan:
- 無料
- 100GB bandwidth
- Netlify Functions

メリット:
- 簡単デプロイ
- フォーム処理

制限:
- Function実行時間制限
- 少ないDBアクセス
```

### Option C: GitHub Pages + JSONファイル (完全無料)
```
コスト: $0/月

構成:
- GitHub Pages (静的ホスティング)
- JSONファイルでデータ管理
- GitHub Actions でビルド

メリット:
- 完全無料
- Git管理

制限:
- データベース機能なし
- 静的サイトのみ
```

---

## 🎯 推奨セットアップフロー

### Phase 1: 最小構成で開始
```bash
# 1. Supabase無料アカウント作成 (5分)
https://supabase.com

# 2. 上記SQLスキーマ実行 (5分)

# 3. Railway無料アカウント作成 (5分)
https://railway.app

# 4. GitHubリポジトリ作成・プッシュ (10分)
git init && git add . && git commit -m "init"

# 5. Railway GitHub連携デプロイ (10分)
# ダッシュボードでRepository選択

# 6. 環境変数設定 (5分)
# Railway Variables設定

# 総作業時間: 約40分
```

### Phase 2: カスタムドメイン (オプション)
```bash
# 独自ドメイン取得
# - お名前.com: 約1,000円/年
# - Cloudflare DNS設定: 無料
# - Railway カスタムドメイン設定: 無料

# 年間1,000円の追加投資でプロフェッショナルなURL
```

---

## 💡 コスト最適化のコツ

### 1. Railway無料プランを最大活用
```bash
# 使用時間を節約する方法
- 開発時のみ起動
- 不要時は停止
- スリープ機能活用

# 月500時間 = 約20日間常時稼働
# 実際は十分な稼働時間
```

### 2. Supabase容量管理
```bash
# データベース容量節約
- 不要データ定期削除
- 画像はCloudinary無料プラン併用
- ログデータの定期クリーンアップ

# 500MB = 十分な開発・テスト環境
```

### 3. トラフィック最適化
```bash
# 帯域幅節約
- 画像最適化
- Gzip圧縮
- キャッシュ活用
- 不要なAPIコール削減
```

---

## 🔧 実装例：認証なし版のコード修正

### バックエンド認証スキップ
```python
# backend/main.py - 認証ミドルウェア削除版
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="MVT Analytics API (Dev)")

# CORS設定（開発環境用）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 開発用：全オリジン許可
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 認証なしでAPI利用可能
@app.get("/api/projects")
async def get_projects():
    # Supabaseから直接取得
    pass
```

### フロントエンド認証スキップ
```typescript
// frontend/src/utils/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// 認証ヘッダーなしでAPI呼び出し
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})
```

---

## 📋 デプロイチェックリスト

- [ ] Supabase プロジェクト作成
- [ ] データベーススキーマ実行
- [ ] サンプルデータ挿入
- [ ] Railway アカウント作成
- [ ] GitHub リポジトリ作成
- [ ] Railway GitHub連携
- [ ] 環境変数設定
- [ ] デプロイ確認
- [ ] 動作テスト

**予想作業時間**: 1時間以内  
**運用コスト**: $0/月  
**スケール時**: $5-10/月（Railway有料プラン）

これで開発者専用の完全に動作するシステムを無料で公開できます！ 