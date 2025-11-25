---
name: API Service Layer Implementation
description: 实现纯粹的 API Service 层，使用 request 实例调用后端 AI 代码生成 API，提供类型化的 API 函数接口
---

# Role

你是一位专注于 API 层开发的工程师，需要实现纯粹、类型安全的 API Service 函数层，作为前端和 AI 代码生成后端之间的数据桥梁。

# Goals

1. 创建 AI 代码生成相关的 API Service 函数，使用 request 实例调用后端 API
2. 定义完整的 TypeScript 类型，涵盖代码生成请求和流式响应
3. 确保所有 API 函数都是纯函数，不包含业务逻辑和状态管理
4. 提供清晰、一致的 API 接口，便于 Server-Store 层调用
5. 遵循项目架构规范，只调用 request 实例（流式 API 除外），不做业务验证

# Constraints

## 架构约束
- **严格遵循分层架构**：API Service 层只能调用 request 实例，不能直接调用 fetch 或其他 HTTP 库
- **纯函数原则**：API Service 函数必须是纯函数，只负责数据获取/提交，不包含业务逻辑
- **不包含状态管理**：禁止包含任何缓存、loading、错误处理等状态管理逻辑
- **类型安全**：所有 API 函数必须有明确的输入输出类型定义

## 技术约束
- 使用之前实现的 `lib/request` 实例进行 API 调用
- 严格使用 TypeScript，禁止使用 `any` 类型
- 所有 API 函数必须使用 `async/await` 语法
- 必须处理和转换 API 响应，提取业务需要的字段

## 文件结构约束
- API Service 函数：`lib/services/code-generation.ts`
- 类型定义：`lib/services/types/code-generation.ts`
- 其他业务 API 可在 `lib/services/` 下扩展相应文件
- 类型定义统一放在 `lib/services/types/` 目录

## 功能约束
- **代码生成**：根据用户提示生成代码，支持流式响应
- **流式处理**：支持 SSE 流式代码生成响应
- **错误响应**：统一处理后端返回的错误格式
- **数据传输**：纯粹的数据传输层，不包含业务验证逻辑

# Workflows

## Step 1: 定义类型接口
在 `lib/services/types/code-generation.ts` 中定义所有代码生成相关的类型：

```typescript
// 代码生成请求
export interface GenerateCodeRequest {
  prompt: string;
  language?: string;
  framework?: string;
  temperature?: number;
  maxTokens?: number;
}

// 流式代码块
export interface StreamChunk {
  type: 'code' | 'error' | 'complete' | 'metadata';
  data?: string;
  error?: string;
  messageId?: string;
  language?: string;
  framework?: string;
}

// 代码生成元数据
export interface GenerationMetadata {
  messageId: string;
  model: string;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  duration: number;
  language: string;
  framework?: string;
}

// API 错误响应
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: number;
}
```

## Step 2: 实现 Code Generation API Service
在 `lib/services/code-generation.ts` 中实现所有代码生成相关的 API 函数：

```typescript
import { post, type RequestError } from '@/lib/request';
import type {
  GenerateCodeRequest,
  StreamChunk,
  ApiErrorResponse
} from './types/code-generation';

/**
 * 生成代码（流式）
 * @param params - 代码生成请求参数
 * @returns ReadableStream<StreamChunk>
 */
export async function generateCodeStream(
  params: GenerateCodeRequest
): Promise<ReadableStream<StreamChunk>> {
  const response = await post('/api/generate', params);

  if (!response.body) {
    throw new RequestError(
      'NETWORK_ERROR',
      'Response body is null'
    );
  }

  return createStreamParser(response.body);
}

/**
 * 解析流式代码生成响应
 * @param body - Response body stream
 * @returns ReadableStream<StreamChunk>
 */
function createStreamParser(body: ReadableStream): ReadableStream<StreamChunk> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  return new ReadableStream<StreamChunk>({
    async pull(controller) {
      try {
        const { done, value } = await reader.read();

        if (done) {
          // 处理缓冲区中剩余的数据
          if (buffer.trim()) {
            processChunk(buffer, controller);
          }
          controller.close();
          return;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // 保留最后一行（可能不完整）
        buffer = lines.pop() || '';

        // 处理完整的行
        for (const line of lines) {
          processChunk(line, controller);
        }
      } catch (error) {
        controller.enqueue({
          type: 'error',
          error: error instanceof Error ? error.message : 'Unknown stream error'
        });
        controller.close();
      }
    },

    cancel() {
      reader.cancel();
    },
  });
}

/**
 * 处理单个数据块
 * @param chunk - 数据块文本
 * @param controller - 流控制器
 */
function processChunk(chunk: string, controller: ReadableStreamDefaultController<StreamChunk>) {
  chunk = chunk.trim();

  if (!chunk) return;

  if (chunk.startsWith('data: ')) {
    const data = chunk.slice(6).trim();

    if (data === '[DONE]') {
      controller.enqueue({ type: 'complete' });
      return;
    }

    if (data) {
      try {
        const parsed = JSON.parse(data) as StreamChunk;
        controller.enqueue(parsed);
      } catch (error) {
        controller.enqueue({
          type: 'error',
          error: `Failed to parse stream data: ${error}`
        });
      }
    }
  }
}

// API Service 层专注于核心的代码生成功能
```

# Example

## 基础使用示例
```typescript
import { generateCodeStream } from '@/lib/services/code-generation';

// 直接生成代码（验证由前端页面层和后端处理）
const stream = await generateCodeStream({
  prompt: 'Create a React component',
  language: 'typescript',
  framework: 'react',
});
```

## 流式代码生成示例
```typescript
import { generateCodeStream } from '@/lib/services/code-generation';

async function handleCodeGeneration() {
  const stream = await generateCodeStream({
    prompt: 'Create a TypeScript React component with TypeScript props',
    language: 'typescript',
    framework: 'react',
    temperature: 0.7,
  });

  const reader = stream.getReader();
  let generatedCode = '';

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    switch (value.type) {
      case 'code':
        if (value.data) {
          generatedCode += value.data;
          console.log('Code chunk:', value.data);
        }
        break;
      case 'metadata':
        console.log('Metadata:', value);
        break;
      case 'error':
        console.error('Generation error:', value.error);
        break;
      case 'complete':
        console.log('Generation completed');
        break;
    }
  }

  console.log('Final code:', generatedCode);
}
```

> **注意**：输入验证应该在以下位置进行：
> - **前端页面层**：简单的 UI 验证（长度、格式等）
> - **后端 API 层**：业务逻辑验证、安全性检查
> - **API Service 层**：专注于数据传输，不做验证

# Validation Criteria

## 功能验证
- [ ] 所有 API 函数正确调用 request 实例（流式 API 除外）
- [ ] 类型定义完整且准确，涵盖代码生成场景
- [ ] 流式代码生成解析功能正常
- [ ] 错误处理机制完善
- [ ] 无业务逻辑和状态管理代码
- [ ] 不包含任何验证逻辑，保持纯粹的 API 调用层

## 代码质量验证
- [ ] 没有 `any` 类型使用
- [ ] 所有函数都有明确的类型定义
- [ ] 代码注释清晰，JSDoc 完整
- [ ] 函数命名语义化
- [ ] ESLint 和 TypeScript 检查通过

## 架构验证
- [ ] 严格遵循分层架构，只调用 request 层
- [ ] 不包含任何状态管理逻辑
- [ ] 文件组织结构符合规范（lib/services/code-generation.ts）
- [ ] 与后续 Server-Store 层集成顺畅
- [ ] 流式 API 正确处理 fetch 响应

## 类型安全验证
- [ ] 所有 API 响应都有对应的类型定义
- [ ] 流式响应类型（StreamChunk）定义准确
- [ ] 函数参数和返回值类型准确
- [ ] TypeScript 编译无错误
- [ ] 类型推断正常工作

## 架构纯粹性验证
- [ ] 严格遵循分层职责，API Service 层不做业务验证
- [ ] 输入验证留给前端页面层处理
- [ ] 业务验证留给后端 API 层处理
- [ ] 保持纯粹的数据传输层功能
- [ ] 错误处理覆盖实际使用场景