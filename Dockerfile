FROM tiangolo/uvicorn-gunicorn-fastapi:python3.11-slim

WORKDIR /app

# バックエンドのmain.pyをコピー
COPY backend/main.py /app/main.py

# 環境変数設定
ENV MODULE_NAME=main
ENV VARIABLE_NAME=app
ENV PORT=8000 