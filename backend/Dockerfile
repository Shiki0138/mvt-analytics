FROM python:3.11-slim

# ワーキングディレクトリ
WORKDIR /app

# システム依存関係（最小限のみ）
RUN apt-get update && apt-get install -y \
    libpq5 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Python依存関係を先にコピー・インストール（レイヤーキャッシュ最適化）
COPY requirements_minimal.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements_minimal.txt

# アプリケーションファイル
COPY . .

# Railway用のポート設定
ENV PORT=8000
EXPOSE $PORT

# Railway用の起動コマンド
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port $PORT"] 