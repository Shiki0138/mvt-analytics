#!/bin/bash

echo "🚀 MVT Analytics - 開発者向け無料デプロイメント"
echo "総コスト: $0/月"
echo ""

# 必要ツールチェック
echo "📋 必要ツールをチェック中..."

if ! command -v git &> /dev/null; then
    echo "❌ Git が必要です"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js が必要です"
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 が必要です"
    exit 1
fi

echo "✅ 必要ツール確認完了"
echo ""

# 1. GitHub準備
echo "📦 1. GitHub リポジトリ準備"
echo "以下の手順を実行してください："
echo ""
echo "1. GitHub.com でリポジトリ作成:"
echo "   https://github.com/new"
echo ""
echo "2. ローカルでGit初期化:"
echo "   git init"
echo "   git add ."
echo "   git commit -m 'Initial commit'"
echo "   git remote add origin https://github.com/[USERNAME]/mvt-analytics.git"
echo "   git push -u origin main"
echo ""
read -p "GitHub リポジトリの準備が完了したら Enter を押してください..."

# 2. Supabase準備
echo ""
echo "🗄️  2. Supabase データベース準備"
echo "以下の手順を実行してください："
echo ""
echo "1. Supabase アカウント作成:"
echo "   https://supabase.com"
echo ""
echo "2. New Project 作成"
echo ""
echo "3. Project Settings > API で以下を確認:"
echo "   - Project URL"
echo "   - anon public key" 
echo ""
echo "4. SQL Editor で以下のスキーマを実行:"
echo ""
cat << 'EOF'
-- プロジェクトテーブル
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

-- サンプルデータ
INSERT INTO projects (name, industry_type, target_area, description) VALUES
('サンプル美容室', 'beauty', '渋谷区', '新規美容室の市場分析プロジェクト'),
('カフェ出店計画', 'restaurant', '新宿区', 'カフェチェーン新店舗の戦略立案');
EOF
echo ""
read -p "Supabase データベースの準備が完了したら Enter を押してください..."

# 3. Railway準備
echo ""
echo "🚂 3. Railway デプロイメント準備"
echo "以下の手順を実行してください："
echo ""
echo "1. Railway アカウント作成:"
echo "   https://railway.app"
echo ""
echo "2. GitHub アカウントで連携"
echo ""
echo "3. New Project > Deploy from GitHub repo"
echo ""
echo "4. 作成したリポジトリを選択"
echo ""
echo "5. Generate domain でURLを取得"
echo ""
read -p "Railway プロジェクトの作成が完了したら Enter を押してください..."

# 4. 環境変数設定
echo ""
echo "⚙️  4. 環境変数設定"
echo "Railwayダッシュボードで以下の環境変数を設定してください："
echo ""
echo "バックエンドサービス:"
echo "  DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"
echo "  SUPABASE_URL=https://[PROJECT-ID].supabase.co"
echo "  SUPABASE_ANON_KEY=[YOUR-ANON-KEY]"
echo ""
echo "フロントエンドサービス:"
echo "  VITE_API_URL=https://[BACKEND-RAILWAY-URL].railway.app"
echo "  VITE_SUPABASE_URL=https://[PROJECT-ID].supabase.co"
echo "  VITE_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]"
echo ""
read -p "環境変数の設定が完了したら Enter を押してください..."

# 5. 完了
echo ""
echo "🎉 デプロイメント完了！"
echo ""
echo "📊 コスト構成:"
echo "  Railway Free: $0/月"
echo "  Supabase Free: $0/月"
echo "  合計: $0/月"
echo ""
echo "📈 制限事項:"
echo "  - Railway: 500時間/月 (約20日間常時稼働)"
echo "  - Supabase: 500MB Database"
echo ""
echo "🔗 アクセス URL:"
echo "  フロントエンド: [Railway-Frontend-URL]"
echo "  バックエンド: [Railway-Backend-URL]"
echo "  API ドキュメント: [Railway-Backend-URL]/docs"
echo ""
echo "💡 追加設定（オプション）:"
echo "  - カスタムドメイン設定"
echo "  - Cloudflare CDN設定"
echo "  - モニタリング設定"
echo ""
echo "✅ 開発者向け無料SaaSプラットフォームの構築完了！" 