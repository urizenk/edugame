import { env } from "../config/env";

interface ApiRequestOptions extends RequestInit {
  headers?: HeadersInit;
}

const defaultHeaders: HeadersInit = {
  "Content-Type": "application/json"
};

const buildUrl = (path: string) => {
  if (path.startsWith("http")) return path;
  if (!path.startsWith("/")) return `${env.apiBaseUrl}/${path}`;
  return `${env.apiBaseUrl}${path}`;
};

const mergeHeaders = (base: HeadersInit, extra?: HeadersInit) => {
  const headers = new Headers(base);
  if (extra) {
    const additional = new Headers(extra);
    additional.forEach((value, key) => {
      headers.set(key, value);
    });
  }
  return headers;
};

export async function apiFetch<T = unknown>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers = mergeHeaders(defaultHeaders, options.headers);

  const response = await fetch(buildUrl(path), {
    ...options,
    headers
  });

  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    let message = "请求失败，请稍后再试";

    if (contentType?.includes("application/json")) {
      try {
        const data = (await response.json()) as { message?: string };
        if (data?.message) {
          message = data.message;
        }
      } catch (error) {
        console.warn("Failed to parse error response", error);
      }
    } else {
      const text = await response.text();
      if (text) {
        message = text;
      }
    }

    throw new Error(message);
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  return undefined as T;
}
