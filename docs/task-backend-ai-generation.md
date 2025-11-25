---
name: Backend AI Code Generation API MVP
description: 使用 Vercel AI SDK 和 @ai-sdk/openai-compatible 实现简单的后端 AI 代码生成 API
---

# Role

你是一位专注于后端 AI API 开发的工程师，需要使用 Vercel AI SDK 实现最简单的 AI 代码生成后端接口，支持流式输出。

# Goals

1. 使用 @ai-sdk/openai-compatible 集成第三方 OpenAI compatible 模型
2. 实现一个简单的 `/api/generate` endpoint，支持流式输出
3. 接收前端传入的 user prompt，调用 AI 生成代码
4. 通过 SSE 协议流式返回生成的代码

# Constraints

## 技术约束
- 使用 Vercel AI SDK (`@ai-sdk/openai-compatible`)
- 使用 Next.js App Router 的 API Routes
- 支持 SSE (Server-Sent Events) 协议进行流式传输
- 使用 TypeScript 进行类型安全开发

## 功能约束
- MVP 版本，只实现核心功能
- 前端只传入 user prompt
- 暂时不需要输入验证、速率限制等安全检查
- 暂时不需要复杂的错误处理

# Workflows

## Step 1: 项目依赖安装

```bash
pnpm add @ai-sdk/openai-compatible ai
```

## Step 2: 环境变量配置

在 `.env.local` 中配置：

```env
# 第三方 OpenAI compatible API 配置
OPENAI_API_KEY=your_api_key_here
OPENAI_BASE_URL=https://your-third-party-provider.com/v1
AI_MODEL=gpt-4
```

## Step 3: 实现 API Endpoint

在 `app/api/generate/route.ts` 中实现：

```typescript
import { streamText } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

// 创建第三方 OpenAI compatible 客户端
const aiClient = createOpenAICompatible({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
  name: ''
});

// 使用指定模型
const model = aiClient(process.env.AI_MODEL || 'gpt-4');

// 请求类型
interface GenerationRequest {
  prompt: string;
}

// POST /api/generate
export async function POST(request: Request) {
  try {
    // 解析请求体
    const body: GenerationRequest = await request.json();
    const { prompt } = body;

    // 创建流式响应
    const result = await streamText({
      model,
      prompt,
      temperature: 0.7,
      maxTokens: 4000,
    });

    // 返回流式响应
    return result.toDataStreamResponse();

  } catch (error) {
    console.error('Generation error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate code' }),
      { status: 500 }
    );
  }
}
```

## Step 4: 测试 API

使用 curl 测试：

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Create a simple React component with TypeScript"}'
```

使用 JavaScript 测试：

```javascript
async function testGeneration() {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: 'Create a counter component using React and TypeScript'
    }),
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    console.log('Received:', chunk);
  }
}
```

# Validation Criteria

## 功能验证
- [ ] API endpoint 能正确接收 prompt
- [ ] 能调用第三方 AI 模型
- [ ] 流式响应正常工作
- [ ] 前端能接收到流式数据

## 代码质量验证
- [ ] TypeScript 类型正确
- [ ] 基本的错误处理
- [ ] 代码简洁清晰