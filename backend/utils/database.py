from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
from typing import Generator
import asyncio

from utils.config import get_settings
from models.database import Base, CPABenchmark, DEFAULT_CPA_DATA

settings = get_settings()

# SQLAlchemy Engine作成
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_recycle=300
)

# セッションファクトリー
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    """
    データベースセッション取得（FastAPI Dependency）
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def init_db():
    """
    データベース初期化
    テーブル作成とデフォルトデータの投入
    """
    try:
        # テーブル作成
        Base.metadata.create_all(bind=engine)
        
        # デフォルトCPA/CVRデータの投入
        db = SessionLocal()
        try:
            # 既存データがない場合のみ投入
            existing_benchmarks = db.query(CPABenchmark).count()
            if existing_benchmarks == 0:
                for data in DEFAULT_CPA_DATA:
                    benchmark = CPABenchmark(
                        industry=data["industry"],
                        media_type=data["media_type"],
                        average_cpa=data["average_cpa"],
                        median_cpa=data["median_cpa"],
                        average_cvr=data["average_cvr"],
                        data_source="internal_default"
                    )
                    db.add(benchmark)
                
                db.commit()
                print("✅ デフォルトCPA/CVRデータを投入しました")
            else:
                print("✅ CPA/CVRデータは既に存在します")
                
        except Exception as e:
            db.rollback()
            print(f"❌ CPA/CVRデータ投入エラー: {e}")
        finally:
            db.close()
            
        print("✅ データベース初期化完了")
        
    except Exception as e:
        print(f"❌ データベース初期化エラー: {e}")
        raise

def create_sample_project():
    """
    サンプルプロジェクトデータの作成（開発・テスト用）
    """
    from models.database import Project
    
    db = SessionLocal()
    try:
        # 既存サンプルプロジェクトチェック
        existing_sample = db.query(Project).filter(Project.name == "サンプル美容室").first()
        if existing_sample:
            return existing_sample.id
        
        # サンプルプロジェクト作成
        sample_project = Project(
            name="サンプル美容室",
            description="新規開業する美容室の商圏分析とシミュレーション",
            industry_type="beauty",
            target_area="東京都渋谷区代々木1-1-1"
        )
        
        db.add(sample_project)
        db.commit()
        db.refresh(sample_project)
        
        print(f"✅ サンプルプロジェクト作成完了: {sample_project.id}")
        return sample_project.id
        
    except Exception as e:
        db.rollback()
        print(f"❌ サンプルプロジェクト作成エラー: {e}")
        return None
    finally:
        db.close()

def reset_database():
    """
    データベースリセット（開発用）
    """
    try:
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        print("✅ データベースリセット完了")
    except Exception as e:
        print(f"❌ データベースリセットエラー: {e}")
        raise

if __name__ == "__main__":
    # 直接実行時はデータベース初期化
    asyncio.run(init_db())
    create_sample_project() 