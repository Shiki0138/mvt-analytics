#!/bin/bash

echo "🚀 MVT Analytics 開発環境を起動中..."

# 既存のプロセスを停止
echo "📝 既存のプロセスを停止中..."
pkill -f "python.*main.py" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# バックエンドを起動
echo "🔧 バックエンドサーバーを起動中..."
cd backend
source venv/bin/activate
python main.py &
BACKEND_PID=$!
cd ..

# 少し待機
sleep 3

# バックエンドの動作確認
echo "✅ バックエンドAPIの動作確認中..."
curl -s http://localhost:8000/ > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ バックエンドAPI: http://localhost:8000/ - 正常"
else
    echo "❌ バックエンドAPIが応答しません"
fi

# フロントエンドを起動
echo "🎨 フロントエンドサーバーを起動中..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 開発環境が起動しました！"
echo ""
echo "📱 フロントエンド: http://localhost:5173/"
echo "🔧 バックエンドAPI: http://localhost:8000/"
echo ""
echo "停止するには Ctrl+C を押してください"
echo ""

# プロセス監視
trap 'echo "🛑 開発環境を停止中..."; kill $BACKEND_PID 2>/dev/null; kill $FRONTEND_PID 2>/dev/null; exit' INT

# 待機
wait 