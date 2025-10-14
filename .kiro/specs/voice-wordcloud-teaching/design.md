# 语音词云教学应用设计文档

## 概述

本应用是一个基于Web的实时协作教学工具，支持语音/文字输入、词云可视化、拖拽投票和统计分析。采用前后端分离架构，支持多设备访问和实时数据同步。

## 架构设计

### 整体架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端应用      │    │   后端服务      │    │   数据存储      │
│                 │    │                 │    │                 │
│ React + D3.js   │◄──►│ Node.js + WS    │◄──►│ SQLite + 内存   │
│ 响应式UI + 2D   │    │ 实时通信 + API  │    │ 轻量级存储      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 技术栈选择

**前端技术栈:**
- **React 18**: 组件化开发，支持并发特性
- **TypeScript**: 类型安全，提高代码质量
- **D3.js**: 2D数据可视化和词云布局
- **Socket.IO Client**: 实时通信
- **Zustand**: 轻量级状态管理
- **Tailwind CSS**: 快速样式开发
- **Framer Motion**: 流畅CSS动画效果

**后端技术栈:**
- **Node.js + Express**: 轻量级Web服务
- **Socket.IO**: WebSocket实时通信（单班级）
- **SQLite**: 轻量级数据库存储
- **内存状态**: 实时数据直接存储在内存
- **简单认证**: 基于用户名的简单认证

**语音识别服务:**
- **主要方案**: Web Speech API (浏览器原生)
- **备选方案**: 百度语音API / 讯飞语音API

## 组件和接口设计

### 前端组件架构

```
App
├── AuthProvider (认证上下文)
├── SocketProvider (WebSocket连接)
├── Router
    ├── LoginPage (登录页面)
    ├── TeacherDashboard (老师界面)
    │   ├── ClassWordCloud (班级词云)
    │   ├── GroupManagement (小组管理)
    │   └── StatisticsPanel (统计面板)
    └── StudentDashboard (学生界面)
        ├── InputPanel (输入面板)
        │   ├── VoiceInput (语音输入)
        │   └── TextInput (文字输入)
        ├── ClassWordCloud (班级词云)
        └── GroupWordCloud (小组词云)
```

### 核心组件设计

#### 1. WordCloud2D 组件
```typescript
interface WordCloud2DProps {
  words: WordItem[];
  onWordDrag: (wordId: string, position: Position2D) => void;
  onWordDrop: (wordId: string, targetZone: 'class' | 'group') => void;
  interactive: boolean;
  theme: 'class' | 'group';
}

interface WordItem {
  id: string;
  text: string;
  weight: number;
  position: Position2D;
  color: string;
  groupId?: string;
}

interface Position2D {
  x: number;
  y: number;
}
```

#### 2. VoiceInput 组件
```typescript
interface VoiceInputProps {
  onResult: (text: string) => void;
  onError: (error: string) => void;
  language: string;
  continuous: boolean;
}
```

#### 3. RealTimeSync 服务
```typescript
class RealTimeSyncService {
  connect(classId: string, userId: string): void;
  sendWordUpdate(word: WordItem): void;
  sendDragUpdate(wordId: string, position: Position2D): void;
  onWordAdded(callback: (word: WordItem) => void): void;
  onWordMoved(callback: (wordId: string, position: Position2D) => void): void;
}
```

### API接口设计

#### REST API端点

```typescript
// 认证相关
POST /api/auth/login
GET  /api/auth/profile

// 小组管理（仅老师）
GET    /api/groups
POST   /api/groups
PUT    /api/groups/:groupId
DELETE /api/groups/:groupId

// 词汇管理
GET    /api/words
POST   /api/words
DELETE /api/words/:wordId

// 统计数据
GET    /api/statistics
```

#### WebSocket事件

```typescript
// 客户端发送事件
interface ClientEvents {
  'join': (username: string, groupId?: string) => void;
  'add-word': (text: string) => void;
  'drag-word': (wordId: string, position: Position2D) => void;
  'drop-word': (wordId: string, groupId?: string) => void;
}

// 服务端发送事件
interface ServerEvents {
  'word-added': (word: WordItem) => void;
  'word-moved': (wordId: string, position: Position2D) => void;
  'word-dropped': (wordId: string, groupId?: string) => void;
  'user-joined': (username: string) => void;
  'user-left': (username: string) => void;
}
```

## 数据模型

### 用户模型
```typescript
interface User {
  username: string;
  role: 'teacher' | 'student';
  groupId?: string;
}
```

### 小组模型
```typescript
interface Group {
  id: string; // 'group1' 到 'group9'
  name: string; // '小组1' 到 '小组9'
  username: string; // 'group1' 到 'group9'
  password: string; // 可由老师修改的密码
  selectedWords: string[]; // 拖拽到小组的词汇ID
  isBuiltIn: boolean; // 标识为内置小组，不可删除
}

// 系统初始化时创建的九个内置小组
const BUILT_IN_GROUPS: Group[] = [
  { id: 'group1', name: '小组1', username: 'group1', password: '123456', selectedWords: [], isBuiltIn: true },
  { id: 'group2', name: '小组2', username: 'group2', password: '123456', selectedWords: [], isBuiltIn: true },
  { id: 'group3', name: '小组3', username: 'group3', password: '123456', selectedWords: [], isBuiltIn: true },
  { id: 'group4', name: '小组4', username: 'group4', password: '123456', selectedWords: [], isBuiltIn: true },
  { id: 'group5', name: '小组5', username: 'group5', password: '123456', selectedWords: [], isBuiltIn: true },
  { id: 'group6', name: '小组6', username: 'group6', password: '123456', selectedWords: [], isBuiltIn: true },
  { id: 'group7', name: '小组7', username: 'group7', password: '123456', selectedWords: [], isBuiltIn: true },
  { id: 'group8', name: '小组8', username: 'group8', password: '123456', selectedWords: [], isBuiltIn: true },
  { id: 'group9', name: '小组9', username: 'group9', password: '123456', selectedWords: [], isBuiltIn: true }
];

// 管理员账号
const ADMIN_USER = {
  username: 'admin',
  password: 'admin123',
  role: 'teacher'
};
```

### 词汇模型
```typescript
interface WordItem {
  id: string;
  text: string;
  createdBy: string;
  weight: number; // 出现频次
  position: Position2D;
  color: string;
  groupSelections: GroupSelection[]; // 被哪些小组选择
  createdAt: Date;
}

interface GroupSelection {
  groupId: string;
  selectedAt: Date;
  position: Position2D; // 在小组词云中的位置
}
```

## 错误处理

### 前端错误处理策略

1. **网络错误**: 自动重连机制，显示离线状态
2. **语音识别错误**: 降级到文字输入，显示友好提示
3. **词云渲染错误**: 降级到简单列表模式，保证基本功能
4. **实时同步错误**: 本地缓存 + 重新同步机制

### 后端错误处理

1. **数据库连接错误**: 连接池重试 + 健康检查
2. **WebSocket连接错误**: 自动重连 + 状态恢复
3. **并发冲突**: 乐观锁 + 冲突解决算法
4. **资源限制**: 限流 + 优雅降级

## 测试策略

### 单元测试
- **组件测试**: React Testing Library
- **工具函数测试**: Jest
- **API测试**: Supertest
- **WebSocket测试**: Socket.IO测试工具

### 集成测试
- **端到端测试**: Playwright
- **实时协作测试**: 多浏览器并发测试
- **语音识别测试**: 模拟音频输入
- **3D渲染测试**: 视觉回归测试

### 性能测试
- **并发用户测试**: 模拟9个小组同时使用
- **内存泄漏测试**: 长时间运行监控
- **网络延迟测试**: 不同网络条件下的表现
- **设备兼容测试**: 不同设备和浏览器测试

## 安全考虑

### 认证授权
- JWT Token认证
- 角色权限控制
- 会话超时管理

### 数据安全
- 输入内容过滤和验证
- XSS防护
- CSRF保护
- 敏感词过滤

### 网络安全
- HTTPS强制使用
- WebSocket安全连接
- 请求频率限制
- IP白名单（可选）

## 性能优化

### 前端优化
- **代码分割**: 按路由和组件懒加载
- **3D渲染优化**: LOD技术，减少不必要的渲染
- **状态管理优化**: 避免不必要的重渲染
- **缓存策略**: Service Worker缓存静态资源

### 后端优化
- **数据库优化**: SQLite索引优化，简单查询优化
- **缓存策略**: 内存缓存热点数据
- **WebSocket优化**: 简单连接管理，消息批处理
- **静态资源**: 本地静态文件服务

### 实时同步优化
- **消息去重**: 避免重复消息
- **批量更新**: 合并频繁的位置更新
- **优先级队列**: 重要消息优先处理
- **增量同步**: 只同步变化的数据

## 部署架构

### 开发环境
```
本地开发 → Docker容器 → 热重载
```

### 生产环境
```
单机部署 → Node.js服务 → SQLite数据库
     ↓
   本地静态文件服务
```

### 监控和日志
- **应用监控**: PM2 + 性能指标
- **错误追踪**: Sentry错误收集
- **日志管理**: Winston + ELK Stack
- **实时监控**: Grafana + Prometheus