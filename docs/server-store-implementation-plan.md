# AI 代码生成平台 - Server-Store 层实现方案

## 🎯 核心目标

**纯粹实现 server-store 层**，跑通 AI 代码生成的完整数据流：
```
Page Layer → Server-Store Layer → API Service Layer → Backend API
```

## 📊 当前架构现状

### ✅ 已完成的模块
1. **Backend API Endpoints**
   - `/app/api/generate/route.ts` - AI 代码生成 API ✅
   - 支持流式响应 ✅

2. **API Service Layer**
   - `/lib/services/code-generation.ts` - AI 生成服务 ✅
   - `/lib/services/types/code-generation.ts` - 类型定义 ✅
   - `/lib/request/index.ts` - HTTP 请求实例 ✅

3. **Base Components**
   - 完整的 UI 组件库 ✅
   - Chat 业务组件 ✅

4. **Page Layer**
   - `/app/page.tsx` - 主页面（当前使用模拟数据）⚠️

### ❌ 关键架构断层
- **Server-Store Layer**: 完全缺失
- **数据流管道**: Page Layer 未连接真实 API

## 🚀 精简实现任务

### Task 1: Server-Store 基础架构
**目标**: 建立完整的数据管理层

**文件结构**:
```
lib/
├── server-store/
│   ├── hooks/
│   │   ├── index.ts                 # 统一导出
│   │   └── useCodeGeneration.ts     # AI 代码生成 hook
│   ├── providers/
│   │   └── QueryProvider.tsx        # TanStack Query Provider
│   └── index.ts                     # 主入口
```

### Task 2: Page Layer 集成
**目标**: 让页面通过 Server-Store 调用真实 API

**修改点**:
1. `app/layout.tsx` - 添加 QueryProvider
2. `components/biz/chat/index.tsx` - 重构使用真实 API

## 🔧 技术实现规范

### 1. QueryProvider 规范
```typescript
// lib/server-store/providers/QueryProvider.tsx
"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: (failureCount) => failureCount < 2,
      },
      mutations: {
        retry: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

### 2. useCodeGeneration Hook 规范
```typescript
// lib/server-store/hooks/useCodeGeneration.ts
import { useMutation } from '@tanstack/react-query'
import { generateCodeStream } from '@/lib/services/code-generation'
import type { GenerateCodeRequest, StreamChunk } from '@/lib/services/types/code-generation'

export function useCodeGeneration() {
  return useMutation<ReadableStream<StreamChunk>, Error, GenerateCodeRequest>({
    mutationFn: generateCodeStream,
    onSuccess: (stream) => {
      console.log('Code generation stream started')
    },
    onError: (error) => {
      console.error('Code generation failed:', error)
    },
  })
}
```

### 3. Page Layer 集成规范
```typescript
// components/biz/chat/index.tsx (重构后的核心逻辑)
import { useCodeGeneration } from '@/lib/server-store'

export function ChatComponent() {
  const generateCodeMutation = useCodeGeneration()

  const handleGenerate = async (prompt: string) => {
    try {
      const stream = await generateCodeMutation.mutateAsync({ prompt })

      // 处理流式响应
      const reader = stream.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const parsedChunk = JSON.parse(chunk)

        if (parsedChunk.type === 'text') {
          // 更新代码显示
          updateCodeDisplay(parsedChunk.data)
        }
      }
    } catch (error) {
      // 错误已在 useCodeGeneration 中处理
      console.error('Generation failed:', error)
    }
  }

  return (
    <div>
      {/* UI 组件 */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={generateCodeMutation.isPending}
      />
      <button
        onClick={() => handleGenerate(prompt)}
        disabled={generateCodeMutation.isPending}
      >
        {generateCodeMutation.isPending ? '生成中...' : '生成代码'}
      </button>

      {/* 代码显示区域 */}
      <CodeDisplay code={generatedCode} />
    </div>
  )
}
```

## 📋 实施步骤

### Phase 1: Server-Store 层实现 (30分钟)
1. 创建 `lib/server-store/` 目录结构
2. 实现 `QueryProvider.tsx`
3. 实现 `useCodeGeneration.ts`
4. 创建导出文件

### Phase 2: 集成到应用 (20分钟)
1. 修改 `app/layout.tsx` 添加 QueryProvider
2. 重构 `components/biz/chat/index.tsx`
3. 移除所有模拟逻辑
4. 集成真实的流式 API 调用

### Phase 3: 测试验证 (10分钟)
1. 启动应用测试 AI 生成功能
2. 验证 Loading 和 Error 状态
3. 确认流式响应正常显示

## ✅ 验收标准

### 功能验收
- [ ] 用户输入需求后能看到真实 AI 生成的代码
- [ ] 支持流式输出，实时显示生成过程
- [ ] 正确的 Loading 状态显示
- [ ] 完整的错误处理和用户反馈

### 架构验收
- [ ] 数据流严格遵循：Page → Server-Store → Service → API
- [ ] TanStack Query 正确集成
- [ ] TypeScript 类型安全
- [ ] 代码符合项目规范

## ⚡ 关键依赖检查

确保 `package.json` 包含：
```json
{
  "@tanstack/react-query": "^5.90.10",
  "@tanstack/react-query-devtools": "^5.90.10"
}
```

## 🎯 成功指标

1. **流程跑通**: 从用户输入到 AI 代码生成的完整链路无错误
2. **体验流畅**: Loading 状态、错误提示、流式输出体验良好
3. **架构清晰**: Server-Store 层职责明确，代码结构清晰
4. **类型安全**: 所有 API 调用都有正确的 TypeScript 类型

这个方案专注于核心架构搭建，确保能快速验证前后端数据流的完整性。