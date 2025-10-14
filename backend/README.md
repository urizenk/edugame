# Backend Service

Express + Socket.IO API that exposes classroom endpoints, Baidu speech recognition proxy, and simple authentication endpoints.

## Quick Start

```bash
npm install
cp .env.example .env   # 填写百度语音及认证相关变量
npm run dev
```

The server listens on `http://localhost:4000` by default and exposes:

- `GET /health` – health check.
- `POST /api/auth/login` – teacher/student login, returns JWT token + user info.
- `GET /api/auth/profile` – fetch current user profile（需携带 Bearer Token）。
- `GET /api/auth/groups` – 列出九个内置小组账号。
- `POST /api/speech/recognize` – submit Base64 WAV (16 kHz) for Baidu ASR.
- Socket.IO namespace `/` – reserved for realtime classroom events (pending).

## Environment Variables

Copy `.env.example` and fill:

- `BAIDU_API_KEY`, `BAIDU_SECRET_KEY` – 百度智能云语音识别密钥。
- `BAIDU_CUID` _(可选)_ – 课堂/设备标识。
- `BAIDU_DEV_PID` _(可选)_ – 识别模型，默认 `1537`。
- `AUTH_SECRET` – JWT 签名秘钥（请使用随机的高强度字符串）。
- `ADMIN_PASSWORD` _(可选)_ – 自定义老师账号密码，默认 `admin123`。

> **安全提示**：请勿将真实密钥提交到版本库，保持 `.env` 本地管理。

## Scripts

- `npm run dev` – start development server with auto reload.
- `npm run build` – compile TypeScript to `dist/`.
- `npm start` – run compiled bundle.
- `npm run typecheck` – type check without emitting files。
