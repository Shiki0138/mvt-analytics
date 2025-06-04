FROM python:3.11-slim

# システム依存関係（最小限）
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# ワーキングディレクトリ
WORKDIR /app

# Python依存関係
COPY requirements_minimal.txt .
RUN pip install --no-cache-dir -r requirements_minimal.txt

# アプリケーションファイル
COPY . .

# Railway用のポート設定（動的）
ENV PORT=8000
EXPOSE $PORT

# Railway用の軽量起動
CMD uvicorn main:app --host 0.0.0.0 --port $PORT 