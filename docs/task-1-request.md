---
name: HTTP Request Instance Implementation
description: 实现统一的 HTTP 请求实例，提供基础的 API 调用能力，支持拦截器、错误处理和超时控制
---

# Role

你是一位专注于前端基础设施开发的全栈工程师，需要实现一个健壮、类型安全的 HTTP 请求工具库。

# Goals

1. 实现基于 fetch API 的请求实例封装
2. 提供统一的错误处理机制和响应拦截
3. 支持 TypeScript 类型推断
4. 实现请求超时控制和基础配置管理
5. 导出便捷的 HTTP 方法（GET、POST、PUT、DELETE 等）

# Constraints

## 技术约束
- 必须基于 fetch API 进行封装，不依赖第三方 HTTP 库
- 严格使用 TypeScript，禁止使用 `any` 类型
- 所有函数必须有明确的类型定义和返回值类型
- 支持请求和响应拦截器机制
- 实现请求超时控制，默认超时时间 10 秒
- 支持请求取消功能（AbortController）

## 文件结构约束
- 文件位置：`lib/request/index.ts`
- 导出方式：命名导出，包含 `request` 函数和各个 HTTP 方法
- 类型定义：在同一个文件中定义接口和类型

## 功能约束
- 错误处理：统一的错误类和错误码映射
- 响应处理：自动解析 JSON，支持流式响应
- 请求配置：支持全局默认配置和请求级别配置覆盖
- 环境适配：区分开发/生产环境的日志输出

# Workflows

## 实现步骤

### Step 1: 定义核心类型和接口
```typescript
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
```

### Step 2: 实现核心请求函数
```typescript
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
export async function request<T = unknown>(
  url: string,
  config?: RequestConfig
): Promise<T> {
  const {
    timeout = DEFAULT_CONFIG.timeout,
    baseURL,
    headers = {},
    ...fetchConfig
  } = { ...DEFAULT_CONFIG, ...config };

  // 构建完整 URL
  const fullUrl = buildURL(url, baseURL);

  // 创建 AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    // 发送请求
    const response = await fetch(fullUrl, {
      ...fetchConfig,
      headers: {
        ...DEFAULT_CONFIG.headers,
        ...headers,
        ...fetchConfig.headers,
      },
      signal: controller.signal,
    });

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

    // 解析响应
    const contentType = response.headers.get('content-type');

    if (contentType?.includes('application/json')) {
      return await response.json();
    } else if (contentType?.includes('text/')) {
      return (await response.text()) as unknown as T;
    } else {
      return (await response.blob()) as unknown as T;
    }

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
```

### Step 3: 实现便捷的 HTTP 方法
```typescript
// GET 请求
export async function get<T = unknown>(
  url: string,
  config?: Omit<RequestConfig, 'body' | 'method'>
): Promise<T> {
  return request<T>(url, {
    ...config,
    method: 'GET',
  });
}

// POST 请求
export async function post<T = unknown>(
  url: string,
  data?: unknown,
  config?: Omit<RequestConfig, 'body' | 'method'>
): Promise<T> {
  return request<T>(url, {
    ...config,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

// PUT 请求
export async function put<T = unknown>(
  url: string,
  data?: unknown,
  config?: Omit<RequestConfig, 'body' | 'method'>
): Promise<T> {
  return request<T>(url, {
    ...config,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

// DELETE 请求
export async function del<T = unknown>(
  url: string,
  config?: Omit<RequestConfig, 'body' | 'method'>
): Promise<T> {
  return request<T>(url, {
    ...config,
    method: 'DELETE',
  });
}

// PATCH 请求
export async function patch<T = unknown>(
  url: string,
  data?: unknown,
  config?: Omit<RequestConfig, 'body' | 'method'>
): Promise<T> {
  return request<T>(url, {
    ...config,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}
```

### Step 4: 添加请求配置和工具函数
```typescript
// 设置全局默认配置
export function setGlobalConfig(config: Partial<RequestConfig>): void {
  Object.assign(DEFAULT_CONFIG, config);
}

// 获取当前全局配置
export function getGlobalConfig(): Readonly<Partial<RequestConfig>> {
  return { ...DEFAULT_CONFIG };
}

// 创建预配置的请求实例
export function createRequestInstance(baseConfig: Partial<RequestConfig>) {
  return {
    request: <T = unknown>(url: string, config?: RequestConfig) =>
      request<T>(url, { ...baseConfig, ...config }),
    get: <T = unknown>(url: string, config?: Omit<RequestConfig, 'body' | 'method'>) =>
      get<T>(url, { ...baseConfig, ...config }),
    post: <T = unknown>(url: string, data?: unknown, config?: Omit<RequestConfig, 'body' | 'method'>) =>
      post<T>(url, data, { ...baseConfig, ...config }),
    put: <T = unknown>(url: string, data?: unknown, config?: Omit<RequestConfig, 'body' | 'method'>) =>
      put<T>(url, data, { ...baseConfig, ...config }),
    delete: <T = unknown>(url: string, config?: Omit<RequestConfig, 'body' | 'method'>) =>
      del<T>(url, { ...baseConfig, ...config }),
    patch: <T = unknown>(url: string, data?: unknown, config?: Omit<RequestConfig, 'body' | 'method'>) =>
      patch<T>(url, data, { ...baseConfig, ...config }),
  };
}
```

# Example

## 基础使用示例
```typescript
// 简单 GET 请求
const users = await get<User[]>('/api/users');

// POST 请求
const newUser = await post<User>('/api/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// 带配置的请求
const data = await get<ApiResponse>('/api/data', {
  timeout: 5000,
  headers: {
    'Authorization': 'Bearer token123',
    'X-Custom-Header': 'custom-value'
  }
});
```

## 错误处理示例
```typescript
try {
  const data = await get<DataItem>('/api/data');
  console.log(data);
} catch (error) {
  if (error instanceof RequestError) {
    switch (error.type) {
      case ErrorType.NETWORK_ERROR:
        console.error('网络连接失败');
        break;
      case ErrorType.TIMEOUT_ERROR:
        console.error('请求超时');
        break;
      case ErrorType.HTTP_ERROR:
        console.error(`HTTP错误: ${error.status}`);
        break;
      default:
        console.error('未知错误');
    }
  }
}
```

## 预配置实例示例
```typescript
// 创建带有认证的请求实例
const authRequest = createRequestInstance({
  headers: {
    'Authorization': 'Bearer token123'
  },
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL
});

// 使用预配置实例
const userData = await authRequest.get<User>('/users/1');
```

# Initialization

### 环境变量支持
在实现时可以考虑支持以下环境变量：
- `NEXT_PUBLIC_API_BASE_URL`: API 基础 URL
- `NEXT_PUBLIC_REQUEST_TIMEOUT`: 默认请求超时时间
- `NODE_ENV`: 用于区分开发/生产环境的行为

### 测试考虑
- 为每个 HTTP 方法编写单元测试
- 模拟网络错误和超时场景
- 测试类型推断的正确性

# Validation Criteria

## 功能验证
- [ ] 所有 HTTP 方法（GET、POST、PUT、DELETE、PATCH）正常工作
- [ ] 请求超时控制生效
- [ ] 错误类型正确分类和处理
- [ ] JSON 自动解析功能正常
- [ ] TypeScript 类型推断准确

## 代码质量验证
- [ ] 没有 `any` 类型使用
- [ ] 所有函数都有明确的返回类型
- [ ] 错误处理覆盖所有可能的异常场景
- [ ] 代码注释清晰，逻辑易理解

## 集成验证
- [ ] 可以被其他模块正确导入和使用
- [ ] 支持 Next.js 的服务端和客户端环境
- [ ] 与后续的 API Service 层集成顺畅