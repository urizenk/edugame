# 🚀 部署指南

## 方案一：Zeabur 部署（推荐 - 国内可访问）

### 1. 注册 Zeabur
- 访问：https://zeabur.com
- 使用 GitHub 账号登录

### 2. 创建项目
1. 点击 "New Project"
2. 连接你的 Gitee 仓库或 GitHub 仓库
3. 选择 `edu-game` 仓库

### 3. 配置服务

#### Backend 服务：
- Service Name: `backend`
- Port: `4001`
- Environment Variables:
  ```
  NODE_ENV=production
  PORT=4001
  CORS_ORIGIN=*
  BAIDU_API_KEY=xmEObbrYbzwfjX8Vn2ePiQXI
  BAIDU_SECRET_KEY=DVTjYEKvImNmOpNNND9GOlQ0BIvzutGJ
  BAIDU_DEV_PID=1537
  AUTH_SECRET=my-secret-key-2024
  ```

#### Frontend 服务：
- Service Name: `frontend`
- Port: `80`
- Environment Variables:
  ```
  VITE_API_URL=https://你的backend域名.zeabur.app
  ```

### 4. 部署
- Zeabur 会自动检测 Dockerfile 并开始构建
- 等待部署完成（约3-5分钟）
- 获取访问域名

---

## 方案二：Railway 部署

### 1. 注册 Railway
- 访问：https://railway.app
- 使用 GitHub 登录

### 2. 创建项目
```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录
railway login

# 初始化项目
railway init
```

### 3. 部署
```bash
# 部署 backend
cd backend
railway up

# 部署 frontend
cd ../frontend
railway up
```

### 4. 配置环境变量
在 Railway Dashboard 中添加环境变量

---

## 方案三：Vercel + Zeabur/Railway

### Frontend → Vercel
1. 访问 https://vercel.com
2. 导入 GitHub 仓库
3. 构建配置：
   - Framework: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Backend → Zeabur/Railway
- 按照上述 Zeabur 或 Railway 步骤部署

---

## 方案四：国内平台（阿里云/腾讯云）

### 阿里云 ACK（容器服务）
```bash
# 1. 推送镜像到阿里云容器镜像服务
docker tag edu-game-backend registry.cn-hangzhou.aliyuncs.com/你的命名空间/edu-game-backend
docker push registry.cn-hangzhou.aliyuncs.com/你的命名空间/edu-game-backend

# 2. 在 ACK 控制台创建应用
```

### 腾讯云 TKE（容器服务）
```bash
# 1. 推送镜像
docker tag edu-game-backend ccr.ccs.tencentyun.com/你的命名空间/edu-game-backend
docker push ccr.ccs.tencentyun.com/你的命名空间/edu-game-backend

# 2. 在 TKE 控制台创建应用
```

---

## 方案五：Cloudflare Tunnel（解决国内访问问题）

### 在服务器上运行：
```bash
# 1. 下载 cloudflared（使用国内镜像）
wget https://ghproxy.net/https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared

# 2. 登录 Cloudflare
cloudflared tunnel login

# 3. 创建隧道
cloudflared tunnel create edu-game

# 4. 配置隧道
cat > ~/.cloudflared/config.yml << EOF
tunnel: edu-game
credentials-file: /root/.cloudflared/<tunnel-id>.json

ingress:
  - hostname: edu-game.你的域名.com
    service: http://localhost:8080
  - service: http_status:404
EOF

# 5. 运行隧道
cloudflared tunnel run edu-game
```

---

## 推荐配置（最简单）

### 1️⃣ 使用 Zeabur（最快）
- ✅ 国内直接访问
- ✅ 自动 HTTPS
- ✅ 免费额度
- ⏱ 5分钟部署

### 2️⃣ 使用 Vercel + Zeabur
- Frontend → Vercel（CDN加速）
- Backend → Zeabur（稳定后端）
- ⏱ 10分钟部署

---

## 快速开始（Zeabur）

1. **推送代码到 GitHub/Gitee**
   ```bash
   git add .
   git commit -m "准备部署到Zeabur"
   git push
   ```

2. **访问 Zeabur**
   - https://zeabur.com
   - 登录并创建项目

3. **部署**
   - 选择仓库
   - 自动检测并部署
   - 获取域名

4. **访问应用** ✨
   - Frontend: `https://你的项目.zeabur.app`
   - Backend: `https://你的项目-backend.zeabur.app`

---

## 故障排查

### 国内无法访问？
1. 使用 Zeabur（国内节点）
2. 使用 Cloudflare Tunnel
3. 使用国内云平台（阿里云/腾讯云）

### 端口被占用？
```bash
# 查看占用进程
sudo lsof -i :8080
sudo lsof -i :4001

# 停止进程
sudo kill -9 <PID>
```

### Docker 网络问题？
```bash
# 重置 Docker 网络
docker network prune -f
docker system prune -f
```

---

## 联系支持
- Zeabur Discord: https://discord.gg/zeabur
- Railway Discord: https://discord.gg/railway

