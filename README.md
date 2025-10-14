# Voice Wordcloud Teaching App

Web-based classroom tool for teachers to collect kids’ spoken ideas as colorful bubbles, drag them into a priority list, and drive playful discussions on a large touchscreen or all-in-one device.

## Workspace Layout

- `frontend/` – React + TypeScript playground with Tailwind styling, real-time speech bubbles, and a dual-zone layout (idea pool + sorting stage).
- `backend/` – Express + Socket.IO scaffold exposing Baidu speech recognition proxy (auth endpoints remain available but are optional).
- `.kiro/` – Original design and requirement specs for reference.

## Getting Started

1. **Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env   # 填写 BAIDU_*、AUTH_SECRET 等
   npm run dev
   ```
   The server listens on `http://localhost:4000` (health check at `/health`).

2. **Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.example .env   # 调整 API/Socket 地址
   npm run dev
   ```
   Vite serves the playground at `http://localhost:5173`.

Run both services to experience the teacher-focused bubble playground: speak to create bubbles, then drag or click them into the sorting stage and adjust the order together with the class. Future sprints can reuse the backend scaffold to add persistence, analytics, or multi-role flows if needed.

## Next Ideas

- Persist bubble lists per session (SQLite integration).
- Broadcast bubble updates via Socket.IO for multi-screen setups.
- Export sorted lists or generate printable summaries for lesson plans.

Feel free to customise visuals, add mini-games, or plug in alternate speech APIs—the structure leaves room for playful experimentation.
