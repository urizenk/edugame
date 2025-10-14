#!/bin/bash

# 快乐课堂·语音创想 - 一键部署脚本
# 适用于 Ubuntu 20.04

set -e

echo "========================================="
echo "  快乐课堂·语音创想 - 一键部署脚本"
echo "========================================="
echo ""

# 检查是否为 root 用户
if [ "$EUID" -eq 0 ]; then 
    echo "请不要使用 root 用户运行此脚本"
    exit 1
fi

# 检查 Docker 是否已安装
if ! command -v docker &> /dev/null; then
    echo "Docker 未安装，开始安装 Docker..."
    
    # 更新包索引
    sudo apt update
    
    # 安装依赖
    sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
    
    # 添加 Docker GPG 密钥
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # 添加 Docker 仓库
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # 更新包索引
    sudo apt update
    
    # 安装 Docker
    sudo apt install -y docker-ce docker-ce-cli containerd.io
    
    # 将当前用户添加到 docker 组
    sudo usermod -aG docker $USER
    
    # 启动 Docker
    sudo systemctl start docker
    sudo systemctl enable docker
    
    echo "Docker 安装完成！"
else
    echo "✓ Docker 已安装"
fi

# 检查 Docker Compose 是否已安装
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose 未安装，开始安装..."
    
    # 安装 Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    echo "Docker Compose 安装完成！"
else
    echo "✓ Docker Compose 已安装"
fi

echo ""
echo "========================================="
echo "  配置环境变量"
echo "========================================="
echo ""

# 检查 .env 文件是否存在
if [ ! -f .env ]; then
    echo "创建 .env 文件..."
    
    # 提示用户输入百度 API 密钥
    read -p "请输入百度 API Key (默认: xmEObbrYbzwfjX8Vn2ePiQXI): " BAIDU_API_KEY
    BAIDU_API_KEY=${BAIDU_API_KEY:-xmEObbrYbzwfjX8Vn2ePiQXI}
    
    read -p "请输入百度 Secret Key (默认: DVTjYEKvImNmOpNNND9GOlQ0BIvzutGJ): " BAIDU_SECRET_KEY
    BAIDU_SECRET_KEY=${BAIDU_SECRET_KEY:-DVTjYEKvImNmOpNNND9GOlQ0BIvzutGJ}
    
    read -p "请输入认证密钥 (默认: my-secret-key-2024): " AUTH_SECRET
    AUTH_SECRET=${AUTH_SECRET:-my-secret-key-2024}
    
    read -p "请输入管理员密码 (默认: admin123): " ADMIN_PASSWORD
    ADMIN_PASSWORD=${ADMIN_PASSWORD:-admin123}
    
    # 创建 .env 文件
    cat > .env <<EOF
# 百度语音识别 API 配置
BAIDU_API_KEY=$BAIDU_API_KEY
BAIDU_SECRET_KEY=$BAIDU_SECRET_KEY

# 认证密钥
AUTH_SECRET=$AUTH_SECRET

# 管理员密码
ADMIN_PASSWORD=$ADMIN_PASSWORD
EOF
    
    echo ".env 文件创建成功！"
else
    echo "✓ .env 文件已存在"
fi

echo ""
echo "========================================="
echo "  构建并启动服务"
echo "========================================="
echo ""

# 停止已有的服务
if docker-compose ps | grep -q "Up"; then
    echo "停止现有服务..."
    docker-compose down
fi

# 构建并启动服务
echo "构建并启动服务..."
docker-compose up -d --build

echo ""
echo "========================================="
echo "  部署完成！"
echo "========================================="
echo ""

# 获取服务器 IP
SERVER_IP=$(hostname -I | awk '{print $1}')

echo "✓ 服务已成功启动！"
echo ""
echo "访问地址："
echo "  前端: http://$SERVER_IP"
echo "  后端: http://$SERVER_IP:4001"
echo ""
echo "查看服务状态："
echo "  docker-compose ps"
echo ""
echo "查看日志："
echo "  docker-compose logs -f"
echo ""
echo "停止服务："
echo "  docker-compose down"
echo ""
echo "========================================="

