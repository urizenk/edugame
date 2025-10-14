#!/bin/bash

# 语音词云教学 - 一体机部署脚本
# 适用于 Ubuntu 20.04 及以上版本

set -e

TITLE="语音词云教学 - 一体机部署"

banner() {
  echo "========================================="
  echo "  $TITLE"
  echo "========================================="
  echo
}

banner

echo "🔍 检查当前用户权限"
if [ "$(id -u)" -eq 0 ]; then
  echo "⚠️  当前以 root 用户运行，将继续执行。请确认这是您期望的操作。"
else
  echo "✅ 使用普通用户 $(whoami) 运行，过程中会提示使用 sudo。"
fi

echo
banner

echo "➡️  检查 Docker..."
if ! command -v docker >/dev/null 2>&1; then
  echo "🚧 未检测到 Docker，开始安装..."
  sudo apt update
  sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
  echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
  sudo apt update
  sudo apt install -y docker-ce docker-ce-cli containerd.io
  sudo systemctl enable --now docker
  if [ "$(id -u)" -ne 0 ]; then
    sudo usermod -aG docker "$USER"
    echo "ℹ️  已将 $USER 加入 docker 组，如需立即生效请重新登录。"
  fi
else
  echo "✅ Docker 已安装"
fi

echo
banner

echo "➡️  检查 Docker Compose..."
if ! command -v docker-compose >/dev/null 2>&1; then
  echo "🚧 未检测到 Docker Compose，开始安装..."
  sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
else
  echo "✅ Docker Compose 已安装"
fi

echo
banner

echo "➡️  准备环境变量 (.env)"
if [ ! -f .env ]; then
  echo "📝  未找到 .env，开始交互式创建..."
  read -p "请输入百度 API Key (默认: xmEObbrYbzwfjX8Vn2ePiQXI): " BAIDU_API_KEY
  BAIDU_API_KEY=${BAIDU_API_KEY:-xmEObbrYbzwfjX8Vn2ePiQXI}

  read -p "请输入百度 Secret Key (默认: DVTjYEKvImNmOpNNND9GOlQ0BIvzutGJ): " BAIDU_SECRET_KEY
  BAIDU_SECRET_KEY=${BAIDU_SECRET_KEY:-DVTjYEKvImNmOpNNND9GOlQ0BIvzutGJ}

  read -p "请输入识别密钥 AUTH_SECRET (默认: my-secret-key-2024): " AUTH_SECRET
  AUTH_SECRET=${AUTH_SECRET:-my-secret-key-2024}

  cat > .env <<EOF
BAIDU_API_KEY=$BAIDU_API_KEY
BAIDU_SECRET_KEY=$BAIDU_SECRET_KEY
AUTH_SECRET=$AUTH_SECRET
EOF
  echo "✅ 已生成 .env 文件"
else
  echo "✅ 已检测到 .env，保持现有配置"
fi

echo
banner

echo "➡️  构建并启动容器"
if docker-compose ps | grep -q "Up"; then
  echo "⏹  停止现有容器..."
  docker-compose down
fi

echo "🚀 开始构建..."
docker-compose up -d --build

echo
banner

SERVER_IP=$(hostname -I | awk '{print $1}')

echo "🎉 部署完成！"
echo "👉 前端访问: http://$SERVER_IP"
echo "👉 后端接口: http://$SERVER_IP:4001"
echo
printf "📋 常用命令：\n  docker-compose ps\n  docker-compose logs -f\n  docker-compose down\n"
echo
