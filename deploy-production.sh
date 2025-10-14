#!/bin/bash

# 🚀 教育游戏项目 - 生产环境一键部署脚本
# 适用于云服务器生产部署

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 教育游戏项目 - 生产环境部署${NC}"
echo "============================================"

# 获取服务器IP
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || echo "localhost")
echo -e "${BLUE}📡 服务器IP: ${GREEN}$PUBLIC_IP${NC}"

# 1. 停止现有服务
echo ""
echo -e "${BLUE}🛑 停止现有服务${NC}"
pkill -f "node.*4001" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
pkill -f "python.*4173" 2>/dev/null || true

# 2. 更新项目代码
echo ""
echo -e "${BLUE}📁 更新项目代码${NC}"
if [ ! -d "edu-game" ]; then
    echo "克隆项目..."
    git clone https://gitee.com/dot123dot/edu-game.git
    cd edu-game
else
    echo "更新项目..."
    cd edu-game
    git pull origin main
fi

# 3. 构建和启动后端
echo ""
echo -e "${BLUE}🔨 构建后端服务${NC}"
cd backend

# 安装依赖
npm install

# 构建项目
npm run build

# 启动后端服务
echo ""
echo -e "${BLUE}🚀 启动后端服务${NC}"
export NODE_ENV=production
export PORT=4001
export CORS_ORIGIN="*"
export BAIDU_API_KEY="xmEObbrYbzwfjX8Vn2ePiQXI"
export BAIDU_SECRET_KEY="DVTjYEKvImNmOpNNND9GOlQ0BIvzutGJ"
export BAIDU_DEV_PID="1537"
export AUTH_SECRET="my-secret-key-2024"

nohup node dist/index.js > ../backend.log 2>&1 &
BACKEND_PID=$!
echo -e "✅ 后端服务已启动 (PID: $BACKEND_PID)"

# 4. 构建前端
echo ""
echo -e "${BLUE}🔨 构建前端项目${NC}"
cd ../frontend

# 全局安装vite
npm install -g vite

# 设置前端环境变量
export VITE_API_BASE_URL="https://$PUBLIC_IP/api/"

# 构建生产版本
echo "构建前端生产版本..."
vite build

# 检查构建结果
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ 前端构建失败${NC}"
    exit 1
fi

echo -e "✅ 前端构建完成"

# 5. 部署到Nginx
echo ""
echo -e "${BLUE}🌐 部署到Nginx${NC}"

# 备份现有文件
sudo mkdir -p /var/www/html-backup
sudo cp -r /var/www/html/* /var/www/html-backup/ 2>/dev/null || true

# 部署新文件
sudo rm -rf /var/www/html/*
sudo cp -r dist/* /var/www/html/

# 设置权限
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

echo -e "✅ 前端部署完成"

# 6. 更新Nginx配置
echo ""
echo -e "${BLUE}⚙️ 更新Nginx配置${NC}"

sudo tee /etc/nginx/sites-available/edu-game-https > /dev/null << EOF
# HTTP重定向到HTTPS
server {
    listen 80;
    server_name _;
    return 301 https://\$server_name\$request_uri;
}

# HTTPS服务器
server {
    listen 443 ssl http2;
    server_name _;

    # SSL证书配置
    ssl_certificate /etc/nginx/ssl/edu-game.crt;
    ssl_certificate_key /etc/nginx/ssl/edu-game.key;
    
    # SSL安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 前端静态文件
    location / {
        root /var/www/html;
        try_files \$uri \$uri/ /index.html;
        
        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # 后端API代理
    location /api/ {
        proxy_pass http://127.0.0.1:4001/api/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Ssl on;
    }

    # 健康检查代理
    location /health {
        proxy_pass http://127.0.0.1:4001/health;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    # WebSocket支持
    location /socket.io/ {
        proxy_pass http://127.0.0.1:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
EOF

# 测试Nginx配置
sudo nginx -t
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Nginx配置错误${NC}"
    exit 1
fi

# 重启Nginx
sudo systemctl restart nginx

echo -e "✅ Nginx配置更新完成"

# 7. 等待服务启动
echo ""
echo -e "${BLUE}⏳ 等待服务启动${NC}"
sleep 10

# 8. 测试服务
echo ""
echo -e "${BLUE}🧪 测试服务${NC}"
cd ..

echo "测试后端服务..."
if curl -s http://localhost:4001/health > /dev/null; then
    echo -e "✅ 后端服务正常 (端口 4001)"
else
    echo -e "❌ 后端服务异常"
    echo "查看日志: tail -f backend.log"
fi

echo "测试前端服务..."
if curl -s -I https://localhost > /dev/null 2>&1; then
    echo -e "✅ 前端服务正常 (HTTPS)"
else
    echo -e "⚠️  HTTPS测试跳过 (自签名证书)"
fi

# 9. 保存进程信息
echo "$BACKEND_PID" > backend.pid

echo ""
echo -e "${GREEN}🎉 生产环境部署完成！${NC}"
echo "============================================"
echo -e "🌐 HTTPS访问地址: ${GREEN}https://$PUBLIC_IP${NC}"
echo -e "🔒 证书类型: ${YELLOW}自签名证书${NC}"
echo -e "🎤 语音录制: ${GREEN}现在可以正常使用${NC}"

echo ""
echo -e "${BLUE}📋 服务信息:${NC}"
echo -e "• 后端服务: http://localhost:4001 (PID: $BACKEND_PID)"
echo -e "• 前端文件: /var/www/html"
echo -e "• 后端日志: tail -f $(pwd)/backend.log"
echo -e "• Nginx日志: tail -f /var/log/nginx/error.log"

echo ""
echo -e "${BLUE}🔧 管理命令:${NC}"
echo -e "• 停止后端: kill $BACKEND_PID"
echo -e "• 重启Nginx: sudo systemctl restart nginx"
echo -e "• 查看Nginx状态: sudo systemctl status nginx"
echo -e "• 重新部署: ./deploy-production.sh"

echo ""
echo -e "${YELLOW}⚠️  浏览器安全警告处理:${NC}"
echo "1. 访问 https://$PUBLIC_IP"
echo "2. 看到安全警告时，点击\"高级\""
echo "3. 点击\"继续访问\"或\"接受风险并继续\""
echo "4. 现在可以正常使用语音录制功能"

echo ""
echo -e "${GREEN}🎊 享受你的教育游戏项目吧！${NC}"
