/**
 * HTTP Request Instance Implementation
 * 统一的 HTTP 请求实例，提供基础的 API 调用能力
 */

// 请求配置接口
export interface RequestConfig extends RequestInit {
  timeout?: number;
  baseURL?: string;
  headers?: Record<string, string>;
}

// 响应接口
export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

// 错误类型枚举
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  HTTP_ERROR = 'HTTP_ERROR',
  PARSE_ERROR = 'PARSE_ERROR'
}

// 自定义错误类
export class RequestError extends Error {
  constructor(
    public type: ErrorType,
    message: string,
    public status?: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'RequestError';
  }
}

// 默认配置
const DEFAULT_CONFIG: Partial<RequestConfig> = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// 创建请求 URL
function buildURL(url: string, baseURL?: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return baseURL ? `${baseURL}${url}` : url;
}

// 核心请求函数
export async function request(
  url: string,
  config?: RequestConfig
): Promise<Response> {
  const {
    timeout = DEFAULT_CONFIG.timeout,
    baseURL,
    headers = {},
    ...restConfig
  } = { ...DEFAULT_CONFIG, ...config };

  // 构建完整 URL
  const fullUrl = buildURL(url, baseURL);

  // 创建 AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    // 合并 headers
    const finalHeaders: Record<string, string> = {
      ...DEFAULT_CONFIG.headers as Record<string, string>,
      ...headers,
    };

    // 构建请求配置
    const fetchConfig: RequestInit = {
      ...restConfig,
      headers: finalHeaders,
      signal: controller.signal,
    };

    // 发送请求
    const response = await fetch(fullUrl, fetchConfig);

    // 清除超时定时器
    clearTimeout(timeoutId);

    // 检查响应状态
    if (!response.ok) {
      throw new RequestError(
        ErrorType.HTTP_ERROR,
        `HTTP Error: ${response.status} ${response.statusText}`,
        response.status,
        response
      );
    }

    // 直接返回 Response 对象，让调用者处理解析
    return response;
  } catch (error) {
    clearTimeout(timeoutId);

    // 处理不同类型的错误
    if (error instanceof RequestError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new RequestError(
          ErrorType.TIMEOUT_ERROR,
          `Request timeout after ${timeout}ms`
        );
      }

      if (error.message.includes('fetch')) {
        throw new RequestError(
          ErrorType.NETWORK_ERROR,
          'Network connection failed'
        );
      }
    }

    throw new RequestError(
      ErrorType.NETWORK_ERROR,
      'Unknown request error'
    );
  }
}

// GET 请求
export async function get(
  url: string,
  config?: Omit<RequestConfig, 'body' | 'method'>
): Promise<Response> {
  return request(url, {
    ...config,
    method: 'GET',
  });
}

// POST 请求
export async function post(
  url: string,
  data?: unknown,
  config?: Omit<RequestConfig, 'body' | 'method'>
): Promise<Response> {
  return request(url, {
    ...config,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

// PUT 请求
export async function put(
  url: string,
  data?: unknown,
  config?: Omit<RequestConfig, 'body' | 'method'>
): Promise<Response> {
  return request(url, {
    ...config,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

// DELETE 请求
export async function del(
  url: string,
  config?: Omit<RequestConfig, 'body' | 'method'>
): Promise<Response> {
  return request(url, {
    ...config,
    method: 'DELETE',
  });
}

// PATCH 请求
export async function patch(
  url: string,
  data?: unknown,
  config?: Omit<RequestConfig, 'body' | 'method'>
): Promise<Response> {
  return request(url, {
    ...config,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}

// 获取当前全局配置
export function getGlobalConfig(): Readonly<Partial<RequestConfig>> {
  return { ...DEFAULT_CONFIG };
}
