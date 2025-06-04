#!/usr/bin/env python3
"""
データベース初期化スクリプト
"""

import sys
import os
import asyncio

# Add the parent directory to the Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from utils.database import init_db, create_sample_project

async def main():
    """メイン初期化処理"""
    print("🚀 MVT Analytics System データベース初期化を開始します...")
    
    try:
        # データベース初期化
        await init_db()
        
        # サンプルプロジェクト作成
        sample_project_id = create_sample_project()
        if sample_project_id:
            print(f"📝 サンプルプロジェクトを作成しました: {sample_project_id}")
        
        print("✅ データベース初期化が完了しました！")
        print("\n次のステップ:")
        print("1. バックエンド起動: cd backend && python main.py")
        print("2. フロントエンド起動: cd frontend && npm run dev")
        print("3. ブラウザでアクセス: http://localhost:5173")
        
    except Exception as e:
        print(f"❌ 初期化エラー: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main()) 