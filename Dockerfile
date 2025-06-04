FROM python:3.11-slim

WORKDIR /app

# 必要なパッケージをインストール
RUN pip install fastapi uvicorn

# アプリケーションファイルをコピー
COPY backend/main.py /app/main.py

# ポート設定
EXPOSE 8000

# 明示的な起動コマンド
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"] 