import os from 'node:os';
import { Buffer } from 'node:buffer';
import env from '../config/env';

interface RecognizeOptions {
  audioBase64: string;
  sampleRate?: number;
  format?: 'pcm' | 'wav' | 'amr';
}

interface BaiduTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
}

interface BaiduRecognizeResponse {
  err_no: number;
  err_msg: string;
  sn?: string;
  result?: string[];
}

interface SpeechRecognizeResult {
  text: string;
  raw: string[];
  requestId?: string;
}

type TokenCache = {
  token: string;
  expiresAt: number;
} | null;

const TOKEN_ENDPOINT = 'https://aip.baidubce.com/oauth/2.0/token';
const SPEECH_ENDPOINT = 'https://vop.baidu.com/server_api';

let tokenCache: TokenCache = null;

const getCuid = () => env.baiduCuid || os.hostname();

const needsRefresh = () => {
  if (!tokenCache) {
    return true;
  }
  const safetyWindow = 60 * 5 * 1000; // 5 minutes
  return Date.now() >= tokenCache.expiresAt - safetyWindow;
};

export const getAccessToken = async () => {
  if (!env.baiduApiKey || !env.baiduSecretKey) {
    throw new Error('未配置百度语音识别密钥（BAIDU_API_KEY / BAIDU_SECRET_KEY）。');
  }

  if (!needsRefresh()) {
    return tokenCache!.token;
  }

  const params = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: env.baiduApiKey,
    client_secret: env.baiduSecretKey
  });

  const response = await fetch(`${TOKEN_ENDPOINT}?${params.toString()}`, {
    method: 'POST'
  });

  if (!response.ok) {
    throw new Error(`请求百度 Token 失败：${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as BaiduTokenResponse;

  if (!data.access_token) {
    throw new Error('百度返回的 Token 数据无效。');
  }

  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000
  };

  return tokenCache.token;
};

const ensureBuffer = (audioBase64: string) => {
  try {
    return Buffer.from(audioBase64, 'base64');
  } catch (error) {
    throw new Error('音频数据无法解码，请检查传入的 Base64 字符串。');
  }
};

export const recognizeSpeech = async ({
  audioBase64,
  sampleRate = 16000,
  format = 'wav'
}: RecognizeOptions): Promise<SpeechRecognizeResult> => {
  if (!audioBase64) {
    throw new Error('缺少音频数据。');
  }

  const audioBuffer = ensureBuffer(audioBase64);
  const token = await getAccessToken();

  const payload = {
    dev_pid: env.baiduDevPid,
    format,
    rate: sampleRate,
    channel: 1,
    token,
    cuid: getCuid(),
    len: audioBuffer.length,
    speech: audioBuffer.toString('base64')
  };

  const response = await fetch(SPEECH_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`百度语音识别调用失败：${response.status} ${response.statusText}`);
  }

  const data = (await response.json()) as BaiduRecognizeResponse;

  if (data.err_no !== 0 || !data.result?.length) {
    throw new Error(`语音识别失败：${data.err_msg || `错误码 ${data.err_no}`}`);
  }

  return {
    text: data.result[0],
    raw: data.result,
    requestId: data.sn
  };
};
