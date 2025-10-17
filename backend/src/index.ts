import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import env from './config/env';
import authRouter from './routes/auth';
import speechRouter from './routes/speech';
import testRouter from './routes/test';
import bubblesRouter from './routes/bubbles';

const app = express();

const resolveCorsOrigin = () => {
  if (!env.corsOrigin || env.corsOrigin === '*') {
    return true;
  }

  return env.corsOrigin.split(',').map((origin) => origin.trim());
};

app.use(
  cors({
    origin: resolveCorsOrigin(),
    credentials: true
  })
);

app.use(
  express.json({
    limit: '10mb'
  })
);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
app.use('/api/speech', speechRouter);
app.use('/api/test', testRouter);
app.use('/api/bubbles', bubblesRouter);

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: resolveCorsOrigin(),
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // 新客户端连接时，发送当前数据
  const { bubbleData } = require('./routes/bubbles');
  socket.emit('bubbles:sync', bubbleData);

  // 监听客户端的数据更新
  socket.on('bubbles:update', (data) => {
    console.log(`Received bubbles update from ${socket.id}`);
    const { updateBubbleData } = require('./routes/bubbles');
    
    // 更新服务器数据
    const updated = updateBubbleData(data);
    
    // 广播给所有其他客户端
    socket.broadcast.emit('bubbles:sync', updated);
    
    // 确认给发送者
    socket.emit('bubbles:updated', { success: true });
  });

  socket.on('disconnect', (reason) => {
    console.log(`Socket disconnected: ${socket.id} (${reason})`);
  });
});

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error('Unhandled error:', error);
  const message = error instanceof Error ? error.message : '服务器内部错误';
  return res.status(500).json({ message });
};

app.use(errorHandler);

export const startServer = () => {
  httpServer.listen(env.port, () => {
    console.log(`Backend listening on http://localhost:${env.port}`);
  });
};

if (require.main === module) {
  startServer();
}

export { app, io };
