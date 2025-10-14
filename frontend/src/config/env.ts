const withTrailingSlash = (value: string) => {
  if (value.endsWith('/')) {
    return value.slice(0, -1);
  }
  return value;
};

// 自动检测 API URL
const getApiBaseUrl = () => {
  // 优先使用环境变量
  if (import.meta.env.VITE_API_BASE_URL) {
    return withTrailingSlash(import.meta.env.VITE_API_BASE_URL);
  }

  // 生产环境自动检测
  if (import.meta.env.PROD) {
    // 如果是 Zeabur 部署，尝试使用相对路径的后端服务
    const currentHost = window.location.host;
    if (currentHost.includes('zeabur.app')) {
      // Zeabur 环境，使用后端服务域名
      return `https://${currentHost.replace('frontend', 'backend').replace(/^[^.]+/, 'backend')}`;
    }
    // 其他生产环境，使用当前域名的 4001 端口
    return `${window.location.protocol}//${window.location.hostname}:4001`;
  }

  // 开发环境默认
  return 'http://localhost:4001';
};

const API_BASE_URL = getApiBaseUrl();
const SOCKET_URL = withTrailingSlash(import.meta.env.VITE_SOCKET_URL ?? API_BASE_URL);

export const env = {
  apiBaseUrl: API_BASE_URL,
  socketUrl: SOCKET_URL
};
