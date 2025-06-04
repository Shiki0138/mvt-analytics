# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
RUN npm ci --only=production

# アプリケーションビルド
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# ビルド済みファイルをコピー
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx設定
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ポート設定
EXPOSE 80

# Nginx起動
CMD ["nginx", "-g", "daemon off;"] 