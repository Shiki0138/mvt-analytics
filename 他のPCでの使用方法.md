# 🚀 MVT Analytics - 他のPCでの使用方法

## 📋 必要な環境

### システム要件
- **Node.js**: v18以上 (推奨: v20)
- **Python**: v3.9以上 (推奨: v3.11)
- **Git**: 最新版
- **ブラウザ**: Chrome, Firefox, Safari, Edge

### 推奨スペック
- RAM: 4GB以上
- ストレージ: 2GB以上の空き容量
- インターネット接続 (Google Maps API使用時)

---

## 🛠️ セットアップ手順

### 1. リポジトリのクローン
```bash
git clone https://github.com/Shiki0138/mvt-analytics.git
cd mvt-analytics
```

### 2. バックエンドのセットアップ
```bash
cd backend

# Python仮想環境の作成（推奨）
python -m venv venv

# 仮想環境のアクティベート
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 依存関係のインストール
pip install -r requirements.txt

# データベースの初期化
python scripts/init_db.py
```

### 3. フロントエンドのセットアップ
```bash
cd ../frontend

# 依存関係のインストール
npm install

# 環境変数ファイルの設定
cp .env.example .env
```

### 4. 環境変数の設定
`frontend/.env` ファイルを編集：

```env
# Google Maps API設定
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here

# バックエンドAPI URL
VITE_API_URL=http://localhost:8000
```

**Google Maps APIキーの取得方法:**
1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを作成
3. 以下のAPIを有効化：
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. APIキーを作成してコピー

---

## 🚀 アプリケーションの起動

### ターミナル1: バックエンド起動
```bash
cd backend
# 仮想環境をアクティベート（まだの場合）
source venv/bin/activate  # Mac/Linux
# または
venv\Scripts\activate     # Windows

# サーバー起動
python main.py
```
✅ http://localhost:8000 で起動

### ターミナル2: フロントエンド起動
```bash
cd frontend
npm run dev
```
✅ http://localhost:8080 で起動

---

## 📱 アクセス方法

ブラウザで以下にアクセス：
**http://localhost:8080**

### 初回起動後の確認事項
1. ダッシュボードが表示される
2. プロジェクト作成ができる
3. 分析機能が利用できる
4. Google Maps（APIキー設定時）が動作する

---

## 🗂️ 主要機能の使い方

### 1. プロジェクト管理
- **新規作成**: ダッシュボードから「新しいプロジェクト」
- **編集**: プロジェクト一覧から対象を選択
- **削除**: プロジェクト詳細画面から削除

### 2. 市場分析
- **商圏設定**: 市区町村、郵便番号、半径、地図から選択
- **人口分析**: ターゲット層の詳細設定
- **競合分析**: 同業種店舗の自動検索・分析
- **需要予測**: 市場規模・成長率の予測

### 3. Google Maps機能
- **立地選択**: 地図上でクリック選択
- **競合マッピング**: 周辺店舗の可視化
- **商圏表示**: 設定半径の表示
- **ストリートビュー**: 現地確認

### 4. レポート機能
- **分析結果の保存**: PDF形式でエクスポート
- **データ共有**: 結果の共有・印刷

---

## 🔧 トラブルシューティング

### よくある問題と解決方法

#### 1. ポートが既に使用されている
```bash
# ポートを変更して起動
npm run dev -- --port 3000
```

#### 2. Google Mapsが表示されない
- `.env` ファイルのAPIキーを確認
- ブラウザの開発者ツールでエラーを確認
- APIキーの制限設定を確認

#### 3. データベースエラー
```bash
cd backend
python scripts/init_db.py
```

#### 4. 依存関係エラー
```bash
# フロントエンド
cd frontend
rm -rf node_modules package-lock.json
npm install

# バックエンド
cd backend
pip install -r requirements.txt --force-reinstall
```

#### 5. 権限エラー（Mac/Linux）
```bash
sudo chown -R $USER:$USER mvt-analytics/
```

---

## 🌐 ネットワーク接続での使用

### 同じネットワーク内の他デバイスからアクセス

1. **IPアドレスを確認**:
```bash
# Mac/Linux
ifconfig | grep inet
# Windows
ipconfig
```

2. **ファイアウォール設定**:
- ポート8000（バックエンド）を開放
- ポート8080（フロントエンド）を開放

3. **アクセス**:
`http://[IPアドレス]:8080`

---

## 📊 データバックアップ

### 重要なファイル
- `backend/mvt_analytics.db` - データベース
- `frontend/.env` - 環境設定
- `backend/exports/` - レポートファイル

### バックアップ方法
```bash
# データベースのコピー
cp backend/mvt_analytics.db backup/mvt_analytics_$(date +%Y%m%d).db

# 設定ファイルのコピー
cp frontend/.env backup/.env_backup
```

---

## 📞 サポート

### ヘルプが必要な場合
1. エラーメッセージをスクリーンショット
2. ブラウザの開発者ツール（F12）のConsoleを確認
3. 使用環境（OS、ブラウザ、Node.js版）を記録

### 最新バージョンの取得
```bash
git pull origin master
cd frontend && npm install
cd ../backend && pip install -r requirements.txt
```

---

## 🔄 アップデート手順

### 1. 現在の作業を保存
```bash
git stash  # 一時保存
```

### 2. 最新版を取得
```bash
git pull origin master
```

### 3. 依存関係を更新
```bash
cd frontend && npm install
cd ../backend && pip install -r requirements.txt
```

### 4. 作業を復元
```bash
git stash pop  # 一時保存を復元
```

---

## ✨ 完了！

これで他のPCでもMVT Analyticsを使用できます。
素晴らしい分析結果をお楽しみください！

---

**🔗 リポジトリ**: https://github.com/Shiki0138/mvt-analytics
**📧 質問・要望**: GitHubのIssuesをご利用ください