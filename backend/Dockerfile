FROM tiangolo/uvicorn-gunicorn-fastapi:python3.11-slim

WORKDIR /app

# 依存関係をコピーしてインストール
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションファイルをコピー
COPY main.py /app/

# ポート8000で実行
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"] 