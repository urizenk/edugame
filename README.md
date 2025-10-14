# 快乐课堂·语音创想 🎨

> 学前教育语音词云教学应用 - 让孩子们的声音变成彩色气泡

一个专为学前教育设计的互动教学工具，教师通过语音或文字收集孩子们的想法，转化为可爱的彩色气泡，支持拖拽排序和分组讨论。适用于触摸屏、一体机等大屏设备。

## ✨ 特性

- 🎤 **语音识别**：集成百度语音识别API，实时将语音转为文字气泡
- 💬 **文字输入**：支持直接文字输入创建气泡
- 🫧 **可爱气泡**：温暖流动的色彩设计，富有童趣
- 🎯 **拖拽排序**：直观的拖拽操作，支持气泡排序和管理
- 🌈 **双区布局**：集趣池（想法收集）+ 排序舞台（讨论排序）
- 🎨 **流动背景**：专业的模糊色彩流动效果
- 📱 **响应式设计**：适配各种屏幕尺寸

## 🏗️ 技术栈

### 前端
- React 18 + TypeScript
- Tailwind CSS（样式）
- D3.js（数据可视化）
- Socket.IO Client（实时通信）
- Zustand（状态管理）
- Framer Motion（动画）

### 后端
- Node.js + Express
- TypeScript
- Socket.IO（WebSocket）
- Baidu Speech API（语音识别）
- SQLite（数据持久化）

### 部署
- Docker + Docker Compose
- Nginx（Web服务器）

## 📦 项目结构

```
edu-game/
├── frontend/          # React前端应用
├── backend/           # Node.js后端服务
├── .kiro/            # 设计文档和需求说明
├── docker-compose.yml # Docker编排配置
├── deploy.sh         # 一键部署脚本
└── DEPLOY.md         # 详细部署文档
```

## 🚀 快速开始

### 方式一：Docker 部署（推荐用于生产环境）

**在 Ubuntu 20.04 服务器上一键部署：**

```bash
# 1. 克隆项目
git clone https://gitee.com/dot123dot/edu-game.git
cd edu-game

# 2. 运行一键部署脚本
chmod +x deploy.sh
./deploy.sh
```

脚本会自动：
- 安装 Docker 和 Docker Compose（如果未安装）
- 配置环境变量
- 构建并启动所有服务

**手动 Docker 部署：**

```bash
# 1. 创建 .env 文件
cat > .env <<EOF
BAIDU_API_KEY=your_api_key
BAIDU_SECRET_KEY=your_secret_key
AUTH_SECRET=my-secret-key-2024
ADMIN_PASSWORD=admin123
EOF

# 2. 启动服务
docker-compose up -d --build

# 3. 查看日志
docker-compose logs -f
```

访问：
- 前端：`http://你的服务器IP`
- 后端：`http://你的服务器IP:4001`

### 方式二：本地开发

**1. 启动后端：**

```bash
cd backend
npm install
cp .env.example .env   # 配置百度API密钥
npm run dev            # 开发模式
```

后端运行在 `http://localhost:4001`

**2. 启动前端：**

```bash
cd frontend
npm install
npm run dev            # 开发模式
```

前端运行在 `http://localhost:5173`

## 🔑 环境变量配置

创建 `.env` 文件并配置以下变量：

```env
# 百度语音识别API（必需）
BAIDU_API_KEY=your_baidu_api_key
BAIDU_SECRET_KEY=your_baidu_secret_key

# 认证密钥（可选）
AUTH_SECRET=my-secret-key-2024

# 管理员密码（可选）
ADMIN_PASSWORD=admin123
```

## 📖 使用说明

1. **创建气泡**
   - 点击语音按钮开始录音，说出想法
   - 或直接在文字输入框输入内容
   - 气泡自动添加到"集趣池"

2. **管理气泡**
   - 点击气泡添加到"排序舞台"
   - 拖拽气泡到排序舞台
   - 鼠标悬停显示删除按钮

3. **排序讨论**
   - 使用 ⬆️ ⬇️ 按钮调整顺序
   - 点击 ❌ 从排序舞台移除

## 🐳 Docker 命令参考

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 重新构建
docker-compose up -d --build

# 查看状态
docker-compose ps
```

## 📚 详细文档

- [部署文档](DEPLOY.md) - 完整的部署指南
- [后端配置](backend/配置说明.md) - 后端配置详解
- [设计文档](.kiro/specs/voice-wordcloud-teaching/design.md) - 架构设计

## 🛣️ 未来规划

- [ ] 多教室/多班级支持
- [ ] 数据持久化和历史记录
- [ ] 导出课堂讨论内容
- [ ] 更多语音识别引擎支持
- [ ] 移动端适配优化
- [ ] 多人协作模式

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 开源协议

MIT License

## 👨‍💻 作者

Created with ❤️ for preschool education

---

**快速部署到阿里云：**

```bash
# SSH 连接到服务器
ssh user@your-server-ip

# 克隆并部署
git clone https://gitee.com/dot123dot/edu-game.git
cd edu-game
chmod +x deploy.sh
./deploy.sh
```
