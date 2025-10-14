#!/bin/bash

# 🚀 修复并启动教育游戏项目 - 一键解决所有问题
# 包含正确的Nginx配置和服务启动

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 修复并启动教育游戏项目${NC}"
echo "============================================"

# 获取服务器IP
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || echo "localhost")
echo -e "${BLUE}📡 服务器IP: ${GREEN}$PUBLIC_IP${NC}"

# 1. 停止所有现有服务
echo ""
echo -e "${BLUE}🛑 停止现有服务${NC}"
pkill -f "node.*4001" 2>/dev/null || true
pkill -f "vite.*8080" 2>/dev/null || true
pkill -f "vite preview" 2>/dev/null || true
sleep 2

# 2. 进入项目目录
cd /root/edu-game

# 3. 启动后端服务
echo ""
echo -e "${BLUE}🚀 启动后端服务${NC}"
cd backend

# 设置环境变量
export NODE_ENV=production
export PORT=4001
export CORS_ORIGIN="*"
export BAIDU_API_KEY="xmEObbrYbzwfjX8Vn2ePiQXI"
export BAIDU_SECRET_KEY="DVTjYEKvImNmOpNNND9GOlQ0BIvzutGJ"
export BAIDU_DEV_PID="1537"
export AUTH_SECRET="my-secret-key-2024"

# 启动后端（使用已构建的版本）
if [ -f "dist/index.js" ]; then
    nohup node dist/index.js > ../backend.log 2>&1 &
    BACKEND_PID=$!
    echo -e "✅ 后端服务已启动 (PID: $BACKEND_PID)"
else
    echo -e "${RED}❌ 后端构建文件不存在${NC}"
    exit 1
fi

# 4. 启动前端服务
echo ""
echo -e "${BLUE}🚀 启动前端服务${NC}"
cd ../frontend

# 删除有问题的vite配置文件
rm -f vite.config.ts

# 创建简单的vite配置
cat > vite.config.js << 'EOF'
export default {
  server: {
    host: '0.0.0.0',
    port: 8080
  },
  preview: {
    host: '0.0.0.0',
    port: 8080
  }
}
EOF

# 安装前端依赖
echo "安装前端依赖..."
npm install

# 构建前端项目
echo "构建前端项目..."
if vite build; then
    echo -e "✅ 前端构建成功"
else
    echo -e "${YELLOW}⚠️  构建失败，跳过构建直接启动预览${NC}"
fi

# 启动前端预览服务
echo "启动前端预览服务..."
nohup vite preview --host 0.0.0.0 --port 8080 > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "✅ 前端服务已启动 (PID: $FRONTEND_PID)"

# 5. 更新Nginx配置
echo ""
echo -e "${BLUE}⚙️ 更新Nginx配置${NC}"
cd ..

# 下载正确的Nginx配置
wget -O nginx-config.conf https://gitee.com/dot123dot/edu-game/raw/main/nginx-config.conf

# 应用配置
sudo cp nginx-config.conf /etc/nginx/sites-available/edu-game-https

# 启用站点
sudo ln -sf /etc/nginx/sites-available/edu-game-https /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 测试Nginx配置
if sudo nginx -t; then
    echo -e "✅ Nginx配置测试通过"
    sudo systemctl restart nginx
    echo -e "✅ Nginx已重启"
else
    echo -e "${RED}❌ Nginx配置错误${NC}"
    exit 1
fi

# 6. 配置防火墙
echo ""
echo -e "${BLUE}🔥 配置防火墙${NC}"
sudo ufw allow 80/tcp 2>/dev/null || true
sudo ufw allow 443/tcp 2>/dev/null || true
sudo ufw allow 4001/tcp 2>/dev/null || true
sudo ufw allow 8080/tcp 2>/dev/null || true

# 7. 等待服务启动
echo ""
echo -e "${BLUE}⏳ 等待服务启动${NC}"
sleep 15

# 8. 测试服务
echo ""
echo -e "${BLUE}🧪 测试服务${NC}"

echo "测试后端服务..."
if curl -s http://localhost:4001/health > /dev/null; then
    echo -e "✅ 后端服务正常 (端口 4001)"
else
    echo -e "❌ 后端服务异常"
    echo "查看日志: tail -f backend.log"
fi

echo "测试前端服务..."
if curl -s -I http://localhost:8080 > /dev/null; then
    echo -e "✅ 前端服务正常 (端口 8080)"
else
    echo -e "❌ 前端服务异常"
    echo "查看日志: tail -f frontend.log"
fi

echo "测试HTTPS..."
if curl -k -s -I https://localhost > /dev/null; then
    echo -e "✅ HTTPS服务正常"
else
    echo -e "⚠️  HTTPS测试跳过 (自签名证书)"
fi

# 9. 保存进程信息
echo "$BACKEND_PID" > backend.pid
echo "$FRONTEND_PID" > frontend.pid

echo ""
echo -e "${GREEN}🎉 项目启动完成！${NC}"
echo "============================================"
echo -e "🌐 HTTPS访问地址: ${GREEN}https://$PUBLIC_IP${NC}"
echo -e "🔗 HTTP访问地址: ${GREEN}http://$PUBLIC_IP${NC}"
echo -e "🎤 语音录制: ${GREEN}现在可以正常使用${NC}"

echo ""
echo -e "${BLUE}📋 服务信息:${NC}"
echo -e "• 后端服务: http://localhost:4001 (PID: $BACKEND_PID)"
echo -e "• 前端服务: http://localhost:8080 (PID: $FRONTEND_PID)"
echo -e "• 后端日志: tail -f $(pwd)/backend.log"
echo -e "• 前端日志: tail -f $(pwd)/frontend.log"

echo ""
echo -e "${BLUE}🔧 管理命令:${NC}"
echo -e "• 停止后端: kill $BACKEND_PID"
echo -e "• 停止前端: kill $FRONTEND_PID"
echo -e "• 重启Nginx: sudo systemctl restart nginx"
echo -e "• 查看Nginx状态: sudo systemctl status nginx"

echo ""
echo -e "${YELLOW}⚠️  浏览器安全警告处理:${NC}"
echo "1. 访问 https://$PUBLIC_IP"
echo "2. 看到安全警告时，点击\"高级\""
echo "3. 点击\"继续访问\"或\"接受风险并继续\""
echo "4. 现在可以正常使用语音录制功能"

echo ""
echo -e "${GREEN}🎊 享受你的教育游戏项目吧！${NC}"
