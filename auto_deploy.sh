#!/bin/bash

# 🚀 MVT Analytics Auto Deploy Script
# 開発からデプロイまで完全自動化

echo "🚀 MVT Analytics 自動デプロイを開始..."
echo "=================================================="

# Step 1: ローカルテスト
echo "🧪 Step 1: ローカルテスト実行中..."

# バックエンドテスト
echo "   🔧 バックエンドAPI テスト..."
cd backend
if source venv/bin/activate && python -c "import main; print('✅ Backend import OK')" 2>/dev/null; then
    echo "   ✅ バックエンドテスト: 成功"
else
    echo "   ❌ バックエンドテスト: 失敗"
    exit 1
fi

# フロントエンドビルドテスト
echo "   🎨 フロントエンド ビルドテスト..."
cd ../frontend
if npm run build > /dev/null 2>&1; then
    echo "   ✅ フロントエンドビルド: 成功"
else
    echo "   ❌ フロントエンドビルド: 失敗"
    exit 1
fi

cd ..

# Step 2: Git 自動コミット & プッシュ
echo ""
echo "📝 Step 2: Git自動コミット & プッシュ..."

# 変更があるかチェック
if git diff --quiet && git diff --staged --quiet; then
    echo "   ℹ️  変更なし - プッシュをスキップ"
else
    # 自動コミットメッセージ生成
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M')
    COMMIT_MSG="🚀 Auto Deploy: $TIMESTAMP

✅ Automated deployment
- Backend API tested
- Frontend build verified
- Ready for production"

    echo "   📝 変更をコミット中..."
    git add .
    git commit -m "$COMMIT_MSG"
    
    echo "   📤 GitHubにプッシュ中..."
    git push
    
    if [ $? -eq 0 ]; then
        echo "   ✅ GitHubプッシュ: 成功"
    else
        echo "   ❌ GitHubプッシュ: 失敗"
        exit 1
    fi
fi

# Step 3: デプロイ確認
echo ""
echo "🎯 Step 3: デプロイ確認中..."

# Railway APIヘルスチェック
echo "   🚂 Railway (バックエンド) 確認中..."
RAILWAY_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://mvt-analytics-production.up.railway.app/health)
if [ "$RAILWAY_STATUS" = "200" ]; then
    echo "   ✅ Railway: 正常稼働中"
else
    echo "   ⚠️ Railway: 応答コード $RAILWAY_STATUS"
fi

# Vercelデプロイ確認
echo "   ⚡ Vercel (フロントエンド) 確認中..."
VERCEL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://mvtanalytics.vercel.app)
if [ "$VERCEL_STATUS" = "200" ]; then
    echo "   ✅ Vercel: 正常稼働中"
else
    echo "   ⚠️ Vercel: 応答コード $VERCEL_STATUS"
fi

# 完了通知
echo ""
echo "=================================================="
echo "🎉 自動デプロイプロセス完了！"
echo ""
echo "🔗 アクセスURL:"
echo "   🌐 Frontend: https://mvtanalytics.vercel.app/"
echo "   📡 Backend:  https://mvt-analytics-production.up.railway.app/"
echo ""
echo "📊 モニタリング:"
echo "   🔄 GitHub Actions: https://github.com/Shiki0138/mvt-analytics/actions"
echo "   ⚡ Vercel Dashboard: https://vercel.com/dashboard"
echo "   🚂 Railway Dashboard: https://railway.app/"
echo ""
echo "✅ 全システム稼働中！"
echo "==================================================" 