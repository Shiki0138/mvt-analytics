FROM python:3.11-slim

WORKDIR /app

# 依存関係をコピーしてインストール
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコードをコピー
COPY backend/main.py .

# ポート8000で実行
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"] 