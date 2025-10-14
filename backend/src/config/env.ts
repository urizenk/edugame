import dotenv from 'dotenv';

dotenv.config();

const parsePort = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const env = {
  port: parsePort(process.env.PORT, 4001),
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
  baiduApiKey: process.env.BAIDU_API_KEY ?? '',
  baiduSecretKey: process.env.BAIDU_SECRET_KEY ?? '',
  baiduDevPid: parsePort(process.env.BAIDU_DEV_PID, 1537),
  baiduCuid: process.env.BAIDU_CUID,
  authSecret: process.env.AUTH_SECRET ?? '',
  adminPassword: process.env.ADMIN_PASSWORD
};

export default env;
