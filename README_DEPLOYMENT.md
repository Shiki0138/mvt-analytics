# 🎯 MVT Analytics - 簡単デプロイガイド

## 🚀 クイックスタート（3ステップ）

### 1. ダウンロード
```bash
git clone https://github.com/Shiki0138/mvt-analytics.git
cd mvt-analytics
```

### 2. セットアップ
```bash
# 自動セットアップスクリプト実行
chmod +x setup.sh
./setup.sh
```

### 3. 起動
```bash
# バックエンド起動
cd backend && python main.py &

# フロントエンド起動  
cd frontend && npm run dev
```

**🌐 アクセス**: http://localhost:8080

---

## 📱 使用方法

1. **プロジェクト作成** → ダッシュボードで「新しいプロジェクト」
2. **分析実行** → プロジェクト詳細で「分析を開始」  
3. **商圏設定** → 地域・ターゲット層を詳細設定
4. **結果確認** → 人口分析・競合分析・需要予測を確認

---

## 🎁 オプション機能

### Google Maps統合
```bash
# .envファイルにAPIキーを追加
echo "VITE_GOOGLE_MAPS_API_KEY=your_key_here" >> frontend/.env
```

**取得方法**: [Google Cloud Console](https://console.cloud.google.com) → Maps JavaScript API有効化

---

## 🔄 アップデート
```bash
git pull origin master
cd frontend && npm install
cd backend && pip install -r requirements.txt
```

**🆘 トラブル時**: `他のPCでの使用方法.md` を参照