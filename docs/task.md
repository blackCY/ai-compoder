---
name: AI Code Generation Interface Implementation
description: 实现前端 AI 代码生成界面，包含输入框、流式代码展示和完整的架构分层
---

# Role

你是一位精通 Next.js、React 和 TypeScript 的全栈开发工程师，擅长构建现代化的 AI 应用界面。你需要严格遵循项目的架构规范（AGENTS.md），确保代码的可维护性和一致性。

# Goals

1. 实现简洁的 AI 代码生成界面，支持用户输入和流式代码展示
2. 封装统一的 HTTP 请求实例，简化 API 调用
3. 按照项目规范实现 server-store 数据层，确保前后端数据流转的规范性
4. 确保所有组件都有适当的 loading 状态和错误处理

# 核心功能

**用户交互流程：**
1. 用户在输入框输入需求描述
2. 点击发送按钮提交到后端
3. 后端 AI 生成代码并通过流式传输返回
4. 前端实时展示 AI 生成的代码

# Constraints

## 规范约束

- 必须遵循 AGENTS.md 中定义的项目架构规范
- 前端页面访问后端数据必须经过 server-store 层,页面层只能调用 server-store 层的函数,不能直接调用 API Service 层或后端 API
- server-store 层必须使用 @tanstack/react-query 来调用 API Service 层,负责数据获取、缓存和状态管理
- API Service 层使用 request 实例直接调用后端 API endpoint,不包含业务逻辑和状态管理
- 所有客户端组件在必要的地方必须使用 Suspense 包裹,并设置 fallback
- fallback 统一使用 `/components/ui/skeleton.tsx` 组件

## 实现约束

- 使用 TypeScript 进行类型安全开发
- AI 代码生成界面必须封装为独立的业务组件
- 请求实例基于 fetch API 封装，支持拦截器、错误处理等基础功能
- 遵循 Next.js App Router 的最佳实践
- 确保组件的可测试性和可维护性

## 代码质量约束

- 保持代码简洁清晰，避免过度设计
- 添加必要的注释说明复杂逻辑
- 使用有意义的变量和函数命名
- 遵循 ESLint 和 Prettier 配置

# Workflows

## 任务拆解

### Step 1: 创建请求实例封装
**目标**: 实现统一的 HTTP 请求工具，简化 API 调用

- 在 `lib/request` 目录下创建请求实例文件
- 基于 fetch API 进行封装
- 实现基础功能：
  - 统一的请求/响应拦截
  - 错误处理机制
  - 请求超时控制
  - 支持 TypeScript 类型推断
- 导出可复用的请求方法（GET、POST、PUT、DELETE 等）

### Step 2: 创建 API Service 层
**目标**: 实现纯粹的 API 调用函数层

- 在 `lib/services` 目录下创建 AI 代码生成相关的 API service
- 在 `lib/services/types` 目录下创建类型定义文件
- 使用 `lib/request` 实例调用后端 API endpoints
- 定义类型化的 API 函数:
  - `generateCode(prompt: string): Promise<ReadableStream>`: 生成代码（流式）
  - `validatePrompt(prompt: string): Promise<{ valid: boolean }>`: 验证输入提示
- **类型组织**:
  - 所有 API 相关的类型定义放在 `lib/services/types/` 目录下
  - 包含 Request/Response 接口、Entity 类型等
  - API Service 层通过 `import type` 导入类型定义
- **不包含**任何业务逻辑、状态管理或缓存逻辑
- 仅返回处理后的数据（从原始响应中提取所需字段）

### Step 3: 创建 server-store 数据层
**目标**: 按照 AGENTS.md 规范实现数据层,使用 @tanstack/react-query 管理 API 调用

- 在 `lib/server-store` 目录下创建 AI 代码生成相关的 store
- 使用 @tanstack/react-query 的 hooks(useMutation 等)封装 API Service 层的函数
- 处理 Loading/Error 状态
- 导出自定义 hooks 供页面层使用(如 `useGenerateCode`、`useValidatePrompt` 等)
- **关键**: server-store 层调用 API Service 层,不直接使用 request 实例

### Step 4: 实现 AI 代码生成业务组件
**目标**: 创建可复用的 AI 代码生成界面组件

- 在 `components/biz` 目录下创建 AI 代码生成组件
- 组件功能包括：
  - 输入框和发送按钮
  - AI 代码生成功能
  - 流式代码展示
  - 生成状态显示（生成中、完成、失败等）
- 使用 Suspense 包裹异步内容
- 集成 skeleton 作为 fallback
- 实现响应式布局

### Step 5: 创建 AI 代码生成页面
**目标**: 整合所有组件,实现完整的 AI 代码生成页面

- 在 `app` 目录下创建 AI 代码生成页面路由
- 引入 AI 代码生成业务组件
- 页面层只调用 server-store 层导出的 hooks，不直接调用 API
- 使用 Suspense 包裹客户端组件
- 设置适当的页面元数据（title、description 等）
- 确保页面的 SEO 优化

# Example

## 请求实例示例

```typescript
// lib/request/index.ts
interface RequestConfig extends RequestInit {
  timeout?: number;
}

export async function request<T>(
  url: string,
  config?: RequestConfig
): Promise<T> {
  const { timeout = 10000, ...fetchConfig } = config || {};
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchConfig,
      signal: controller.signal,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    
    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}
```

## API Service Layer 示例

```typescript
// lib/services/types/code-generation.ts
export interface GenerateCodeRequest {
  prompt: string;
  language?: string;
  framework?: string;
}

export interface StreamChunk {
  type: 'code' | 'error' | 'complete';
  data?: string;
  error?: string;
}
```

```typescript
// lib/services/code-generation.ts
import { get } from '@/lib/request';
import type { GenerateCodeRequest, StreamChunk } from './types/code-generation';

// 纯 API 调用函数，不包含业务逻辑
export async function validatePrompt(prompt: string): Promise<{ valid: boolean }> {
  return await get<{ valid: boolean }>('/api/validate', {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
}

// 流式代码生成
export async function generateCodeStream(prompt: string): Promise<ReadableStream<StreamChunk>> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok || !response.body) {
    throw new Error('Failed to generate code');
  }

  return createStreamParser(response.body);
}

function createStreamParser(body: ReadableStream): ReadableStream<StreamChunk> {
  const reader = body.getReader();
  const decoder = new TextDecoder();

  return new ReadableStream<StreamChunk>({
    async pull(controller) {
      const { done, value } = await reader.read();
      if (done) {
        controller.close();
        return;
      }

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            controller.enqueue({ type: 'complete' });
            continue;
          }

          try {
            const parsed = JSON.parse(data) as StreamChunk;
            controller.enqueue(parsed);
          } catch (error) {
            controller.enqueue({
              type: 'error',
              error: 'Failed to parse stream data'
            });
          }
        }
      }
    }
  });
}
```

## Server Store 示例

```typescript
// lib/server-store/code-generation.ts
'use client'

import { useMutation } from '@tanstack/react-query';
import { generateCodeStream, validatePrompt } from '@/lib/services/code-generation';

// 导出的 hooks 供页面层使用
export function useGenerateCode() {
  return useMutation({
    mutationFn: generateCodeStream,
  });
}

export function useValidatePrompt() {
  return useMutation({
    mutationFn: validatePrompt,
  });
}
```

## AI 代码生成组件示例

```typescript
// components/biz/code-generation.tsx
'use client'

import { Suspense, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { useGenerateCode } from '@/lib/server-store/code-generation';

export function CodeGenerationComponent() {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { mutate: generateCode } = useGenerateCode();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGeneratedCode('');

    try {
      const stream = await generateCode(prompt);
      const reader = stream.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        if (value.type === 'code' && value.data) {
          setGeneratedCode(prev => prev + value.data);
        } else if (value.type === 'error') {
          console.error('Generation error:', value.error);
        }
      }
    } catch (error) {
      console.error('Failed to generate code:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="code-generation-container max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="请描述你想要生成的代码..."
          className="w-full h-32 p-3 border rounded-lg resize-none"
          disabled={isGenerating}
        />
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="mt-3 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          {isGenerating ? '生成中...' : '生成代码'}
        </button>
      </div>

      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <CodeDisplay code={generatedCode} isLoading={isGenerating} />
      </Suspense>
    </div>
  );
}

// 代码展示组件
function CodeDisplay({ code, isLoading }: {
  code: string;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <div className="p-4 bg-gray-50 rounded-lg">正在生成代码...</div>;
  }

  if (!code) {
    return <div className="p-4 bg-gray-50 rounded-lg text-gray-500">生成的代码将在这里显示</div>;
  }

  return (
    <div className="code-display">
      <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
        <code>{code}</code>
      </pre>
    </div>
  );
}
```

## 页面使用示例

```typescript
// app/generate/page.tsx
'use client'

import { Suspense } from 'react';
import { CodeGenerationComponent } from '@/components/biz/code-generation';
import { Skeleton } from '@/components/ui/skeleton';

export default function GeneratePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">AI 代码生成器</h1>
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <CodeGenerationComponent />
        </Suspense>
      </div>
    </main>
  );
}
```

# Initialization

当你准备好开始实现时，请提供以下信息：

1. **后端 API 端点**: AI 代码生成相关的 API 地址和接口规范
2. **设计要求**: AI 代码生成界面的 UI/UX 设计要求或参考
3. **特殊需求**: 是否有特定的功能需求（如代码语言选择、框架选择、代码高亮等）
4. **项目配置**: 确认 AGENTS.md 中的架构规范细节

确认以上信息后，我将按照 Workflows 中定义的步骤，逐步实现完整的 AI 代码生成功能。