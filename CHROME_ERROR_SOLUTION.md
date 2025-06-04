# 🔧 Chrome拡張機能エラー対処法

## 🚨 **エラー内容**
```
Unchecked runtime.lastError: The message port closed before a response was received
```

## 🔍 **原因分析**
- **Chrome拡張機能**（AdBlocker、翻訳ツール、Developerツール等）の通信エラー
- Railwayドメインでの拡張機能競合
- **重要**: アプリケーション動作には影響しません

## ✅ **解決方法**

### **方法1: シークレットモードでテスト** ⭐ **推奨**
1. `Ctrl+Shift+N` (Mac: `Cmd+Shift+N`) でシークレットウィンドウを開く
2. https://mvt-analytics-production.up.railway.app/ にアクセス
3. エラーが消えることを確認

### **方法2: 拡張機能を一時無効化**
1. Chrome設定 → 拡張機能
2. 以下を一時無効化:
   - 翻訳ツール
   - AdBlocker
   - その他のコンテンツ修正拡張機能
3. ページをリロード

### **方法3: ローカル開発環境を使用** ⭐ **推奨**
```bash
./start_dev.sh
```
- フロントエンド: http://localhost:5173/
- 拡張機能の影響を受けにくい

## 📊 **エラーの重要度**

| エラータイプ | 重要度 | 影響 | 対応必要性 |
|------------|--------|------|-----------|
| Chrome拡張機能 | 🟨 低 | 見た目のみ | 任意 |
| Railway API | 🟢 正常 | なし | 不要 |
| ローカル開発 | 🟡 中 | 開発効率 | 要対応 |

## 🎯 **推奨アクション**

1. **今すぐ**: シークレットモードでRailway APIを確認
2. **開発用**: `./start_dev.sh` でローカル環境を使用
3. **本番用**: Vercelでフロントエンドデプロイ（次フェーズ）

**💡 Chrome拡張機能エラーは無視して問題ありません！** 