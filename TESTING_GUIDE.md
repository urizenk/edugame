# 🧪 教育游戏项目 - 测试指南

## 📋 概述

本项目包含完整的测试服务，用于验证前后端功能的正常运行。测试服务包括：

- **后端测试API** - 系统健康检查、环境配置验证、第三方服务连接测试
- **前端测试面板** - 可视化测试界面，实时显示测试结果
- **集成测试脚本** - 自动化测试脚本，支持本地和远程部署测试

---

## 🚀 快速开始

### 1. 启动服务
```bash
# 启动后端
cd backend
npm run dev

# 启动前端
cd frontend
npm run dev
```

### 2. 访问测试面板
- 打开前端应用：http://localhost:5173
- 测试面板会自动显示在右上角（仅开发环境）

### 3. 运行集成测试
```bash
# 在项目根目录
node test-system.js
```

---

## 🔧 后端测试API

### 基础路径
```
http://localhost:4001/api/test
```

### 可用端点

#### 1. 健康检查
```http
GET /api/test/health
```
**响应示例:**
```json
{
  "status": "ok",
  "timestamp": "2024-10-14T12:00:00.000Z",
  "uptime": 3600,
  "memory": {
    "rss": 50331648,
    "heapTotal": 20971520,
    "heapUsed": 15728640
  },
  "environment": "development"
}
```

#### 2. 环境变量检查
```http
GET /api/test/env-check
```
**响应示例:**
```json
{
  "status": "ok",
  "message": "所有环境变量已正确配置",
  "config": {
    "port": 4001,
    "corsOrigin": "*",
    "baiduApiKey": "已配置",
    "baiduSecretKey": "已配置",
    "baiduDevPid": 1537,
    "authSecret": "已配置",
    "nodeEnv": "development"
  }
}
```

#### 3. 百度API连接测试
```http
GET /api/test/baidu-test
```
**响应示例:**
```json
{
  "status": "ok",
  "message": "百度API连接正常",
  "tokenLength": 32,
  "timestamp": "2024-10-14T12:00:00.000Z"
}
```

#### 4. 数据库连接测试
```http
GET /api/test/database-test
```
**响应示例:**
```json
{
  "status": "ok",
  "message": "当前项目未使用数据库",
  "timestamp": "2024-10-14T12:00:00.000Z"
}
```

#### 5. 完整系统测试
```http
GET /api/test/full-test
```
**响应示例:**
```json
{
  "status": "ok",
  "message": "测试完成，4项测试",
  "summary": {
    "total": 4,
    "passed": 4,
    "warnings": 0,
    "errors": 0,
    "skipped": 0
  },
  "results": {
    "timestamp": "2024-10-14T12:00:00.000Z",
    "tests": [
      {
        "name": "系统健康检查",
        "status": "ok",
        "message": "系统运行正常"
      }
    ]
  }
}
```

#### 6. 模拟语音识别测试
```http
POST /api/test/mock-speech-test
Content-Type: application/json

{
  "text": "这是一个测试文本"
}
```
**响应示例:**
```json
{
  "status": "ok",
  "message": "模拟语音识别成功",
  "result": {
    "text": "这是一个测试文本",
    "confidence": 0.95,
    "timestamp": "2024-10-14T12:00:00.000Z",
    "mockData": true
  }
}
```

---

## 🎨 前端测试面板

### 功能特性

#### 1. 系统状态显示
- 实时显示后端服务状态
- 显示系统运行时间
- 显示内存使用情况
- 显示当前环境信息

#### 2. 测试操作
- **连接测试** - 测试前后端连接
- **逐步测试** - 逐个运行所有测试项
- **完整测试** - 一次性运行所有测试
- **刷新状态** - 更新系统状态信息

#### 3. 结果显示
- 彩色状态指示器
- 详细错误信息
- 可折叠的详细信息
- 实时测试进度

### 状态说明

| 状态    | 图标 | 颜色 | 说明         |
| ------- | ---- | ---- | ------------ |
| ok      | ✅    | 绿色 | 测试通过     |
| warning | ⚠️    | 黄色 | 有警告但可用 |
| error   | ❌    | 红色 | 测试失败     |
| loading | 🔄    | 蓝色 | 测试进行中   |
| skip    | ⏭️    | 灰色 | 跳过测试     |

---

## 🤖 集成测试脚本

### 基本用法
```bash
# 本地测试
node test-system.js

# 显示帮助
node test-system.js --help
```

### 环境变量配置
```bash
# 测试远程部署
BACKEND_HOST=your-backend.railway.app \
BACKEND_PROTOCOL=https \
FRONTEND_HOST=your-frontend.vercel.app \
FRONTEND_PROTOCOL=https \
node test-system.js
```

### 支持的环境变量

| 变量名            | 默认值    | 说明         |
| ----------------- | --------- | ------------ |
| BACKEND_HOST      | localhost | 后端主机地址 |
| BACKEND_PORT      | 4001      | 后端端口     |
| BACKEND_PROTOCOL  | http      | 后端协议     |
| FRONTEND_HOST     | localhost | 前端主机地址 |
| FRONTEND_PORT     | 8080      | 前端端口     |
| FRONTEND_PROTOCOL | http      | 前端协议     |

### 测试项目

1. **后端健康检查** - 验证后端服务是否正常运行
2. **后端API测试** - 测试所有API端点
3. **前端服务测试** - 验证前端页面是否可访问
4. **CORS配置测试** - 验证跨域配置是否正确
5. **模拟语音识别测试** - 测试语音识别模拟功能

### 输出示例
```
╔══════════════════════════════════════╗
║        教育游戏项目 - 系统测试        ║
╚══════════════════════════════════════╝

ℹ 开始系统集成测试...
ℹ 后端地址: http://localhost:4001
ℹ 前端地址: http://localhost:8080

==================================================

📋 后端健康检查
------------------------------
🧪 测试后端健康检查...
✅ 后端健康检查通过
ℹ 耗时: 45ms

📋 后端API测试
------------------------------
🧪 测试后端API接口...
✅ 健康检查API - 通过
✅ 环境变量检查API - 通过
✅ 百度API测试 - 通过
✅ 完整测试API - 通过
ℹ API测试完成: 4/4 通过
ℹ 耗时: 234ms

==================================================
📊 测试总结
==================================================
后端健康检查: ✅ 通过 (45ms)
后端API测试: ✅ 通过 (234ms)
前端服务测试: ✅ 通过 (67ms)
CORS配置测试: ✅ 通过 (23ms)
模拟语音识别测试: ✅ 通过 (89ms)

总计: 5/5 测试通过
✅ 🎉 所有测试通过！系统运行正常！
```

---

## 🔍 故障排查

### 常见问题

#### 1. 后端连接失败
**症状**: `ECONNREFUSED` 错误
**解决方案**:
- 确认后端服务已启动
- 检查端口是否正确
- 检查防火墙设置

#### 2. 环境变量未配置
**症状**: 环境变量检查显示"未配置"
**解决方案**:
- 检查 `.env` 文件
- 确认环境变量名称正确
- 重启服务以加载新的环境变量

#### 3. 百度API测试失败
**症状**: API连接测试返回错误
**解决方案**:
- 验证API Key和Secret Key是否正确
- 检查网络连接
- 确认百度API配额是否充足

#### 4. CORS错误
**症状**: 前端无法访问后端API
**解决方案**:
- 检查后端CORS配置
- 确认前端域名在允许列表中
- 检查请求头设置

#### 5. 前端测试面板不显示
**症状**: 开发环境下看不到测试面板
**解决方案**:
- 确认是在开发环境 (`npm run dev`)
- 检查浏览器控制台错误
- 确认TestPanel组件已正确导入

---

## 📈 性能监控

### 内存使用监控
测试服务会监控以下内存指标：
- **RSS** - 常驻内存集
- **Heap Total** - 堆总大小
- **Heap Used** - 已使用堆内存
- **External** - 外部内存使用

### 响应时间监控
集成测试脚本会记录每个测试的响应时间，帮助识别性能问题。

### 建议阈值
- **内存使用** < 100MB (正常)
- **API响应时间** < 500ms (良好)
- **页面加载时间** < 2s (可接受)

---

## 🚀 CI/CD 集成

### GitHub Actions 示例
```yaml
name: System Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend && npm ci
      
      - name: Start services
        run: |
          cd backend && npm run build && npm start &
          cd frontend && npm run build && npm run preview &
          sleep 10
      
      - name: Run integration tests
        run: node test-system.js
```

### Docker 测试
```bash
# 使用Docker Compose运行测试
docker-compose up -d
sleep 30
node test-system.js
docker-compose down
```

---

## 📝 测试最佳实践

### 1. 定期运行测试
- 每次代码提交前运行本地测试
- 部署前运行完整集成测试
- 定期运行生产环境健康检查

### 2. 监控关键指标
- 服务可用性
- API响应时间
- 内存使用情况
- 错误率

### 3. 测试环境管理
- 保持测试环境与生产环境一致
- 使用真实的测试数据
- 定期更新测试用例

### 4. 错误处理
- 记录详细的错误信息
- 实现优雅的错误恢复
- 设置适当的超时时间

---

## 🤝 贡献指南

### 添加新测试
1. 在 `backend/src/routes/test.ts` 中添加新的测试端点
2. 在 `frontend/src/components/TestPanel.tsx` 中添加对应的前端测试
3. 在 `test-system.js` 中添加集成测试
4. 更新本文档

### 测试命名规范
- 测试端点：`/api/test/功能名-test`
- 测试函数：`test功能名()`
- 测试描述：简洁明了，说明测试目的

---

## 📞 获取帮助

如果遇到测试相关问题：

1. 查看测试日志和错误信息
2. 检查本文档的故障排查部分
3. 运行 `node test-system.js --help` 查看帮助
4. 在项目仓库中提交Issue

---

## 📄 许可证

本测试服务遵循项目的整体许可证。
