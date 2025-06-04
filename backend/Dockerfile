FROM python:3.11-alpine

WORKDIR /app

# 最小限の依存関係のみ
RUN apk add --no-cache postgresql-libs && \
    apk add --no-cache --virtual .build-deps gcc musl-dev postgresql-dev && \
    pip install --no-cache-dir fastapi uvicorn asyncpg sqlalchemy pydantic python-dotenv httpx && \
    apk --purge del .build-deps

# アプリケーションコード
COPY . .

# 環境変数
ENV PORT=8000

# 起動
CMD uvicorn main:app --host 0.0.0.0 --port $PORT 