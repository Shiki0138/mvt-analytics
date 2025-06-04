FROM python:3.11-slim

WORKDIR /app

# システム依存関係（最小限）
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Python依存関係
COPY requirements_minimal.txt .
RUN pip install --no-cache-dir -r requirements_minimal.txt

# アプリケーション
COPY . .

# ポート設定
EXPOSE 8000

# Railway用の軽量起動
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"] 