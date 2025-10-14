#!/bin/bash

# 🔒 HTTPS配置脚本 - 解决语音录制问题
# 适用于阿里云Ubuntu服务器

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔒 配置HTTPS以支持语音录制功能${NC}"
echo "=================================="

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ 请使用root用户运行此脚本${NC}"
    echo "使用命令: sudo bash setup-https.sh"
    exit 1
fi

# 获取服务器IP
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || echo "localhost")
echo -e "${BLUE}📡 服务器IP: ${GREEN}$PUBLIC_IP${NC}"

# 1. 安装Nginx (如果未安装)
echo ""
echo -e "${BLUE}📦 检查并安装Nginx${NC}"
if ! command -v nginx &> /dev/null; then
    echo "安装Nginx..."
    apt update
    apt install -y nginx
    systemctl enable nginx
else
    echo "✅ Nginx已安装"
fi

# 2. 安装Certbot (Let's Encrypt)
echo ""
echo -e "${BLUE}🔐 安装Certbot (Let's Encrypt)${NC}"
if ! command -v certbot &> /dev/null; then
    echo "安装Certbot..."
    apt install -y certbot python3-certbot-nginx
else
    echo "✅ Certbot已安装"
fi

# 3. 配置Nginx反向代理
echo ""
echo -e "${BLUE}⚙️ 配置Nginx反向代理${NC}"

# 询问域名
echo -e "${YELLOW}请输入您的域名 (例如: edu-game.example.com):${NC}"
read -p "域名: " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo -e "${RED}❌ 域名不能为空${NC}"
    exit 1
fi

# 创建Nginx配置
cat > /etc/nginx/sites-available/edu-game << EOF
server {
    listen 80;
    server_name $DOMAIN;

    # 前端
    location / {
        proxy_pass http://localhost:4173;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # 后端API
    location /api/ {
        proxy_pass http://localhost:4001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # WebSocket支持 (如果需要)
    location /socket.io/ {
        proxy_pass http://localhost:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# 启用站点
ln -sf /etc/nginx/sites-available/edu-game /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试Nginx配置
nginx -t
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Nginx配置错误${NC}"
    exit 1
fi

# 重启Nginx
systemctl restart nginx

echo "✅ Nginx配置完成"

# 4. 获取SSL证书
echo ""
echo -e "${BLUE}🔐 获取SSL证书${NC}"
echo -e "${YELLOW}注意: 请确保域名 $DOMAIN 已正确解析到服务器IP $PUBLIC_IP${NC}"
echo -e "${YELLOW}按Enter继续，或Ctrl+C取消...${NC}"
read

# 获取证书
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SSL证书获取成功！${NC}"
    
    # 设置自动续期
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
    
    echo ""
    echo -e "${GREEN}🎉 HTTPS配置完成！${NC}"
    echo "=================================="
    echo -e "🌐 访问地址: ${GREEN}https://$DOMAIN${NC}"
    echo -e "🎤 语音录制: ${GREEN}现在可以正常使用${NC}"
    echo -e "🔄 证书自动续期: ${GREEN}已设置${NC}"
    echo ""
    echo -e "${BLUE}📋 测试步骤:${NC}"
    echo "1. 在浏览器中访问 https://$DOMAIN"
    echo "2. 点击语音录制按钮"
    echo "3. 允许麦克风权限"
    echo "4. 开始录制测试"
    
else
    echo -e "${RED}❌ SSL证书获取失败${NC}"
    echo ""
    echo -e "${YELLOW}💡 可能的原因:${NC}"
    echo "1. 域名未正确解析到服务器IP"
    echo "2. 防火墙阻止了80/443端口"
    echo "3. 域名格式不正确"
    echo ""
    echo -e "${BLUE}🔧 手动解决步骤:${NC}"
    echo "1. 检查域名DNS解析: nslookup $DOMAIN"
    echo "2. 检查防火墙: ufw status"
    echo "3. 重新运行: certbot --nginx -d $DOMAIN"
fi

echo ""
echo -e "${BLUE}🔧 其他有用命令:${NC}"
echo "• 查看证书状态: certbot certificates"
echo "• 手动续期: certbot renew"
echo "• 测试续期: certbot renew --dry-run"
echo "• 重启Nginx: systemctl restart nginx"
