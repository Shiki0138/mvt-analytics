# 🚀 Vercelフロントエンドデプロイガイド

## 📋 **現在の状況**

- ✅ **バックエンドAPI**: https://mvt-analytics-production.up.railway.app/ (動作中)
- ⏳ **フロントエンド**: まだデプロイされていません

---

## 🎯 **Vercelデプロイ手順**

### **Step 1: Vercelアカウント**
1. https://vercel.com にアクセス
2. GitHubアカウントでサインアップ/ログイン

### **Step 2: プロジェクト接続**
1. **「New Project」** をクリック
2. **GitHub リポジトリ** `mvt-analytics` を選択
3. **Import** をクリック

### **Step 3: ビルド設定**
```
Framework Preset: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### **Step 4: 環境変数設定**
```
VITE_API_URL = https://mvt-analytics-production.up.railway.app
VITE_ENVIRONMENT = production
```

### **Step 5: デプロイ実行**
- **「Deploy」** をクリック
- 約2-3分でデプロイ完了

---

## 🌐 **デプロイ後のURL例**

```
https://mvt-analytics-frontend.vercel.app/
```

---

## 🔗 **アーキテクチャ**

```
ユーザー → Vercel (フロントエンド) → Railway (バックエンドAPI) → Supabase (データベース)
```

### **コスト**
- **Vercel**: 無料枠
- **Railway**: 無料枠 (500時間/月)
- **Supabase**: 無料枠 (500MB)
- **合計**: $0/月

---

## 📱 **アプリケーション構成**

### **フロントエンド機能**
- ダッシュボード
- プロジェクト管理
- 売上シミュレーション
- 市場分析
- レポート生成

### **バックエンドAPI**
- `/api/projects` - プロジェクト管理
- `/api/simulations` - シミュレーション実行
- `/api/analyses` - 分析データ
- `/api/reports` - レポート生成

---

## 🛠️ **ローカル開発**

```bash
# 開発環境起動
./start_dev.sh

# アクセス
フロントエンド: http://localhost:5173/
バックエンド: http://localhost:8000/
```

---

## 🎯 **次のアクション**

1. **今すぐ**: ローカル開発環境でテスト (`./start_dev.sh`)
2. **5-10分後**: Vercelでフロントエンドデプロイ
3. **完成**: 完全なWebアプリケーション公開

**🚀 Railway APIは完璧に動作中！フロントエンドデプロイで完成です！** 