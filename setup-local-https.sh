#!/bin/bash

# 🔒 本地HTTPS配置脚本 - 无需域名和证书
# 使用自签名证书解决语音录制问题

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔒 配置本地HTTPS (自签名证书)${NC}"
echo "=================================="

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ 请使用root用户运行此脚本${NC}"
    echo "使用命令: sudo bash setup-local-https.sh"
    exit 1
fi

# 获取服务器IP
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || echo "localhost")
echo -e "${BLUE}📡 服务器IP: ${GREEN}$PUBLIC_IP${NC}"

# 1. 安装必要软件
echo ""
echo -e "${BLUE}📦 安装必要软件${NC}"
apt update
apt install -y nginx openssl

# 2. 创建自签名证书
echo ""
echo -e "${BLUE}🔐 创建自签名SSL证书${NC}"

# 创建证书目录
mkdir -p /etc/nginx/ssl

# 生成私钥
openssl genrsa -out /etc/nginx/ssl/edu-game.key 2048

# 创建证书配置文件
cat > /tmp/cert.conf << EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = v3_req

[dn]
C=CN
ST=Beijing
L=Beijing
O=EduGame
OU=Development
CN=$PUBLIC_IP

[v3_req]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = $PUBLIC_IP
IP.1 = 127.0.0.1
IP.2 = $PUBLIC_IP
EOF

# 生成证书签名请求和自签名证书
openssl req -new -key /etc/nginx/ssl/edu-game.key -out /tmp/edu-game.csr -config /tmp/cert.conf
openssl x509 -req -in /tmp/edu-game.csr -signkey /etc/nginx/ssl/edu-game.key -out /etc/nginx/ssl/edu-game.crt -days 365 -extensions v3_req -extfile /tmp/cert.conf

# 设置权限
chmod 600 /etc/nginx/ssl/edu-game.key
chmod 644 /etc/nginx/ssl/edu-game.crt

echo "✅ 自签名证书创建完成"

# 3. 配置Nginx HTTPS
echo ""
echo -e "${BLUE}⚙️ 配置Nginx HTTPS${NC}"

cat > /etc/nginx/sites-available/edu-game-https << EOF
# HTTP重定向到HTTPS
server {
    listen 80;
    server_name $PUBLIC_IP localhost;
    return 301 https://\$server_name\$request_uri;
}

# HTTPS配置
server {
    listen 443 ssl http2;
    server_name $PUBLIC_IP localhost;

    # SSL证书配置
    ssl_certificate /etc/nginx/ssl/edu-game.crt;
    ssl_certificate_key /etc/nginx/ssl/edu-game.key;
    
    # SSL安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 前端
    location / {
        proxy_pass http://localhost:4173;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Ssl on;
    }

    # 后端API
    location /api/ {
        proxy_pass http://localhost:4001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Ssl on;
    }

    # WebSocket支持
    location /socket.io/ {
        proxy_pass http://localhost:4001;
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

# 启用HTTPS站点
ln -sf /etc/nginx/sites-available/edu-game-https /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/sites-enabled/edu-game

# 测试Nginx配置
nginx -t
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Nginx配置错误${NC}"
    exit 1
fi

# 重启Nginx
systemctl restart nginx
systemctl enable nginx

# 4. 配置防火墙
echo ""
echo -e "${BLUE}🔥 配置防火墙${NC}"
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 4001/tcp
ufw allow 4173/tcp

echo ""
echo -e "${GREEN}🎉 本地HTTPS配置完成！${NC}"
echo "=================================="
echo -e "🌐 HTTPS访问地址: ${GREEN}https://$PUBLIC_IP${NC}"
echo -e "🔒 证书类型: ${YELLOW}自签名证书${NC}"
echo -e "🎤 语音录制: ${GREEN}现在可以正常使用${NC}"

echo ""
echo -e "${YELLOW}⚠️  重要提示:${NC}"
echo "由于使用自签名证书，浏览器会显示安全警告"
echo "这是正常现象，请按以下步骤操作："

echo ""
echo -e "${BLUE}📋 浏览器操作步骤:${NC}"
echo "1. 访问 https://$PUBLIC_IP"
echo "2. 浏览器显示\"不安全\"或\"证书错误\"警告"
echo "3. 点击\"高级\"或\"详细信息\""
echo "4. 点击\"继续访问\"或\"接受风险并继续\""
echo "5. 现在可以正常使用语音录制功能"

echo ""
echo -e "${BLUE}🔧 不同浏览器操作:${NC}"
echo "• Chrome: 点击\"高级\" → \"继续前往$PUBLIC_IP(不安全)\""
echo "• Firefox: 点击\"高级\" → \"接受风险并继续\""
echo "• Safari: 点击\"显示详细信息\" → \"访问此网站\""
echo "• Edge: 点击\"高级\" → \"继续到$PUBLIC_IP(不安全)\""

echo ""
echo -e "${GREEN}✅ 测试语音录制:${NC}"
echo "1. 进入网站后点击语音录制按钮"
echo "2. 允许麦克风权限"
echo "3. 开始录制测试"

echo ""
echo -e "${BLUE}🔧 有用命令:${NC}"
echo "• 重启Nginx: systemctl restart nginx"
echo "• 查看Nginx状态: systemctl status nginx"
echo "• 查看证书: openssl x509 -in /etc/nginx/ssl/edu-game.crt -text -noout"
echo "• 测试HTTPS: curl -k https://$PUBLIC_IP"

# 清理临时文件
rm -f /tmp/cert.conf /tmp/edu-game.csr

echo ""
echo -e "${GREEN}🎊 配置完成！现在可以使用HTTPS访问并录制语音了！${NC}"
