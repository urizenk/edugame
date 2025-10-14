import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      role: 'teacher' | 'student';
    };
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '缺少身份凭证。' });
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.sub,
      role: payload.role
    };
    return next();
  } catch (error) {
    return res.status(401).json({ message: '身份凭证无效或已过期。' });
  }
};
