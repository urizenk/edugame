#!/bin/bash

# ========================================
# 服务器诊断和修复脚本
# ========================================

echo "🔍 开始诊断服务器问题..."
echo "========================================="

# 1. 检查容器状态
echo "📊 检查容器状态:"
docker ps -a

echo ""
echo "📊 检查容器日志:"
echo "--- 后端日志 ---"
docker logs --tail 20 edu-game-backend 2>/dev/null || echo "后端容器不存在"

echo ""
echo "--- 前端日志 ---"
docker logs --tail 20 edu-game-frontend 2>/dev/null || echo "前端容器不存在"

echo ""
echo "🔍 检查端口占用:"
sudo netstat -tlnp | grep -E ':(8080|4001|80)\s'

echo ""
echo "🔍 检查防火墙状态:"
sudo ufw status

echo ""
echo "🔍 检查系统服务:"
sudo systemctl status nginx 2>/dev/null || echo "Nginx 未安装"
sudo systemctl status apache2 2>/dev/null || echo "Apache 未安装"

echo ""
echo "🔍 测试本地连接:"
curl -I http://localhost:8080 2>/dev/null || echo "本地8080端口无响应"
curl -I http://localhost:4001 2>/dev/null || echo "本地4001端口无响应"

echo ""
echo "========================================="
echo "🛠️  开始修复..."
echo "========================================="

# 停止所有可能冲突的服务
echo "🛑 停止冲突服务..."
sudo systemctl stop nginx 2>/dev/null || true
sudo systemctl stop apache2 2>/dev/null || true

# 停止旧容器
echo "🛑 停止旧容器..."
docker stop edu-game-backend edu-game-frontend 2>/dev/null || true
docker rm edu-game-backend edu-game-frontend 2>/dev/null || true

# 释放端口
echo "🛑 释放端口..."
sudo fuser -k 8080/tcp 2>/dev/null || true
sudo fuser -k 4001/tcp 2>/dev/null || true
sudo fuser -k 80/tcp 2>/dev/null || true

# 重新启动容器
echo "🚀 重新启动容器..."

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

echo "✅ 后端容器启动"

# 等待后端启动
sleep 5

# 启动前端
docker run -d \
  --name edu-game-frontend \
  --restart always \
  -p 8080:80 \
  edu-game-frontend

echo "✅ 前端容器启动"

# 配置防火墙
echo "🔧 配置防火墙..."
sudo ufw allow 8080/tcp
sudo ufw allow 4001/tcp

echo ""
echo "⏳ 等待服务启动..."
sleep 10

echo ""
echo "🔍 最终检查:"
docker ps --filter "name=edu-game"

echo ""
echo "🌐 测试连接:"
curl -I http://localhost:8080 && echo "✅ 前端正常" || echo "❌ 前端异常"
curl -I http://localhost:4001/health && echo "✅ 后端正常" || echo "❌ 后端异常"

# 获取公网IP
PUBLIC_IP=$(curl -s ifconfig.me || curl -s icanhazip.com)
echo ""
echo "🎉 修复完成！访问地址："
echo "   前端: http://${PUBLIC_IP}:8080"
echo "   后端: http://${PUBLIC_IP}:4001"
