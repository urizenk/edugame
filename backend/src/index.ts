import cors from 'cors';
import express, { type ErrorRequestHandler } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import env from './config/env';
import authRouter from './routes/auth';
import speechRouter from './routes/speech';
import testRouter from './routes/test';

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

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: resolveCorsOrigin(),
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

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
