# 🗺️ Google Maps API 実装ガイド

## 💰 Google Maps API 料金体系

### **無料枠（毎月）**
| API | 無料利用枠 | 超過時料金 |
|-----|-----------|-----------|
| **Maps JavaScript API** | 28,000回 | $7.00/1,000回 |
| **Geocoding API** | 40,000回 | $5.00/1,000回 |
| **Places API** | 17,000回 | $17.00/1,000回 |
| **Directions API** | 40,000回 | $5.00/1,000回 |

### **MVT Analytics での使用予測**

#### 小規模利用（月100ユーザー）
```
Maps表示: 3,000回/月
住所検索: 500回/月  
競合検索: 300回/月
合計費用: $0/月 (無料枠内)
```

#### 中規模利用（月500ユーザー）
```
Maps表示: 15,000回/月
住所検索: 2,500回/月
競合検索: 1,500回/月
合計費用: $0/月 (無料枠内)
```

#### 大規模利用（月2000ユーザー）
```
Maps表示: 60,000回/月 → $224/月
住所検索: 10,000回/月 → $0/月 (無料枠内)
競合検索: 6,000回/月 → $0/月 (無料枠内)
合計費用: 約$224/月
```

## 🔑 API キー取得手順

### 1. Google Cloud Console セットアップ
```bash
1. https://console.cloud.google.com/ にアクセス
2. 新しいプロジェクト作成 または 既存プロジェクト選択
3. 「APIとサービス」→「ライブラリ」で以下APIを有効化：
   - Maps JavaScript API
   - Geocoding API  
   - Places API
   - Maps Static API
```

### 2. API キー作成
```bash
1. 「認証情報」→「認証情報を作成」→「APIキー」
2. キーを制限（セキュリティ強化）：
   - アプリケーションの制限: HTTPリファラー
   - APIの制限: 必要なAPIのみ
```

### 3. 環境変数設定
```bash
# .env ファイルに追加
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## 🚀 実装段階的アプローチ

### Phase 1: 基本マップ表示（無料）
```typescript
// 基本的なマップ表示のみ
- 地図表示
- 住所検索
- クリック位置取得
月間コスト: $0
```

### Phase 2: 競合分析機能（低コスト）
```typescript
// Places API 使用
- 競合店舗検索・表示
- 店舗詳細情報取得
- 評価・レビュー表示
月間コスト: $10-50
```

### Phase 3: 高度な分析機能（中コスト）
```typescript
// 複数API統合
- ヒートマップ表示
- ルート最適化
- リアルタイム交通情報
月間コスト: $50-200
```

## 📊 コスト最適化戦略

### 1. **キャッシュ戦略**
```typescript
// 結果をローカルストレージにキャッシュ
const cachedResults = localStorage.getItem(`geocoding_${address}`)
if (cachedResults) {
  return JSON.parse(cachedResults)
}
```

### 2. **バッチ処理**
```typescript
// 複数の住所を一度に処理
const batchGeocode = async (addresses: string[]) => {
  // 10件まとめて処理してAPI呼び出し削減
}
```

### 3. **使用量制限**
```typescript
// ユーザーあたりの日次制限
const dailyLimit = {
  mapLoads: 50,
  searches: 20,
  placeDetails: 10
}
```

## 🛠️ 実装準備

### 1. パッケージインストール
```bash
npm install @googlemaps/js-api-loader
npm install @types/google.maps
```

### 2. 環境変数設定
```bash
# frontend/.env
REACT_APP_GOOGLE_MAPS_API_KEY=your_actual_api_key
```

### 3. コンポーネント統合
```typescript
// Analysis.tsx に追加
import GoogleMapsComponent from '../components/GoogleMapsComponent'

<GoogleMapsComponent
  center={{ lat: 35.6762, lng: 139.6503 }}
  showCompetitors={true}
  showDemographics={true}
  projectData={analysisData}
/>
```

## 🎯 推奨実装ロードマップ

### 即座実装可能（無料）
- [x] GoogleMapsComponent 基盤コンポーネント作成
- [ ] 基本マップ表示
- [ ] 住所検索機能
- [ ] 位置選択機能

### 短期実装（月$10-50）
- [ ] 競合店舗検索・表示
- [ ] 商圏エリア描画
- [ ] 基本的な店舗情報表示

### 中期実装（月$50-200）  
- [ ] 人口統計ヒートマップ
- [ ] 交通アクセス分析
- [ ] リアルタイム混雑度

### 長期実装（月$200+）
- [ ] 高度な人口動態分析
- [ ] 経済指標マッピング
- [ ] 予測モデル統合

## 💡 代替・節約案

### 1. **OpenStreetMap 使用**
```typescript
// 無料の地図サービス
import { MapContainer, TileLayer } from 'react-leaflet'
// 基本的な地図表示は無料
```

### 2. **静的マップ使用**
```typescript
// Maps Static API（より安価）
const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?
  center=${lat},${lng}&zoom=13&size=600x400&key=${apiKey}`
```

### 3. **段階的有効化**
```typescript
// 必要な機能のみを段階的に有効化
const featureFlags = {
  mapsEnabled: true,     // 基本マップ
  placesEnabled: false,  // Places API
  routesEnabled: false   // Directions API
}
```

## 📈 収益性分析

### 投資対効果
```
初期投資: $0 (無料APIキー)
月間運用: $0-50 (小中規模)
機能価値: 分析精度30-50%向上
顧客満足度: 大幅向上

ROI: 無料～中程度の投資で大きなリターン
```

### 競合優位性
- 視覚的な立地分析
- データドリブンな出店判断
- ユーザー体験の大幅向上

## 🎯 まとめ・推奨事項

### **即座に始められます（無料）**
1. 基本的なマップ表示・住所検索
2. 月間28,000回まで完全無料
3. 小規模〜中規模利用なら追加費用なし

### **段階的にアップグレード**
1. 必要に応じて有料機能追加
2. 使用量をモニタリング
3. ROIを確認しながら機能拡張

**結論: 無料で始めて、価値が確認できたら段階的に投資するのがベストアプローチです！**