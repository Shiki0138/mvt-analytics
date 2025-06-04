#!/bin/bash

echo "🚀 MVT Analytics - 無料デプロイメント開始"
echo "💰 コスト: $0/月"
echo ""

# Git状態確認
if [ ! -d ".git" ]; then
    echo "📦 Gitリポジトリを初期化..."
    git init
    git add .
    git commit -m "Initial commit for free deployment"
    echo "✅ Git初期化完了"
else
    echo "📦 変更をコミット..."
    git add .
    git commit -m "Deploy to Railway - $(date)"
    echo "✅ コミット完了"
fi

echo ""
echo "📋 次のステップ:"
echo ""
echo "1. GitHubリポジトリを作成:"
echo "   https://github.com/new"
echo ""
echo "2. リモートリポジトリを追加:"
echo "   git remote add origin https://github.com/[YOUR_USERNAME]/mvt-analytics.git"
echo "   git push -u origin main"
echo ""
echo "3. Supabaseプロジェクト作成:"
echo "   https://supabase.com"
echo "   - 新規プロジェクト作成"
echo "   - SQL Editorでスキーマ実行（minimal_deployment_guide.md参照）"
echo ""
echo "4. Railwayプロジェクト作成:"
echo "   https://railway.app"
echo "   - GitHub連携"
echo "   - New Project from GitHub"
echo "   - 環境変数設定:"
echo "     DATABASE_URL=postgresql://..."
echo "     SUPABASE_URL=https://..."
echo "     SUPABASE_ANON_KEY=..."
echo ""
echo "🎯 予想作業時間: 30-40分"
echo "🎉 完了後: 完全無料のSaaSシステムが稼働！" 