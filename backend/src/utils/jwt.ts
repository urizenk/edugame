import jwt from 'jsonwebtoken';
import env from '../config/env';

const ensureSecret = () => {
  if (!env.authSecret) {
    throw new Error('未配置 AUTH_SECRET，无法生成或校验令牌。');
  }
  return env.authSecret;
};

export interface JwtPayload {
  sub: string;
  role: 'teacher' | 'student';
}

export const signToken = (payload: JwtPayload) => {
  const secret = ensureSecret();
  return jwt.sign(payload, secret, { expiresIn: '8h' });
};

export const verifyToken = (token: string) => {
  const secret = ensureSecret();
  return jwt.verify(token, secret) as JwtPayload;
};
