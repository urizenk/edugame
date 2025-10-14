#!/bin/bash

# 颜色代码
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}🔄 重新构建并启动项目${NC}"
echo "=================================="

# 0. 切换到项目根目录
cd "$(dirname "$0")"

# 1. 拉取最新代码
echo ""
echo -e "${BLUE}📥 拉取最新代码...${NC}"
git pull origin main || git pull origin master

# 2. 停止所有服务
echo ""
echo -e "${BLUE}🛑 停止现有服务...${NC}"
pkill -f "node dist/index.js"
pkill -f "vite preview"
pkill -f "npm run preview"
sleep 2

# 3. 重新构建后端
echo ""
echo -e "${BLUE}🏗️  重新构建后端...${NC}"
cd backend
rm -rf node_modules package-lock.json
npm install
npm run build
cd ..

# 4. 启动后端服务
echo ""
echo -e "${BLUE}🚀 启动后端服务...${NC}"
cd backend
export NODE_ENV=production
export PORT=4001
export CORS_ORIGIN="*"
export BAIDU_API_KEY="${BAIDU_API_KEY:-xmEObbrYbzwfjX8Vn2ePiQXI}"
export BAIDU_SECRET_KEY="${BAIDU_SECRET_KEY:-DVTjYEKvImNmOpNNND9GOlQ0BIvzutGJ}"
export BAIDU_DEV_PID="${BAIDU_DEV_PID:-1537}"
export AUTH_SECRET="${AUTH_SECRET:-my-secret-key-2024}"

nohup node dist/index.js > ../backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✅ 后端服务已启动 (PID: $BACKEND_PID)${NC}"
cd ..

# 5. 重新构建前端
echo ""
echo -e "${BLUE}🏗️  重新构建前端...${NC}"
cd frontend
rm -rf node_modules package-lock.json
npm config set save-dev true
npm install
npm run build
cd ..

# 6. 启动前端服务
echo ""
echo -e "${BLUE}🚀 启动前端服务...${NC}"
cd frontend
nohup npm run preview -- --host 0.0.0.0 --port 8080 > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✅ 前端服务已启动 (PID: $FRONTEND_PID)${NC}"
cd ..

# 7. 配置Nginx（如果需要HTTPS）
echo ""
echo -e "${BLUE}⚙️  配置Nginx...${NC}"

# 检查Nginx配置文件
if [ -f "nginx-config.conf" ]; then
    sudo cp nginx-config.conf /etc/nginx/sites-available/edu-game.conf
    sudo ln -sf /etc/nginx/sites-available/edu-game.conf /etc/nginx/sites-enabled/edu-game.conf
    
    # 删除默认配置
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # 测试并重启Nginx
    sudo nginx -t && sudo systemctl restart nginx
    echo -e "${GREEN}✅ Nginx配置已更新${NC}"
else
    echo -e "${YELLOW}⚠️  未找到nginx-config.conf，跳过Nginx配置${NC}"
fi

# 8. 配置防火墙
echo ""
echo -e "${BLUE}🔥 配置防火墙...${NC}"
sudo ufw allow 8080/tcp 2>/dev/null || true
sudo ufw allow 4001/tcp 2>/dev/null || true
sudo ufw allow 443/tcp 2>/dev/null || true
sudo ufw allow 80/tcp 2>/dev/null || true

# 9. 等待服务启动
echo ""
echo -e "${BLUE}⏳ 等待服务启动...${NC}"
sleep 10

# 10. 测试服务
echo ""
echo -e "${BLUE}🧪 测试服务...${NC}"
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || echo "localhost")

echo "测试后端健康检查..."
if curl -s http://localhost:4001/health > /dev/null; then
    echo -e "${GREEN}✅ 后端服务正常${NC}"
else
    echo -e "${RED}❌ 后端服务异常${NC}"
    echo "后端日志："
    tail -n 20 backend.log
fi

echo ""
echo "测试前端服务..."
if curl -s http://localhost:8080 > /dev/null; then
    echo -e "${GREEN}✅ 前端服务正常${NC}"
else
    echo -e "${RED}❌ 前端服务异常${NC}"
    echo "前端日志："
    tail -n 20 frontend.log
fi

# 11. 完成
echo ""
echo -e "${GREEN}🎉 重新部署完成！${NC}"
echo "=================================="
echo -e "🌐 访问地址:"
echo -e "   • HTTPS: ${BLUE}https://$PUBLIC_IP${NC}"
echo -e "   • HTTP:  ${BLUE}http://$PUBLIC_IP:8080${NC}"
echo ""
echo -e "📊 服务状态:"
echo -e "   • 后端PID: $BACKEND_PID (端口 4001)"
echo -e "   • 前端PID: $FRONTEND_PID (端口 8080)"
echo ""
echo -e "📋 管理命令:"
echo "   • 查看后端日志: tail -f backend.log"
echo "   • 查看前端日志: tail -f frontend.log"
echo "   • 查看Nginx日志: tail -f /var/log/nginx/error.log"
echo "   • 重启Nginx: systemctl restart nginx"
echo ""
echo -e "${YELLOW}⚠️  注意：如果使用HTTPS访问，浏览器会提示不安全（自签名证书），点击「继续访问」即可${NC}"

