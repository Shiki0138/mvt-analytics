FROM tiangolo/uvicorn-gunicorn-fastapi:python3.11-slim

WORKDIR /app

# アプリケーションファイル
COPY ./main.py /app/

# FastAPIが事前インストール済みなので追加設定不要
# ポートはGunicornが自動設定 