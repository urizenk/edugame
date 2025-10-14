#!/bin/bash

# 🚀 不使用Docker启动教育游戏项目
# 直接在系统上运行Node.js服务

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 启动教育游戏项目 (不使用Docker)${NC}"
echo "============================================"

# 获取服务器IP
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || echo "localhost")
echo -e "${BLUE}📡 服务器IP: ${GREEN}$PUBLIC_IP${NC}"

# 1. 检查Node.js和npm
echo ""
echo -e "${BLUE}📦 检查Node.js环境${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}安装Node.js...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    apt-get install -y nodejs
fi

NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
echo -e "✅ Node.js: ${GREEN}$NODE_VERSION${NC}"
echo -e "✅ npm: ${GREEN}$NPM_VERSION${NC}"

# 2. 克隆或更新项目
echo ""
echo -e "${BLUE}📁 准备项目代码${NC}"
if [ ! -d "edu-game" ]; then
    echo "克隆项目..."
    git clone https://gitee.com/dot123dot/edu-game.git
fi

cd edu-game

# 3. 停止可能运行的服务
echo ""
echo -e "${BLUE}🛑 停止现有服务${NC}"
pkill -f "node.*4001" 2>/dev/null || true
pkill -f "vite.*4173" 2>/dev/null || true
sleep 2

# 4. 安装和构建后端
echo ""
echo -e "${BLUE}🔨 构建后端服务${NC}"
cd backend

# 安装依赖
echo "安装后端依赖..."
npm install

# 构建项目
echo "构建后端项目..."
npm run build

# 5. 启动后端服务
echo ""
echo -e "${BLUE}🚀 启动后端服务${NC}"
export NODE_ENV=production
export PORT=4001
export CORS_ORIGIN="*"
export BAIDU_API_KEY="xmEObbrYbzwfjX8Vn2ePiQXI"
export BAIDU_SECRET_KEY="DVTjYEKvImNmOpNNND9GOlQ0BIvzutGJ"
export BAIDU_DEV_PID="1537"
export AUTH_SECRET="my-secret-key-2024"

# 使用nohup在后台启动后端
nohup npm start > ../backend.log 2>&1 &
BACKEND_PID=$!
echo -e "✅ 后端服务已启动 (PID: $BACKEND_PID)"

# 6. 安装和构建前端
echo ""
echo -e "${BLUE}🔨 构建前端服务${NC}"
cd ../frontend

# 安装依赖
echo "安装前端依赖..."
npm install

# 构建项目
echo "构建前端项目..."
npm run build

# 7. 启动前端服务
echo ""
echo -e "${BLUE}🚀 启动前端服务${NC}"
export VITE_API_BASE_URL="https://$PUBLIC_IP/api/"

# 使用nohup在后台启动前端
nohup npm run preview -- --host 0.0.0.0 --port 4173 > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "✅ 前端服务已启动 (PID: $FRONTEND_PID)"

# 8. 等待服务启动
echo ""
echo -e "${BLUE}⏳ 等待服务启动${NC}"
sleep 10

# 9. 测试服务
echo ""
echo -e "${BLUE}🧪 测试服务${NC}"
cd ..

echo "测试后端服务..."
if curl -s http://localhost:4001/health > /dev/null; then
    echo -e "✅ 后端服务正常 (端口 4001)"
else
    echo -e "❌ 后端服务异常"
    echo "查看后端日志: tail -f backend.log"
fi

echo "测试前端服务..."
if curl -s -I http://localhost:4173 > /dev/null; then
    echo -e "✅ 前端服务正常 (端口 4173)"
else
    echo -e "❌ 前端服务异常"
    echo "查看前端日志: tail -f frontend.log"
fi

# 10. 保存PID文件
echo "$BACKEND_PID" > backend.pid
echo "$FRONTEND_PID" > frontend.pid

echo ""
echo -e "${GREEN}🎉 服务启动完成！${NC}"
echo "============================================"
echo -e "🌐 HTTPS访问地址: ${GREEN}https://$PUBLIC_IP${NC}"
echo -e "🔗 HTTP访问地址: ${GREEN}http://$PUBLIC_IP${NC}"
echo -e "🎤 语音录制: ${GREEN}现在可以正常使用${NC}"

echo ""
echo -e "${BLUE}📋 服务信息:${NC}"
echo -e "• 后端服务: http://localhost:4001 (PID: $BACKEND_PID)"
echo -e "• 前端服务: http://localhost:4173 (PID: $FRONTEND_PID)"
echo -e "• 后端日志: tail -f $(pwd)/backend.log"
echo -e "• 前端日志: tail -f $(pwd)/frontend.log"

echo ""
echo -e "${BLUE}🔧 管理命令:${NC}"
echo -e "• 停止后端: kill $BACKEND_PID"
echo -e "• 停止前端: kill $FRONTEND_PID"
echo -e "• 停止所有: pkill -f 'node.*4001'; pkill -f 'vite.*4173'"
echo -e "• 重启服务: ./start-without-docker.sh"

echo ""
echo -e "${GREEN}✅ 现在可以通过HTTPS访问并测试语音录制功能了！${NC}"
