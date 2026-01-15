# 多阶段构建
# 阶段1: 构建
FROM node:18-alpine AS build
WORKDIR /app

# 复制package.json并安装依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制源代码并构建
COPY . .
RUN npm run build

# 阶段2: 运行
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# 删除默认的nginx静态文件
RUN rm -rf ./*

# 复制构建产物
COPY --from=build /app/dist .

# 复制nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
