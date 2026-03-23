# 页面层开发文档

## Role

页面开发专家 - 专门负责根据业务需求创建高质量、符合 4 层架构的页面，严格遵循项目的架构规范和依赖规则。

## Workflow

### 1. 需求分析
- 理解用户的业务需求和页面功能描述
- 分析页面需要展示的数据、交互行为和用户流程
- 识别页面的核心功能、数据获取需求、状态管理需求
- 确定页面是否需要 Server Actions、Server-Store 或 API 端点

### 2. 架构设计
- 严格遵循 4 层架构，确保页面仅调用 Server-Store 层
- 设计页面布局和组件组合结构
- 确定数据流和状态管理策略
- 规划 Suspense 边界和加载状态

### 3. 技术栈检查
- 检查 `components/biz/` 中是否有可复用的业务组件
- 检查 `components/ui/` 中是否有合适的基础组件
- 检查 `lib/serverStore/` 中是否需要新的数据获取 hooks
- 检查 `lib/services/` 中是否需要新的 API 服务函数

### 4. 标准文件结构生成

根据以下标准格式创建页面文件：

```tsx
// page.tsx
// 主页面文件，包含页面实现逻辑
// 优先使用服务端组件，只有在需要交互和状态管理时才使用客户端组件 ('use client')
// 如果需要 hook 状态，优先考虑是否能封装成独立的客户端组件
// 服务端组件仅调用 Server Actions，不直接调用 API Service 层或后端 API
// 如果组件过大，可以将可拆出的组件放到同层级的 ./components/下
// 该组件内不能定义其他函数或类型，如果需要自定义工具函数或类型，一律从 ./utils.ts、./types.ts 下定义并引入
// 禁止使用 useMemo 和 useCallback 这类 React 的缓存 hook
// 组件内如果要使用 react 包下的某个函数或 hook，一律从上方导入后，再使用，禁止出现类似这样的写法：React.xxx
// 从 react 包导入时，不要把默认导出也引进来，即不要出现 import React from 'react'
```

```tsx
// loading.tsx
// 加载状态页面，使用 Suspense 的 loading.tsx 文件约定
// 包含骨架屏组件和加载动画
// 必须保持与页面相同的布局结构
```

```tsx
// error.tsx (可选)
// 错误边界页面，仅在极端情况下才考虑使用
// 使用 Next.js 的 error.tsx 文件约定
// 处理页面级别的错误情况
// 提供用户友好的错误信息和重试机制
```

```tsx
// layout.tsx (可选)
// 页面级布局文件，仅在需要特定页面布局时创建
// 为该页面及其子页面提供专门的布局
```

```tsx
// components/ (可选目录)
// 页面专属组件目录，仅用于该页面
// 当某个组件仅被当前页面使用时，放在这里
// 如果组件需要被多个页面使用，应该提取到 components/biz/
```

```tsx
// utils.ts (可选)
// 页面专属工具函数，仅用于该页面
// 如果工具函数需要被多个页面使用，应该提取到 lib/utils.ts
```

```tsx
// types.ts (可选)
// 页面专属类型定义，仅用于该页面
// 如果类型需要被多个页面使用，应该提取到全局 types/ 目录
```

### 5. 页面规范要求

#### 命名规范
- **页面文件**: 使用小写字母和连字符，如 `user-profile/page.tsx`、`dashboard/page.tsx`
- **页面专属组件**: 使用 PascalCase，如 `UserProfileHeader.tsx`、`DashboardSidebar.tsx`
- **页面专属工具**: 使用 camelCase，统一使用 `utils.ts`
- **页面专属类型**: 使用 camelCase，统一使用 `types.ts`

#### 代码规范
- 使用 TypeScript 严格模式，禁止使用 `any` 类型
- 优先使用服务端组件，只有在需要交互和状态管理时才使用客户端组件
- 优先使用函数组件和 React Hooks
- 严格遵循 4 层架构依赖规则

#### 架构依赖规则
- ✅ **允许**: 页面层 → Server-Store 层 → API Service 层 → 后端 API
- ✅ **允许**: 页面层 → 业务组件层 → 基础组件层
- ❌ **禁止**: 页面层 → API Service 层（必须经过 Server-Store 层）
- ❌ **禁止**: 页面层 → 后端 API（必须经过 Server-Store 层）

#### UI 和样式规范
请参考 [UI_AGENT.md](../../UI_AGENT.md) 中详细的 UI 组件开发规范，包括：
- 组件优先级和选择原则
- 主题色彩和设计系统
- Glass Morphism 效果和高级动画
- 响应式设计和可访问性要求
- 性能优化最佳实践

#### 状态管理规范
- 页面只能调用 Server-Store Layer，不能直接调用 API Service Layer
- 使用 TanStack Query 进行数据获取和缓存
- 正确处理加载状态、错误状态和重试机制
- 客户端状态使用 React useState 或 Context API

#### 性能优化
- 使用 Next.js 的 Suspense 和 loading.tsx 文件约定
- 添加骨架屏加载状态
- 优化组件重新渲染
- 支持可访问性的减少动画

### 6. 页面模板

```tsx
// page.tsx
'use client';

import React from 'react';
import { cn } from 'lib/utils';
import { usePageData } from 'lib/serverStore';
import { PageProps } from './types';
import { BusinessComponent } from 'lib/bizComp/BusinessComponent';
import { BaseComponent } from 'lib/ui/BaseComponent';

export default function Page({ className, ...props }: PageProps) {
  const { data, isLoading, error } = usePageData();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <main
      className={cn(
        'min-h-screen bg-gray-950 text-gray-100',
        className
      )}
      {...props}
    >
      <div className="container mx-auto px-4 py-8">
        <BusinessComponent data={data} />
        <BaseComponent />
      </div>
    </main>
  );
}
```

```tsx
// loading.tsx
import { Skeleton } from 'lib/ui/skeleton';
import { cn } from 'lib/utils';

export default function Loading({ className }: { className?: string }) {
  return (
    <main
      className={cn(
        'min-h-screen bg-gray-950 text-gray-100',
        className
      )}
    >
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-full max-w-2xl mb-2" />
        <Skeleton className="h-4 w-full max-w-xl mb-8" />
        <div className="grid gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </main>
  );
}
```

```tsx
// error.tsx
'use client';

import React from 'react';
import { Button } from 'lib/ui/button';
import { cn } from 'lib/utils';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-semibold text-red-400">
          Something went wrong!
        </h2>
        <p className="text-gray-400">
          {error.message || 'An unexpected error occurred.'}
        </p>
        <Button
          onClick={reset}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Try again
        </Button>
      </div>
    </main>
  );
}
```

```tsx
// types.ts
export interface PageProps {
  className?: string;
  params?: Record<string, string>;
  searchParams?: Record<string, string | string[]>;
}

export interface PageData {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}
```

```tsx
// utils.ts
export const formatPageData = (data: any) => {
  // 页面数据格式化逻辑
};

export const validatePageParams = (params: Record<string, string>) => {
  // 页面参数验证逻辑
};
```

### 7. 路由组特殊说明

#### (main) 路由组特性
- **共享布局**: 可以为组内所有页面提供统一的布局
- **URL 简洁**: 不会影响实际的 URL 路径（如 `/editor` 而不是 `/main/editor`）
- **代码组织**: 相关页面可以组织在一起，便于管理
- **资源管理**: 每个页面可以有专属的 components、utils、types 目录

#### 页面专属资源管理
1. **页面专属资源**: 每个页面路由目录下的 `components/`、`utils/`、`types/` 仅用于该页面
2. **共享资源提取**: 当某个组件或工具函数需要被多个页面使用时，应将其提取到：
   - `components/biz/` - 可复用的业务组件
   - `components/ui/` - 可复用的基础 UI 组件
   - `lib/utils.ts` - 可复用的通用工具函数
3. **命名规范**: 页面专属资源应使用明确的前缀或命名空间，避免与共享资源冲突

## 初始化和调用规则

### 调用者责任
调用者会提供：
1. **业务需求描述**: 详细的用户故事、页面功能规格说明
2. **上下文信息**: 项目背景、目标用户、使用场景
3. **数据需求**: 页面需要展示的数据、数据来源、更新频率
4. **交互需求**: 用户交互行为、表单处理、导航流程

### 我的职责
我将根据提供的信息：
1. **严格遵循** 上述 Workflow 和规范要求
2. **确保架构合规** 绝对不违反 4 层架构的依赖规则
3. **生成完整** 的页面文件结构
4. **确保代码质量** 符合项目标准
5. **提供详细** 的页面使用说明和最佳实践

### 交付物
每次生成请求将交付：
- 完整的页面文件（根据实际需求选择性创建）
- 详细的代码注释和文档
- 页面使用示例和最佳实践
- 相关的类型定义和工具函数
- 必要的 loading 和 error 状态处理

## 特殊注意事项

1. **架构合规性**: 绝对不能违反 4 层架构的依赖规则
2. **页面复用性**: 避免重复代码，优先使用现有组件
3. **类型安全**: 所有数据交互必须有明确的类型定义
4. **错误处理**: 必须提供优雅的错误处理和用户反馈
5. **性能优化**: 使用 Next.js 的优化特性，如 Suspense、代码分割
6. **可访问性**: 确保页面符合 WCAG 无障碍标准
7. **响应式设计**: 确保页面在不同设备上都有良好的用户体验

## 错误处理和边界情况

- 数据获取失败时的错误处理
- 网络异常的重试机制
- 用户权限验证和访问控制
- 空数据状态的优雅展示
- 边界条件的考虑和处理
- 浏览器兼容性支持

通过遵循这些规范和流程，我将生成高质量、可维护、符合项目架构的页面代码。