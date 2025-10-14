# 🚀 更好的免费部署方案

## ⚠️ **Zeabur 限制说明**
- **免费计划**：只支持 Serverless 部署
- **Docker 部署**：需要付费计划
- **我们的项目**：使用 Docker，不适合免费计划

---

## 🎯 **推荐方案：Vercel + Railway**

### **优势：**
- ✅ **完全免费**
- ✅ **性能更好**
- ✅ **部署更稳定**
- ✅ **国内访问快**

---

## 🚀 **方案1：Vercel（前端）+ Railway（后端）**

### **步骤1：部署前端到 Vercel**

1. **访问 Vercel**：https://vercel.com
2. **导入项目**：
   - 点击 "New Project"
   - 选择 GitHub 仓库：`urizenk/edugame`
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **环境变量**（可选）：
   ```
   VITE_API_BASE_URL=https://你的railway后端域名.railway.app
   ```

4. **部署**：点击 "Deploy"

### **步骤2：部署后端到 Railway**

1. **访问 Railway**：https://railway.app
2. **创建项目**：
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择 `urizenk/edugame`
   - **Root Directory**: `backend`

3. **环境变量**：
   ```
   NODE_ENV=production
   PORT=4001
   CORS_ORIGIN=*
   BAIDU_API_KEY=xmEObbrYbzwfjX8Vn2ePiQXI
   BAIDU_SECRET_KEY=DVTjYEKvImNmOpNNND9GOlQ0BIvzutGJ
   BAIDU_DEV_PID=1537
   AUTH_SECRET=my-secret-key-2024
   ```

4. **部署**：Railway 自动检测 Dockerfile 并部署

---

## 🚀 **方案2：Netlify（前端）+ Render（后端）**

### **前端 → Netlify**
1. **访问**：https://netlify.com
2. **导入仓库**：选择 `urizenk/edugame`
3. **配置**：
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`

### **后端 → Render**
1. **访问**：https://render.com
2. **New Web Service**
3. **连接仓库**：`urizenk/edugame`
4. **配置**：
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

---

## 🚀 **方案3：全部部署到 Railway**

**最简单的方案！**

1. **访问 Railway**：https://railway.app
2. **New Project** → **Deploy from GitHub repo**
3. **选择仓库**：`urizenk/edugame`
4. **添加两个服务**：
   - Service 1: Backend (Root: `backend`)
   - Service 2: Frontend (Root: `frontend`)

---

## 🎯 **推荐配置（最佳方案）**

### **Vercel（前端）+ Railway（后端）**

**为什么这个组合最好？**
- **Vercel**：全球 CDN，前端加载超快
- **Railway**：支持 Docker，后端稳定
- **都免费**：无需付费
- **自动部署**：Git push 自动更新

---

## 📋 **详细部署步骤**

### **1. 部署前端到 Vercel**

```bash
# 1. 访问 https://vercel.com
# 2. 点击 "New Project"
# 3. Import Git Repository
# 4. 选择 urizenk/edugame
# 5. 配置：
#    - Root Directory: frontend
#    - Framework: Vite
#    - Build Command: npm run build
#    - Output Directory: dist
# 6. 点击 Deploy
```

### **2. 部署后端到 Railway**

```bash
# 1. 访问 https://railway.app
# 2. 点击 "New Project"
# 3. Deploy from GitHub repo
# 4. 选择 urizenk/edugame
# 5. 设置 Root Directory: backend
# 6. 添加环境变量（见上面列表）
# 7. 点击 Deploy
```

### **3. 连接前后端**

1. **获取 Railway 后端域名**：`https://xxx.railway.app`
2. **在 Vercel 中设置环境变量**：
   ```
   VITE_API_BASE_URL=https://xxx.railway.app
   ```
3. **重新部署 Vercel 前端**

---

## ⏱ **部署时间对比**

| 平台 | 前端部署 | 后端部署 | 总时间 |
|------|----------|----------|---------|
| Vercel + Railway | 2分钟 | 3分钟 | 5分钟 |
| Netlify + Render | 3分钟 | 4分钟 | 7分钟 |
| Railway 全部 | 3分钟 | 3分钟 | 6分钟 |

---

## 🎊 **立即开始部署**

### **最快方案：Railway 全部部署**

1. **访问**：https://railway.app
2. **New Project**
3. **选择仓库**：`urizenk/edugame`
4. **添加两个服务**
5. **配置环境变量**
6. **5分钟完成！**

### **最优方案：Vercel + Railway**

1. **前端**：https://vercel.com
2. **后端**：https://railway.app
3. **性能最佳**
4. **7分钟完成！**

---

## 💡 **为什么不用 Zeabur？**

- ❌ 免费计划不支持 Docker
- ❌ 需要付费才能部署我们的项目
- ❌ 限制较多

**Railway/Vercel 更适合我们的项目！** 🎯
