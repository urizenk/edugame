#!/bin/bash

# 🔧 快速HTTPS修复 - 在现有服务基础上添加HTTPS支持
# 适用于已经运行的Docker服务

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 快速HTTPS修复 - 无需域名${NC}"
echo "=================================="

# 获取服务器IP
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || echo "localhost")
echo -e "${BLUE}📡 服务器IP: ${GREEN}$PUBLIC_IP${NC}"

# 1. 安装Nginx
echo ""
echo -e "${BLUE}📦 安装Nginx${NC}"
if ! command -v nginx &> /dev/null; then
    if command -v apt &> /dev/null; then
        apt update && apt install -y nginx openssl
    elif command -v yum &> /dev/null; then
        yum install -y nginx openssl
    else
        echo -e "${RED}❌ 无法自动安装Nginx，请手动安装${NC}"
        exit 1
    fi
else
    echo "✅ Nginx已安装"
fi

# 2. 生成自签名证书
echo ""
echo -e "${BLUE}🔐 生成自签名SSL证书${NC}"

# 创建证书目录
mkdir -p /etc/nginx/ssl

# 生成证书配置
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

# 生成证书
openssl genrsa -out /etc/nginx/ssl/edu-game.key 2048
openssl req -new -key /etc/nginx/ssl/edu-game.key -out /tmp/edu-game.csr -config /tmp/cert.conf
openssl x509 -req -in /tmp/edu-game.csr -signkey /etc/nginx/ssl/edu-game.key -out /etc/nginx/ssl/edu-game.crt -days 365 -extensions v3_req -extfile /tmp/cert.conf

# 设置权限
chmod 600 /etc/nginx/ssl/edu-game.key
chmod 644 /etc/nginx/ssl/edu-game.crt

echo "✅ SSL证书生成完成"

# 3. 配置Nginx HTTPS代理
echo ""
echo -e "${BLUE}⚙️ 配置Nginx HTTPS代理${NC}"

cat > /etc/nginx/sites-available/edu-game-https << 'EOF'
# HTTP重定向到HTTPS
server {
    listen 80;
    server_name _;
    return 301 https://$server_name$request_uri;
}

# HTTPS代理服务器
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

    # 前端代理
    location / {
        proxy_pass http://127.0.0.1:4173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Ssl on;
    }

    # 后端API代理
    location /api/ {
        proxy_pass http://127.0.0.1:4001/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Ssl on;
    }

    # 健康检查代理
    location /health {
        proxy_pass http://127.0.0.1:4001/health;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    # WebSocket支持
    location /socket.io/ {
        proxy_pass http://127.0.0.1:4001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
EOF

# 启用站点
ln -sf /etc/nginx/sites-available/edu-game-https /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试配置
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
if command -v ufw &> /dev/null; then
    ufw allow 80/tcp 2>/dev/null || true
    ufw allow 443/tcp 2>/dev/null || true
    echo "✅ UFW防火墙配置完成"
elif command -v firewall-cmd &> /dev/null; then
    firewall-cmd --permanent --add-port=80/tcp 2>/dev/null || true
    firewall-cmd --permanent --add-port=443/tcp 2>/dev/null || true
    firewall-cmd --reload 2>/dev/null || true
    echo "✅ Firewalld防火墙配置完成"
else
    echo "⚠️  请手动开放80和443端口"
fi

# 5. 测试服务
echo ""
echo -e "${BLUE}🧪 测试服务${NC}"
sleep 3

echo "测试后端服务..."
curl -s http://127.0.0.1:4001/health > /dev/null && echo "✅ 后端服务正常" || echo "❌ 后端服务异常"

echo "测试前端服务..."
curl -s -I http://127.0.0.1:4173 > /dev/null && echo "✅ 前端服务正常" || echo "❌ 前端服务异常"

echo "测试HTTPS..."
curl -k -s -I https://127.0.0.1 > /dev/null && echo "✅ HTTPS服务正常" || echo "❌ HTTPS服务异常"

# 清理临时文件
rm -f /tmp/cert.conf /tmp/edu-game.csr

echo ""
echo -e "${GREEN}🎉 HTTPS配置完成！${NC}"
echo "=================================="
echo -e "🌐 HTTPS访问地址: ${GREEN}https://$PUBLIC_IP${NC}"
echo -e "🔒 证书类型: ${YELLOW}自签名证书 (有效期365天)${NC}"
echo -e "🎤 语音录制: ${GREEN}现在可以正常使用${NC}"

echo ""
echo -e "${YELLOW}⚠️  浏览器安全警告处理:${NC}"
echo "1. 访问 https://$PUBLIC_IP"
echo "2. 看到安全警告时，点击\"高级\""
echo "3. 点击\"继续访问\"或\"接受风险并继续\""
echo "4. 现在可以正常使用语音录制功能"

echo ""
echo -e "${BLUE}🔧 管理命令:${NC}"
echo "• 重启Nginx: systemctl restart nginx"
echo "• 查看Nginx状态: systemctl status nginx"
echo "• 查看Nginx日志: tail -f /var/log/nginx/error.log"
echo "• 测试HTTPS: curl -k https://$PUBLIC_IP"

echo ""
echo -e "${GREEN}✅ 现在可以测试语音录制功能了！${NC}"
