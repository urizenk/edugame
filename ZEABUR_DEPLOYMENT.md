# 🚀 Zeabur 部署指南

## 📋 部署前准备

### 1. 确保代码已推送到 GitHub
- 仓库地址：https://github.com/urizenk/edugame
- 确保 `main` 分支是最新的

### 2. 注册 Zeabur 账号
- 访问：https://zeabur.com
- 使用 GitHub 账号登录

---

## 🎯 **一键部署步骤**

### 步骤 1：创建项目
1. 登录 Zeabur Dashboard
2. 点击 **"New Project"**
3. 选择 **"Deploy from Git"**
4. 连接 GitHub 账号（如果还没连接）
5. 选择仓库：`urizenk/edugame`

### 步骤 2：部署后端服务
1. Zeabur 会自动检测到 `backend/Dockerfile`
2. 创建 **Backend** 服务：
   - **Service Name**: `backend`
   - **Root Directory**: `backend`
   - **Port**: `4001` (自动检测)

3. 配置环境变量（在 Backend 服务的 Variables 标签）：
   ```
   NODE_ENV=production
   PORT=4001
   CORS_ORIGIN=*
   BAIDU_API_KEY=xmEObbrYbzwfjX8Vn2ePiQXI
   BAIDU_SECRET_KEY=DVTjYEKvImNmOpNNND9GOlQ0BIvzutGJ
   BAIDU_DEV_PID=1537
   AUTH_SECRET=my-secret-key-2024
   ```

4. 点击 **"Deploy"** 开始部署

### 步骤 3：部署前端服务
1. 在同一个项目中，点击 **"Add Service"**
2. 选择 **"Git"** → 选择同一个仓库
3. 创建 **Frontend** 服务：
   - **Service Name**: `frontend`
   - **Root Directory**: `frontend`
   - **Port**: `80` (自动检测)

4. 配置环境变量（可选，前端会自动检测）：
   ```
   VITE_API_BASE_URL=https://你的后端域名.zeabur.app
   ```

5. 点击 **"Deploy"** 开始部署

### 步骤 4：获取访问域名
1. 部署完成后，每个服务都会获得一个域名
2. 前端域名：`https://你的项目名-frontend.zeabur.app`
3. 后端域名：`https://你的项目名-backend.zeabur.app`

---

## ⚙️ **详细配置说明**

### Backend 服务配置
```yaml
# 自动检测的配置
Root Directory: backend
Dockerfile: backend/Dockerfile
Port: 4001
Build Command: 自动检测
Start Command: npm start
```

### Frontend 服务配置
```yaml
# 自动检测的配置
Root Directory: frontend
Dockerfile: frontend/Dockerfile
Port: 80
Build Command: npm run build
Start Command: 自动检测 (nginx)
```

### 环境变量详解

#### Backend 必需环境变量：
- `NODE_ENV=production` - 生产环境标识
- `PORT=4001` - 服务端口
- `CORS_ORIGIN=*` - 跨域配置（生产环境建议设置具体域名）
- `BAIDU_API_KEY` - 百度语音识别 API Key
- `BAIDU_SECRET_KEY` - 百度语音识别 Secret Key
- `BAIDU_DEV_PID=1537` - 百度语音识别模型ID
- `AUTH_SECRET` - JWT 签名密钥

#### Frontend 可选环境变量：
- `VITE_API_BASE_URL` - 后端 API 地址（不设置会自动检测）

---

## 🔧 **部署后配置**

### 1. 自定义域名（可选）
1. 在服务的 **"Domains"** 标签中
2. 点击 **"Add Domain"**
3. 输入你的域名
4. 按照提示配置 DNS

### 2. 环境变量更新
1. 在服务的 **"Variables"** 标签中
2. 添加或修改环境变量
3. 保存后服务会自动重新部署

### 3. 查看日志
1. 在服务的 **"Logs"** 标签中查看实时日志
2. 用于调试部署问题

---

## 🚨 **常见问题解决**

### 问题 1：Backend 启动失败
**症状**：Backend 服务显示 "Failed" 状态

**解决方案**：
1. 检查 **Logs** 标签中的错误信息
2. 确认环境变量是否正确设置
3. 检查 `backend/Dockerfile` 是否正确

### 问题 2：Frontend 无法连接 Backend
**症状**：前端页面加载但 API 调用失败

**解决方案**：
1. 确认 Backend 服务已成功部署
2. 检查 Frontend 的环境变量 `VITE_API_BASE_URL`
3. 查看浏览器控制台的网络错误

### 问题 3：CORS 错误
**症状**：浏览器控制台显示跨域错误

**解决方案**：
1. 确认 Backend 的 `CORS_ORIGIN` 环境变量
2. 设置为 `*` 或具体的前端域名

### 问题 4：构建失败
**症状**：部署过程中构建失败

**解决方案**：
1. 检查 `package.json` 中的依赖
2. 确认 Node.js 版本兼容性
3. 查看构建日志中的具体错误

---

## 📊 **部署状态检查**

### 健康检查
- Backend: `https://你的后端域名.zeabur.app/health`
- Frontend: `https://你的前端域名.zeabur.app`

### 性能监控
- 在 Zeabur Dashboard 中查看服务的 CPU、内存使用情况
- 查看请求响应时间和错误率

---

## 🎉 **部署成功验证**

### 1. 访问前端应用
- 打开前端域名
- 确认页面正常加载
- 测试语音识别功能

### 2. 测试 API 接口
```bash
# 健康检查
curl https://你的后端域名.zeabur.app/health

# 测试语音接口（需要认证）
curl -X POST https://你的后端域名.zeabur.app/api/speech/recognize \
  -H "Content-Type: application/json" \
  -d '{"audio": "base64_audio_data"}'
```

### 3. 功能测试
- 测试语音气泡生成
- 测试气泡拖拽功能
- 测试语音识别功能

---

## 🔄 **更新部署**

### 自动部署
- 推送代码到 GitHub `main` 分支
- Zeabur 会自动检测并重新部署

### 手动部署
1. 在 Zeabur Dashboard 中
2. 点击服务的 **"Redeploy"** 按钮

---

## 💡 **最佳实践**

### 1. 环境变量管理
- 敏感信息（如 API Key）使用 Zeabur 的环境变量功能
- 不要在代码中硬编码敏感信息

### 2. 域名配置
- 使用自定义域名提升用户体验
- 配置 HTTPS（Zeabur 自动提供）

### 3. 监控和日志
- 定期查看服务日志
- 监控服务性能指标

### 4. 备份策略
- 定期备份重要数据
- 使用 Git 管理代码版本

---

## 📞 **获取帮助**

- Zeabur 文档：https://zeabur.com/docs
- Zeabur Discord：https://discord.gg/zeabur
- GitHub Issues：在项目仓库中提交问题

---

## 🎯 **快速部署命令总结**

1. **访问 Zeabur**: https://zeabur.com
2. **New Project** → **Deploy from Git**
3. **选择仓库**: `urizenk/edugame`
4. **配置 Backend 环境变量**
5. **添加 Frontend 服务**
6. **等待部署完成**
7. **访问前端域名测试**

**预计部署时间：5-10 分钟** ⏱️
