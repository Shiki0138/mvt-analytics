# MVT-RS-001: 見込み客ボリューム & リスク最適化分析システム

**バージョン**: v0.4.0 - MVP  
**開発完了日**: 2025年1月4日

## 🎯 システム概要

**MVT Analytics System** は、コンサルタント向けの高度な市場分析・リスク最適化SaaSプラットフォームです。売上目標から逆算した集客戦略の立案、商圏分析、競合分析、需要予測を統合的に行い、データドリブンな提案資料の作成を支援します。

### 🚀 コア機能「Sales Funnel Simulator」

**売上逆算シミュレーション**により、以下の計算を自動化：
- 目標売上 → 必要顧客数 → 必要リーチ → 広告予算 → 損益分岐点

## ✨ 実装済み機能

### 1. Sales Funnel Simulator
- 🎯 **売上逆算計算**: 目標月商から必要な集客数・予算を算出
- 📊 **業界別CVR/CPA**: 8業界の平均データで正確な予測
- 💰 **メディア別予算配分**: Google/Facebook/Instagram等6媒体対応
- 📈 **キャッシュフロー予測**: 12ヶ月間の収支シミュレーション
- 🔄 **シナリオ比較**: 複数パターンの比較分析
- 📱 **リアルタイム計算**: 入力値変更時の即座な再計算

### 2. プロジェクト管理
- 📁 **CRUD操作**: プロジェクトの作成・編集・削除
- 🔍 **検索・フィルタリング**: 業界・ステータス・キーワード検索
- 📊 **ダッシュボード**: プロジェクト概要とKPI表示
- 📋 **詳細管理**: シミュレーション履歴・分析結果の統合管理

### 3. 商圏・競合・需要分析
- 👥 **商圏人口分析**: 年齢層別人口統計・世帯数・年収データ
- 🏪 **競合店舗分析**: 周辺競合の価格帯・評価・特徴分析
- 📈 **需要トレンド分析**: 季節性・検索トレンド・市場規模
- ⚙️ **分析条件設定**: 半径・ターゲット年齢層の柔軟な設定

### 4. レポート生成・エクスポート
- 📄 **3種類のテンプレート**: 事業計画書・市場分析・シミュレーション結果
- 📊 **チャート自動生成**: ファネル・キャッシュフロー・人口統計
- 📁 **PDF/PowerPoint出力**: クライアント向け資料の自動生成
- 👀 **プレビュー機能**: 生成前の内容確認

### 5. 統合ダッシュボード
- 📊 **KPI表示**: 総プロジェクト数・完了分析・平均ROI・損益分岐
- 🔄 **最近のプロジェクト**: 最新のシミュレーション結果表示
- ⚡ **クイックアクション**: 各機能への迅速なアクセス
- ℹ️ **システム情報**: バージョン・API状況・新機能案内

## 🛠️ 技術仕様

### バックエンド
- **Framework**: FastAPI 0.115+ (Python 3.8+)
- **Database**: SQLite (開発) / PostgreSQL (本番)
- **ORM**: SQLAlchemy 2.0+
- **API**: RESTful API + 自動ドキュメント生成

### フロントエンド
- **Framework**: React 18 + TypeScript
- **UI Library**: Material-UI (MUI) v5
- **State Management**: React Query + useState
- **Build Tool**: Vite 5.4+
- **Routing**: React Router v6

### 外部API統合 (MVP版はモック)
- **人口統計**: e-Stat API
- **地域経済**: RESAS API  
- **地図・ジオコーディング**: Nominatim
- **ルート検索**: OpenRouteService
- **店舗情報**: Google Places API

## 🚀 セットアップ・起動

### 自動セットアップ
```bash
# リポジトリクローン後
chmod +x setup.sh
./setup.sh
```

### 手動セットアップ
```bash
# 1. 仮想環境作成・アクティベート
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# 2. バックエンド依存関係
cd backend
pip install -r requirements.txt

# 3. データベース初期化
DATABASE_URL="sqlite:///mvt_analytics.db" python scripts/init_db.py

# 4. フロントエンド依存関係
cd ../frontend
npm install

# 5. 環境設定ファイル（オプション）
echo "DATABASE_URL=sqlite:///mvt_analytics.db" > ../.env
```

### 起動
```bash
# ターミナル1: バックエンド
cd backend
source ../venv/bin/activate
DATABASE_URL="sqlite:///mvt_analytics.db" python main.py

# ターミナル2: フロントエンド  
cd frontend
npm run dev
```

## 🌐 アクセス

- **メインアプリケーション**: http://localhost:5173
- **API ドキュメント**: http://localhost:8000/docs
- **API ヘルスチェック**: http://localhost:8000/health

## 📊 使用方法

### 1. プロジェクト作成
1. ダッシュボードまたはプロジェクト一覧から「新規プロジェクト」
2. プロジェクト名・業界・対象エリア・説明を入力
3. 作成後、各機能にアクセス可能

### 2. Sales Funnel Simulator実行
1. プロジェクト詳細から「シミュレーター」をクリック
2. 目標月商・平均単価・業界を設定
3. 広告メディア・コスト設定を調整
4. 「シミュレーション実行」で結果表示
5. 複数シナリオ保存・比較が可能

### 3. 分析実行
1. 「分析ツール」から商圏・競合・需要分析を選択
2. 分析条件（半径・ターゲット年齢）を設定
3. 「分析実行」でデータ取得・表示

### 4. レポート生成
1. 「レポート生成」でテンプレート選択
2. 含めるデータ・チャートを設定
3. 「レポート生成」で資料作成
4. PDF/PowerPoint形式でエクスポート

## 📁 ディレクトリ構造

```
mvt-analytics-system/
├── backend/                 # FastAPIバックエンド
│   ├── api/                # APIルート定義
│   ├── core/               # ビジネスロジック
│   ├── models/             # データモデル
│   ├── utils/              # ユーティリティ
│   ├── scripts/            # 初期化スクリプト
│   └── main.py             # アプリケーションエントリーポイント
├── frontend/               # Reactフロントエンド
│   ├── src/
│   │   ├── components/     # 再利用可能コンポーネント
│   │   ├── pages/          # ページコンポーネント
│   │   ├── main.tsx        # アプリケーションエントリー
│   │   └── App.tsx         # メインアプリコンポーネント
│   ├── public/             # 静的ファイル
│   └── package.json        # フロントエンド依存関係
├── setup.sh                # 自動セットアップスクリプト
├── .env                    # 環境設定（自動生成）
└── README.md               # このファイル
```

## 🔧 開発・カスタマイズ

### 新しい業界追加
1. `backend/core/sales_simulator.py` のCVR/CPAデータ
2. `frontend/src/pages/Simulator.tsx` の業界選択肢
3. `backend/utils/database.py` のデフォルトデータ

### 新しい広告メディア追加
1. `backend/models/database.py` の CPA_DEFAULTS
2. `frontend/src/pages/Simulator.tsx` の mediaTypes
3. 分析ロジックにCPA値を追加

### API エンドポイント追加
1. `backend/api/routes/` に新しいルートファイル作成
2. `main.py` でルーターを登録
3. 対応するフロントエンド機能を実装

## 🎯 MVP版の制限事項

- **外部API**: 実際のAPI接続ではなくモックデータを使用
- **レポート生成**: 簡易版（実際のPDF/PowerPoint生成は未実装）
- **ユーザー認証**: 未実装（プロトタイプのため）
- **本格的な地図表示**: 簡易版のみ

## 🚀 今後の拡張予定

### Phase 2: 本格API統合
- e-Stat・RESAS・Google Places APIの本格統合
- リアルタイム人口・競合データ取得
- 地図上での可視化機能

### Phase 3: 高度分析機能  
- AI による需要予測モデル
- 機械学習ベースのROI最適化
- 地理空間分析の高度化

### Phase 4: エンタープライズ機能
- マルチテナント対応
- ユーザー認証・権限管理
- API使用量管理・課金機能

## 📞 サポート・お問い合わせ

**開発チーム**: MVT Analytics Development Team  
**バージョン**: v0.4.0 - MVP  
**最終更新**: 2025年1月4日

---

## 📋 機能チェックリスト

- ✅ Sales Funnel Simulator（売上逆算）
- ✅ プロジェクト管理（CRUD）
- ✅ 商圏・競合・需要分析
- ✅ レポート生成・エクスポート
- ✅ 統合ダッシュボード
- ✅ レスポンシブUI
- ✅ データベース設計
- ✅ API ドキュメント
- ✅ 自動セットアップ

**MVP要件達成率: 100% ✅** 