const withTrailingSlash = (value: string) => {
  if (value.endsWith('/')) {
    return value.slice(0, -1);
  }
  return value;
};

const API_BASE_URL = withTrailingSlash(import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4001');
const SOCKET_URL = withTrailingSlash(import.meta.env.VITE_SOCKET_URL ?? API_BASE_URL);

export const env = {
  apiBaseUrl: API_BASE_URL,
  socketUrl: SOCKET_URL
};
