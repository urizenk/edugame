#!/bin/bash

# 🚀 一键部署HTTPS教育游戏 - 无需域名
# 自动生成自签名证书并启动服务

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 一键部署HTTPS教育游戏 (无需域名)${NC}"
echo "============================================"

# 获取服务器IP
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || echo "localhost")
echo -e "${BLUE}📡 服务器IP: ${GREEN}$PUBLIC_IP${NC}"

# 1. 检查Docker和Docker Compose
echo ""
echo -e "${BLUE}🐳 检查Docker环境${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker未安装，请先安装Docker${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose未安装，请先安装Docker Compose${NC}"
    exit 1
fi

echo "✅ Docker环境检查通过"

# 2. 停止现有服务
echo ""
echo -e "${BLUE}🛑 停止现有服务${NC}"
docker-compose down 2>/dev/null || true
docker stop $(docker ps -q) 2>/dev/null || true

# 3. 创建SSL证书目录
echo ""
echo -e "${BLUE}📁 创建SSL证书目录${NC}"
mkdir -p nginx/ssl

# 4. 生成自签名证书
echo ""
echo -e "${BLUE}🔐 生成自签名SSL证书${NC}"

# 创建证书配置文件
cat > nginx/ssl/cert.conf << EOF
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

# 生成私钥和证书
openssl genrsa -out nginx/ssl/key.pem 2048
openssl req -new -key nginx/ssl/key.pem -out nginx/ssl/cert.csr -config nginx/ssl/cert.conf
openssl x509 -req -in nginx/ssl/cert.csr -signkey nginx/ssl/key.pem -out nginx/ssl/cert.pem -days 365 -extensions v3_req -extfile nginx/ssl/cert.conf

# 清理临时文件
rm nginx/ssl/cert.conf nginx/ssl/cert.csr

echo "✅ SSL证书生成完成"

# 5. 构建和启动服务
echo ""
echo -e "${BLUE}🔨 构建和启动服务${NC}"
docker-compose -f docker-compose-https.yml up --build -d

# 6. 等待服务启动
echo ""
echo -e "${BLUE}⏳ 等待服务启动${NC}"
sleep 10

# 7. 检查服务状态
echo ""
echo -e "${BLUE}🔍 检查服务状态${NC}"
docker-compose -f docker-compose-https.yml ps

# 8. 配置防火墙
echo ""
echo -e "${BLUE}🔥 配置防火墙${NC}"
if command -v ufw &> /dev/null; then
    ufw allow 80/tcp 2>/dev/null || true
    ufw allow 443/tcp 2>/dev/null || true
    echo "✅ 防火墙配置完成"
else
    echo "⚠️  请手动开放80和443端口"
fi

# 9. 测试服务
echo ""
echo -e "${BLUE}🧪 测试服务${NC}"
echo "测试HTTP重定向..."
curl -I http://localhost 2>/dev/null | head -1 || echo "HTTP测试失败"

echo "测试HTTPS..."
curl -k -I https://localhost 2>/dev/null | head -1 || echo "HTTPS测试失败"

echo ""
echo -e "${GREEN}🎉 部署完成！${NC}"
echo "============================================"
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
echo -e "${BLUE}🔧 管理命令:${NC}"
echo "• 查看日志: docker-compose -f docker-compose-https.yml logs -f"
echo "• 停止服务: docker-compose -f docker-compose-https.yml down"
echo "• 重启服务: docker-compose -f docker-compose-https.yml restart"
echo "• 查看状态: docker-compose -f docker-compose-https.yml ps"

echo ""
echo -e "${GREEN}✅ 测试语音录制:${NC}"
echo "1. 进入网站后点击语音录制按钮"
echo "2. 允许麦克风权限"
echo "3. 开始录制测试"

echo ""
echo -e "${GREEN}🎊 享受你的HTTPS教育游戏吧！${NC}"
