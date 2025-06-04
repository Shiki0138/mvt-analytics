#!/bin/bash

echo "🚀 MVT Analytics System セットアップを開始します..."

# 環境チェック
echo "📋 環境要件をチェックしています..."

# Python チェック
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3.8+ が必要です"
    exit 1
fi

# Python バージョンチェック
PYTHON_VERSION=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo "🐍 Python バージョン: $PYTHON_VERSION"

# Node.js チェック
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 18+ が必要です"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "📦 Node.js バージョン: $NODE_VERSION"

# PostgreSQL チェック
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL がインストールされていません（SQLiteを使用）"
fi

echo "✅ 環境要件OK"

# pip アップグレード
echo "🔧 pip をアップグレードしています..."
python3 -m pip install --upgrade pip

# バックエンド セットアップ
echo "🐍 バックエンド依存関係をインストールしています..."
cd backend
python3 -m pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "⚠️  一部のパッケージインストールでエラーが発生しました。基本的なパッケージを個別にインストールしています..."
    python3 -m pip install fastapi uvicorn sqlalchemy python-dotenv requests
    if [ $? -ne 0 ]; then
        echo "❌ 必須パッケージのインストールに失敗しました"
        exit 1
    fi
fi
cd ..

# フロントエンド セットアップ
echo "📦 フロントエンド依存関係をインストールしています..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ フロントエンド依存関係のインストールに失敗しました"
    exit 1
fi
cd ..

# 環境設定ファイル作成
if [ ! -f .env ]; then
    echo "⚙️  環境設定ファイルを作成しています..."
    cat > .env << EOF
# Database Configuration (SQLite)
DATABASE_URL=sqlite:///mvt_analytics.db

# External API Keys (オプション)
ESTAT_API_KEY=
RESAS_API_KEY=
GOOGLE_PLACES_API_KEY=
OPENROUTESERVICE_API_KEY=
MAPBOX_API_KEY=

# Development Settings
DEBUG=true
LOG_LEVEL=info
EOF
    echo "📝 .env ファイルを作成しました。必要に応じてAPI키를 設定してください。"
fi

# データベース初期化（SQLiteを使用）
echo "💾 データベースを初期化しています..."
cd backend
# SQLiteを使用
export DATABASE_URL="sqlite:///mvt_analytics.db"
python3 scripts/init_db.py
if [ $? -ne 0 ]; then
    echo "⚠️  データベース初期化でエラーが発生しましたが、続行します..."
fi
cd ..

echo "✅ セットアップ完了！"
echo ""
echo "🎉 MVT Analytics System が使用可能になりました！"
echo ""
echo "起動方法:"
echo "1. バックエンド起動:"
echo "   cd backend && python3 main.py"
echo ""
echo "2. フロントエンド起動（別ターミナル）:"
echo "   cd frontend && npm run dev"
echo ""
echo "3. ブラウザでアクセス:"
echo "   http://localhost:5173"
echo ""
echo "📚 機能:"
echo "• Sales Funnel Simulator - 売上逆算シミュレーション"
echo "• 商圏・競合・需要分析（MVP版はモックデータ）"
echo "• レポート生成・エクスポート"
echo "• プロジェクト管理"
echo ""
echo "🔗 API ドキュメント: http://localhost:8000/docs" 