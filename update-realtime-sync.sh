#!/bin/bash

# 实时同步功能更新脚本
# 说明：本脚本用于更新项目并启用Socket.IO实时同步功能

set -e  # 遇到错误立即退出

echo "=========================================="
echo "🔄 开始更新实时同步功能"
echo "=========================================="

# 进入项目目录
cd ~/edu-game

# 1. 拉取最新代码
echo "📥 拉取最新代码..."
git pull

# 2. 停止现有服务
echo "🛑 停止现有服务..."
docker stop edu-game-backend edu-game-frontend 2>/dev/null || true
docker rm edu-game-backend edu-game-frontend 2>/dev/null || true
pkill -f "vite preview" || true
pkill -f "node.*backend" || true

# 3. 构建后端
echo "🔨 构建后端..."
cd ~/edu-game/backend
npm install
npm run build

# 4. 启动后端（直接启动，不用Docker，方便调试）
echo "🚀 启动后端服务..."
nohup node dist/index.js > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "后端进程 PID: $BACKEND_PID"

# 等待后端启动
sleep 3

# 5. 构建前端
echo "🔨 构建前端..."
cd ~/edu-game/frontend

# 确保生产环境配置正确
npm config set production false
npm config set save-dev true

# 安装依赖
npm install

# 构建
npm run build

# 6. 启动前端
echo "🚀 启动前端服务..."
pkill -f "vite preview" || true
nohup npx vite preview --host 0.0.0.0 --port 8080 > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "前端进程 PID: $FRONTEND_PID"

# 7. 检查服务状态
sleep 2
echo ""
echo "=========================================="
echo "✅ 服务启动完成！"
echo "=========================================="
echo ""
echo "📊 服务状态："
echo "  后端端口 4001: $(netstat -tulpn 2>/dev/null | grep :4001 | wc -l) 个进程"
echo "  前端端口 8080: $(netstat -tulpn 2>/dev/null | grep :8080 | wc -l) 个进程"
echo ""
echo "🌐 访问地址："
echo "  前端: http://$(curl -s ifconfig.me):8080"
echo "  后端: http://$(curl -s ifconfig.me):4001"
echo ""
echo "📝 日志文件："
echo "  后端日志: ~/edu-game/backend.log"
echo "  前端日志: ~/edu-game/frontend.log"
echo ""
echo "💡 查看实时日志："
echo "  后端: tail -f ~/edu-game/backend.log"
echo "  前端: tail -f ~/edu-game/frontend.log"
echo ""
echo "🔄 实时同步功能已启用："
echo "  ✓ Socket.IO 实时推送"
echo "  ✓ 多客户端自动同步"
echo "  ✓ 平板和一体机同步显示"
echo ""
echo "=========================================="

