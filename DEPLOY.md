# 快乐课堂·语音创想 Docker 部署指南

## 服务器要求

- 操作系统：Ubuntu 20.04
- Docker：20.10+
- Docker Compose：1.29+
- 至少 2GB 内存
- 至少 10GB 磁盘空间

## 一、安装 Docker 和 Docker Compose

如果服务器上还没有安装 Docker，执行以下命令：

```bash
# 更新软件包索引
sudo apt update

# 安装必要的依赖
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# 添加 Docker 官方 GPG 密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 添加 Docker 仓库
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 更新软件包索引
sudo apt update

# 安装 Docker
sudo apt install -y docker-ce docker-ce-cli containerd.io

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 将当前用户添加到 docker 组（避免每次都用 sudo）
sudo usermod -aG docker $USER

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
docker --version
docker-compose --version
```

## 二、克隆项目

```bash
# 克隆项目到服务器
git clone https://gitee.com/dot123dot/edu-game.git
cd edu-game
```

## 三、配置环境变量

在项目根目录创建 `.env` 文件：

```bash
nano .env
```

添加以下内容（替换为你的实际值）：

```env
# 百度语音识别 API 配置
BAIDU_API_KEY=xmEObbrYbzwfjX8Vn2ePiQXI
BAIDU_SECRET_KEY=DVTjYEKvImNmOpNNND9GOlQ0BIvzutGJ

# 认证密钥
AUTH_SECRET=my-secret-key-2024

# 管理员密码
ADMIN_PASSWORD=admin123
```

保存并退出（Ctrl+X，然后 Y，然后 Enter）。

## 四、一键启动服务

```bash
# 构建并启动所有服务
docker-compose up -d --build
```

这个命令会：
1. 构建前端和后端的 Docker 镜像
2. 启动所有容器
3. 在后台运行服务

## 五、查看服务状态

```bash
# 查看运行中的容器
docker-compose ps

# 查看日志
docker-compose logs -f

# 查看特定服务的日志
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 六、访问应用

- **前端界面**：http://你的服务器IP
- **后端API**：http://你的服务器IP:4001

## 七、常用命令

```bash
# 停止所有服务
docker-compose down

# 重启服务
docker-compose restart

# 重新构建并启动
docker-compose up -d --build

# 查看容器状态
docker-compose ps

# 进入容器
docker-compose exec backend sh
docker-compose exec frontend sh

# 清理未使用的镜像和容器
docker system prune -a
```

## 八、更新应用

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose up -d --build
```

## 九、配置防火墙（可选）

如果服务器启用了防火墙，需要开放端口：

```bash
# 开放 80 端口（前端）
sudo ufw allow 80/tcp

# 开放 4001 端口（后端，如果需要直接访问）
sudo ufw allow 4001/tcp

# 重启防火墙
sudo ufw reload
```

## 十、故障排查

### 1. 容器无法启动

```bash
# 查看详细日志
docker-compose logs backend
docker-compose logs frontend
```

### 2. 前端无法访问后端

- 检查 nginx 配置是否正确
- 检查后端服务是否正常运行
- 检查网络连接：`docker-compose exec frontend ping backend`

### 3. 百度语音识别失败

- 检查 `.env` 文件中的 API 密钥是否正确
- 查看后端日志：`docker-compose logs backend`

### 4. 数据持久化

后端数据存储在 Docker volume 中，即使容器重启数据也不会丢失。

查看 volume：
```bash
docker volume ls
docker volume inspect edu-game_backend-data
```

## 十一、性能优化（可选）

### 启用 HTTPS（使用 Let's Encrypt）

```bash
# 安装 certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取 SSL 证书（替换为你的域名）
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### 配置 Nginx 缓存

编辑 `frontend/nginx.conf` 添加更多缓存配置。

## 技术栈

- **前端**：React 18 + TypeScript + Tailwind CSS + Vite
- **后端**：Node.js + Express + Socket.IO + SQLite
- **容器化**：Docker + Docker Compose
- **Web服务器**：Nginx

## 支持

如有问题，请查看项目文档或提交 Issue。

