FROM python:3.11-slim

WORKDIR /app

# 最小限の依存関係
RUN pip install fastapi uvicorn

# アプリケーションファイル（相対パス明示）
COPY ./main.py .

# ポート設定
EXPOSE 8000

# 起動コマンド（Railwayに最適化）
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"] 