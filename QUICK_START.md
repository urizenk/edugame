# 阿里云服务器一键部署指南 🚀

## 服务器环境
- 操作系统：Ubuntu 20.04
- 最低配置：2核CPU + 2GB内存 + 10GB硬盘

## 一键部署命令

### 步骤1：SSH 连接到你的阿里云服务器

```bash
ssh root@你的服务器IP
# 或
ssh 用户名@你的服务器IP
```

### 步骤2：克隆项目并部署

```bash
# 克隆项目
git clone https://gitee.com/dot123dot/edu-game.git

# 进入项目目录
cd edu-game

# 赋予执行权限
chmod +x deploy.sh

# 一键部署
./deploy.sh
```

## 部署脚本会自动完成以下操作：

✅ 检测并安装 Docker（如未安装）  
✅ 检测并安装 Docker Compose（如未安装）  
✅ 配置环境变量（百度API密钥等）  
✅ 构建前端和后端镜像  
✅ 启动所有服务  

## 访问应用

部署完成后，在浏览器中访问：

- **前端界面**：`http://你的服务器IP`
- **后端API**：`http://你的服务器IP:4001`

## 如果需要手动配置环境变量

如果自动部署时没有配置，可以手动创建 `.env` 文件：

```bash
cd edu-game

# 创建环境变量文件
cat > .env <<EOF
BAIDU_API_KEY=xmEObbrYbzwfjX8Vn2ePiQXI
BAIDU_SECRET_KEY=DVTjYEKvImNmOpNNND9GOlQ0BIvzutGJ
AUTH_SECRET=my-secret-key-2024
ADMIN_PASSWORD=admin123
EOF

# 重新启动服务
docker-compose down
docker-compose up -d --build
```

## 常用管理命令

```bash
# 查看服务状态
docker-compose ps

# 查看实时日志
docker-compose logs -f

# 查看后端日志
docker-compose logs -f backend

# 查看前端日志
docker-compose logs -f frontend

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 更新应用（拉取最新代码）
git pull
docker-compose up -d --build
```

## 配置防火墙（如果需要）

```bash
# 开放80端口（前端）
sudo ufw allow 80/tcp

# 开放4001端口（后端API，可选）
sudo ufw allow 4001/tcp

# 重启防火墙
sudo ufw reload
```

## 配置域名（可选）

如果你有域名，可以配置：

```bash
# 安装 Nginx（如果需要反向代理）
sudo apt install nginx

# 或使用 Let's Encrypt 配置 HTTPS
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 故障排查

### 1. 端口被占用

```bash
# 检查80端口
sudo netstat -tulpn | grep :80

# 检查4001端口
sudo netstat -tulpn | grep :4001

# 停止占用端口的进程
sudo kill -9 进程ID
```

### 2. Docker 服务未启动

```bash
# 启动 Docker
sudo systemctl start docker

# 设置开机自启
sudo systemctl enable docker
```

### 3. 权限问题

如果遇到权限问题，确保当前用户在 docker 组中：

```bash
# 添加用户到 docker 组
sudo usermod -aG docker $USER

# 重新登录或刷新组权限
newgrp docker
```

### 4. 查看详细错误日志

```bash
# 查看容器日志
docker-compose logs backend
docker-compose logs frontend

# 进入容器排查
docker-compose exec backend sh
docker-compose exec frontend sh
```

## 性能优化建议

1. **使用 CDN**：将前端静态资源部署到 CDN
2. **开启 Gzip**：nginx 配置已默认开启
3. **配置缓存**：浏览器缓存和服务器缓存
4. **定期备份**：备份 Docker volume 中的数据

```bash
# 备份数据
docker run --rm -v edu-game_backend-data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz /data

# 恢复数据
docker run --rm -v edu-game_backend-data:/data -v $(pwd):/backup alpine tar xzf /backup/backup.tar.gz -C /
```

## 监控和维护

```bash
# 查看 Docker 资源使用
docker stats

# 清理未使用的镜像和容器
docker system prune -a

# 查看磁盘使用
df -h
```

## 技术支持

如遇问题，请查看：
- 详细部署文档：[DEPLOY.md](DEPLOY.md)
- 项目主页：https://gitee.com/dot123dot/edu-game
- 提交 Issue：https://gitee.com/dot123dot/edu-game/issues

---

🎉 **祝您部署顺利！**

