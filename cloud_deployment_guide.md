# MVT Analytics System - クラウドデプロイメントガイド

## 🎯 推奨構成：Railway + Supabase

### コスト構成
- **Railway**: $5-20/月（トラフィックに応じて）
- **Supabase**: $25/月（Pro plan）
- **Cloudflare**: $0（無料プラン）
- **総額**: 月額 $30-45

---

## 🔧 Step 1: Supabase セットアップ

### 1.1 Supabase プロジェクト作成
```bash
# Supabase CLI インストール
npm install -g supabase

# Supabase にログイン
supabase login

# 新プロジェクト作成
supabase init
```

### 1.2 データベーススキーマ適用
```sql
-- Supabaseダッシュボードのクエリエディタで実行

-- ユーザー管理テーブル（Supabase Auth連携）
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  plan_type TEXT DEFAULT 'free', -- free, basic, pro
  subscription_status TEXT DEFAULT 'inactive',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- プロジェクトテーブル（user_id追加）
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
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
  isochrone_data JSONB,
  population_data JSONB,
  competitor_data JSONB,
  demand_metrics JSONB,
  roi_projections JSONB,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- レポートテーブル
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB,
  charts_data JSONB,
  pdf_path TEXT,
  pptx_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Row Level Security (RLS) 設定
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- RLS ポリシー（ユーザーは自分のデータのみアクセス可能）
CREATE POLICY "Users can manage their own projects" ON projects
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own simulations" ON sales_simulations
  FOR ALL USING (auth.uid() = (SELECT user_id FROM projects WHERE id = project_id));

CREATE POLICY "Users can manage their own analyses" ON analyses
  FOR ALL USING (auth.uid() = (SELECT user_id FROM projects WHERE id = project_id));

CREATE POLICY "Users can manage their own reports" ON reports
  FOR ALL USING (auth.uid() = (SELECT user_id FROM projects WHERE id = project_id));
```

### 1.3 Supabase 環境変数取得
```bash
# .env.production ファイル作成
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project-id.supabase.co:5432/postgres
```

---

## 🚀 Step 2: Railway デプロイメント

### 2.1 Railway プロジェクト作成
```bash
# Railway CLI インストール
npm install -g @railway/cli

# Railway にログイン
railway login

# プロジェクト作成
railway init
```

### 2.2 バックエンド用 Dockerfile 作成
```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# システム依存関係
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Python依存関係
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーション
COPY . .

# Gunicorn で本番起動
CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

### 2.3 フロントエンド用 Dockerfile 作成
```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Nginx で配信
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx設定
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2.4 Nginx 設定
```nginx
# frontend/nginx.conf
server {
    listen 80;
    server_name _;
    
    root /usr/share/nginx/html;
    index index.html;
    
    # React Router用
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API プロキシ
    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # セキュリティヘッダー
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
}
```

### 2.5 Railway デプロイ
```bash
# バックエンドサービス
cd backend
railway up

# フロントエンドサービス
cd ../frontend
railway up

# 環境変数設定
railway variables set DATABASE_URL=<supabase_db_url>
railway variables set SUPABASE_URL=<your_supabase_url>
railway variables set SUPABASE_ANON_KEY=<your_anon_key>
```

---

## 🔐 Step 3: 認証・課金システム実装

### 3.1 Supabase Auth統合（フロントエンド）
```typescript
// frontend/src/utils/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

```typescript
// frontend/src/components/Auth.tsx
import { useState } from 'react'
import { supabase } from '../utils/supabase'
import { Button, TextField, Card, CardContent } from '@mui/material'

export function Auth() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignIn = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    })
    if (error) console.error('Error:', error.message)
    else alert('認証メールを送信しました！')
    setLoading(false)
  }

  return (
    <Card sx={{ maxWidth: 400, mx: 'auto', mt: 4 }}>
      <CardContent>
        <TextField
          label="メールアドレス"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button
          onClick={handleSignIn}
          disabled={loading}
          variant="contained"
          fullWidth
        >
          {loading ? 'Loading...' : 'サインイン'}
        </Button>
      </CardContent>
    </Card>
  )
}
```

### 3.2 バックエンド認証ミドルウェア
```python
# backend/utils/auth.py
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
import os

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_KEY")
)

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    try:
        user = supabase.auth.get_user(token)
        if user.user is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return user.user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
```

### 3.3 Stripe課金統合
```python
# backend/utils/billing.py
import stripe
import os

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

PLANS = {
    "free": {"price": 0, "projects": 1, "analyses": 5},
    "basic": {"price": 2980, "projects": 10, "analyses": 100},
    "pro": {"price": 9800, "projects": 100, "analyses": 1000}
}

async def create_checkout_session(user_id: str, plan: str):
    try:
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'jpy',
                    'product_data': {
                        'name': f'MVT Analytics {plan.title()} Plan',
                    },
                    'unit_amount': PLANS[plan]["price"],
                    'recurring': {'interval': 'month'},
                },
                'quantity': 1,
            }],
            mode='subscription',
            success_url=f'{os.getenv("FRONTEND_URL")}/billing/success',
            cancel_url=f'{os.getenv("FRONTEND_URL")}/billing/cancel',
            client_reference_id=user_id,
        )
        return session
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```

---

## 🛡️ Step 4: セキュリティ対策

### 4.1 Cloudflare設定
```bash
# Cloudflare で以下を設定：
# 1. SSL/TLS: Full (strict)
# 2. Security Level: Medium
# 3. Rate Limiting: 100 requests/minute
# 4. Bot Fight Mode: ON
# 5. DDoS Protection: ON
```

### 4.2 環境変数セキュリティ
```bash
# Railway環境変数（本番）
railway variables set NODE_ENV=production
railway variables set CORS_ORIGINS=https://yourdomain.com
railway variables set RATE_LIMIT_PER_MINUTE=60
railway variables set JWT_SECRET=your-super-secret-key
railway variables set STRIPE_SECRET_KEY=sk_live_...
railway variables set STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4.3 FastAPI セキュリティ設定
```python
# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
import redis.asyncio as redis

app = FastAPI(
    title="MVT Analytics API",
    version="1.0.0",
    docs_url="/docs" if os.getenv("NODE_ENV") != "production" else None,
    redoc_url=None
)

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "").split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Host制限
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["yourdomain.com", "*.yourdomain.com"]
)

# Rate Limiting
@app.on_event("startup")
async def startup():
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
    redis_client = redis.from_url(redis_url, encoding="utf-8", decode_responses=True)
    await FastAPILimiter.init(redis_client)
```

---

## 💰 Step 5: 課金プラン実装

### 5.1 使用量制限チェック
```python
# backend/utils/usage_limits.py
from sqlalchemy.orm import Session
from models.database import Project, Analysis

async def check_project_limit(user_id: str, plan: str, db: Session):
    project_count = db.query(Project).filter(Project.user_id == user_id).count()
    limit = PLANS[plan]["projects"]
    
    if project_count >= limit:
        raise HTTPException(
            status_code=403, 
            detail=f"プロジェクト数の上限（{limit}）に達しました。プランをアップグレードしてください。"
        )

async def check_analysis_limit(user_id: str, plan: str, db: Session):
    # 月間使用量チェックロジック
    pass
```

### 5.2 Stripe Webhook
```python
# backend/api/routes/billing.py
from fastapi import APIRouter, Request, HTTPException
import stripe
import os

router = APIRouter()
endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

@router.post("/stripe/webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event['type'] == 'customer.subscription.created':
        # サブスクリプション開始処理
        subscription = event['data']['object']
        await handle_subscription_created(subscription)
    
    elif event['type'] == 'customer.subscription.deleted':
        # サブスクリプション終了処理
        subscription = event['data']['object']
        await handle_subscription_cancelled(subscription)

    return {"status": "success"}
```

---

## 📊 Step 6: モニタリング・分析

### 6.1 Railway ログ監視
```bash
# ログ確認
railway logs

# メトリクス確認
railway status
```

### 6.2 Supabase Analytics
```sql
-- ダッシュボードで使用量監視クエリ
-- 日次アクティブユーザー
SELECT DATE(created_at) as date, COUNT(DISTINCT user_id) as dau
FROM projects 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at);

-- プラン別ユーザー分布
SELECT plan_type, COUNT(*) as users
FROM user_profiles
GROUP BY plan_type;
```

---

## 🎯 Total Monthly Cost Breakdown

| サービス | 基本コスト | スケール時 |
|---------|-----------|-----------|
| Railway | $5-20 | $50+ |
| Supabase | $25 | $50+ |
| Cloudflare | $0 | $20 |
| Stripe | 3.6% | 3.6% |
| **合計** | **$30-45/月** | **$120+/月** |

### コスト最適化のコツ
1. **Railway**: 不要なサービス停止でコスト削減
2. **Supabase**: データベースサイズ最適化
3. **Cloudflare**: キャッシュ活用でトラフィック削減
4. **監視**: 使用量ダッシュボード構築

---

## 🚀 デプロイ手順まとめ

```bash
# 1. Supabase セットアップ
supabase init && supabase db push

# 2. Railway デプロイ
railway login && railway up

# 3. ドメイン設定
railway domain

# 4. 環境変数設定
railway variables set DATABASE_URL=<supabase_url>

# 5. SSL証明書（Cloudflare）
# ダッシュボードで設定

# 6. ヘルスチェック
curl https://yourdomain.com/health
```

このセットアップで、月額$30-45から始められる本格的なSaaSシステムが構築できます！ 