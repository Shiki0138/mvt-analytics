# Build stage
FROM node:20-slim as builder

WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
RUN npm install

# アプリケーションビルド
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# ビルド済みファイルをコピー
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx設定
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ポート設定
EXPOSE 80

# Nginx起動
CMD sed -i -e 's/$PORT/'"$PORT"'/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;' 