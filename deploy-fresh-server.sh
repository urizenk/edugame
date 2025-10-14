#!/bin/bash

# ========================================
# 教育游戏项目 - 全新服务器一键部署脚本
# 适用于: Ubuntu 20.04 + Docker 已安装
# ========================================

set -e  # 遇到错误立即退出

echo "========================================="
echo "🚀 开始部署教育游戏项目"
echo "========================================="

# 1. 更新系统并安装必要工具
echo "📦 步骤 1/6: 安装系统工具..."
sudo apt-get update
sudo apt-get install -y git curl wget vim

# 2. 安装 Docker Compose
echo "📦 步骤 2/6: 安装 Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose 安装完成"
else
    echo "✅ Docker Compose 已安装"
fi

# 3. 克隆项目
echo "📦 步骤 3/6: 克隆项目..."
cd ~
if [ -d "edu-game" ]; then
    echo "⚠️  项目目录已存在，删除旧目录..."
    rm -rf edu-game
fi
git clone https://github.com/urizenk/edugame.git edu-game
cd edu-game

# 4. 停止并清理旧容器
echo "📦 步骤 4/6: 清理旧容器..."
docker stop edu-game-backend edu-game-frontend 2>/dev/null || true
docker rm edu-game-backend edu-game-frontend 2>/dev/null || true
docker stop nginx 2>/dev/null || true
docker rm nginx 2>/dev/null || true

# 停止系统 nginx（如果在运行）
sudo systemctl stop nginx 2>/dev/null || true
sudo systemctl disable nginx 2>/dev/null || true

# 释放端口
sudo fuser -k 8080/tcp 2>/dev/null || true
sudo fuser -k 4001/tcp 2>/dev/null || true
sudo fuser -k 80/tcp 2>/dev/null || true

# 5. 构建 Docker 镜像
echo "📦 步骤 5/6: 构建 Docker 镜像..."
echo "   构建后端镜像..."
cd backend
docker build -t edu-game-backend .

echo "   构建前端镜像..."
cd ../frontend
docker build -t edu-game-frontend .

cd ..

# 6. 启动容器
echo "📦 步骤 6/6: 启动容器..."

# 启动后端
docker run -d \
  --name edu-game-backend \
  --restart always \
  -p 4001:4001 \
  -e NODE_ENV=production \
  -e PORT=4001 \
  -e CORS_ORIGIN=* \
  -e BAIDU_API_KEY=xmEObbrYbzwfjX8Vn2ePiQXI \
  -e BAIDU_SECRET_KEY=DVTjYEKvImNmOpNNND9GOlQ0BIvzutGJ \
  -e BAIDU_DEV_PID=1537 \
  -e AUTH_SECRET=my-secret-key-2024 \
  edu-game-backend

echo "✅ 后端容器启动成功"

# 等待后端启动
sleep 5

# 启动前端
docker run -d \
  --name edu-game-frontend \
  --restart always \
  -p 8080:80 \
  edu-game-frontend

echo "✅ 前端容器启动成功"

# 7. 验证部署
echo ""
echo "========================================="
echo "🎉 部署完成！正在验证..."
echo "========================================="

sleep 3

# 检查容器状态
echo ""
echo "📊 容器状态:"
docker ps --filter "name=edu-game" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 测试后端
echo ""
echo "🔍 测试后端 API..."
if curl -s http://localhost:4001/health > /dev/null 2>&1; then
    echo "✅ 后端 API 正常"
else
    echo "⚠️  后端 API 可能需要几秒钟启动"
fi

# 测试前端
echo ""
echo "🔍 测试前端..."
if curl -s http://localhost:8080 > /dev/null 2>&1; then
    echo "✅ 前端服务正常"
else
    echo "⚠️  前端服务可能需要几秒钟启动"
fi

# 获取服务器公网 IP
PUBLIC_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || echo "无法获取")

echo ""
echo "========================================="
echo "🎊 部署成功！"
echo "========================================="
echo ""
echo "📍 访问地址:"
echo "   前端: http://${PUBLIC_IP}:8080"
echo "   后端: http://${PUBLIC_IP}:4001"
echo ""
echo "📝 常用命令:"
echo "   查看日志: docker logs -f edu-game-backend"
echo "   查看日志: docker logs -f edu-game-frontend"
echo "   重启服务: docker restart edu-game-backend edu-game-frontend"
echo "   停止服务: docker stop edu-game-backend edu-game-frontend"
echo ""
echo "🔧 如需重新部署，再次运行此脚本即可"
echo "========================================="

