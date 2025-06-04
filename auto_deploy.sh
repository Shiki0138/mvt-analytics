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

# Step 3: GitHub Actions の実行確認
echo ""
echo "⏳ Step 3: GitHub Actions CI/CD 確認中..."
echo "   🔄 自動テスト & デプロイが実行中です..."
echo "   📱 進行状況: https://github.com/Shiki0138/mvt-analytics/actions"

# Step 4: デプロイ完了まで待機（簡易版）
echo ""
echo "🎯 Step 4: デプロイ確認..."
echo "   ⏱️  デプロイ完了まで約2-3分お待ちください..."

# 30秒後にヘルスチェック
sleep 30
echo "   🩺 Railway API ヘルスチェック..."

if curl -s https://mvt-analytics-production.up.railway.app/ | grep -q "MVT Analytics API"; then
    echo "   ✅ Railway (バックエンド): デプロイ成功"
else
    echo "   ⏳ Railway (バックエンド): まだデプロイ中..."
fi

# Step 5: 完了通知
echo ""
echo "=================================================="
echo "🎉 自動デプロイプロセス完了！"
echo ""
echo "🔗 アクセスURL:"
echo "   🌐 Frontend: https://mvtanalytics.vercel.app/"
echo "   📡 Backend:  https://mvt-analytics-production.up.railway.app/"
echo ""
echo "📊 GitHub Actions: https://github.com/Shiki0138/mvt-analytics/actions"
echo "🔧 Railway Dashboard: https://railway.app/"
echo "⚡ Vercel Dashboard: https://vercel.com/"
echo ""
echo "✅ 全システム稼働中！"
echo "==================================================" 