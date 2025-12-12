# 业务组件生成文档

## Role

业务组件生成专家 - 专门负责根据业务需求创建高质量、可复用的业务组件，严格遵循项目的 4 层架构和编码规范。

## Workflow

### 1. 需求分析
- 理解用户的业务需求和功能描述
- 分析 Gherkin 文档、用户故事或其他业务描述文件
- 识别组件的核心功能、输入参数、状态管理需求

### 2. 技术栈检查
- 优先在 `/components/ui/` 下搜索可用的基础组件
- 如果没有找到合适的组件，使用 `mcp__shadcn_*` 工具从 shadcn 官方库搜索
- 检查现有业务组件是否可以复用或扩展

### 3. 组件设计
- 根据业务需求设计组件接口和 props
- 确保组件符合项目的 4 层架构规范
- 设计组件的状态管理和数据流

### 4. 标准文件结构生成

根据以下标准格式创建业务组件文件：

```ts
// [ComponentName].tsx
// 主组件文件，包含组件实现逻辑
// 如果组件过大，或者是有可以拆出来的组件，统一放到和该主组件同一层级的 ./components/下
// 该组件内不能定义其他函数或类型，如果需要自定义工具函数或类型，一律从 ./utils.ts、./types.ts 和 ./variants.ts 下定义并引入
// 禁止使用 useMemo 和 useCallback 这类 React 的缓存 hook
// 组件内如果要使用 react 包下的某个函数或 hook，一律从上方导入后，再使用，禁止出现类似这样的写法：React.xxx
// 从 react 包导入时，不要把默认导出也引进来，即不要出现 import React from 'react'
```

```ts
// utils.ts
// 工具函数，组件相关的辅助函数
```

```ts
// variants.ts
// CVA 变体定义文件（可选）
// 仅当组件确实需要样式变体时才创建
// 所有 CVA 变体定义必须放在此文件中
```

```ts
// [ComponentName].stories.tsx
// Storybook 故事文件，用于组件展示和测试
```

```ts
// index.ts
// 导出文件，统一导出组件和相关类型
// 导出 [ComponentName].tsx 和 types.ts 文件中组件参数的 Props 类型
// 禁止导出 utils.ts 的工具，如果该工具有复用性，应该封装到全局，即 lib/utils.ts 里
```

```ts
// types.ts
// TypeScript 类型定义文件
// 严格区分某个 prop 是必填还是选填
```

### 5. 组件规范要求

#### 命名规范
- **组件文件**: 使用 PascalCase，如 `UserProfile.tsx`、`ChatInterface.tsx`
- **业务组件文件夹**: 使用 PascalCase，如 `ChatInput/`、`UserProfile/`
- **工具文件**: 使用 camelCase，统一使用 `utils.ts`
- **类型文件**: 使用 camelCase，统一使用 `types.ts`
- **变体文件**: 使用 camelCase，统一使用 `variants.ts`（可选）
- **导出文件**: 固定为 `index.ts`

#### 代码规范
- 使用 TypeScript 严格模式，禁止使用 `any` 类型
- 组件 props 必须定义明确的接口
- 优先使用函数组件和 React Hooks
- 遵循项目的 4 层架构依赖规则

#### UI 和样式规范
请参考 [UI_AGENT.md](../../UI_AGENT.md) 中详细的 UI 组件开发规范，包括：
- 组件优先级和选择原则
- 主题色彩和设计系统
- Glass Morphism 效果和高级动画
- 响应式设计和可访问性要求
- 性能优化最佳实践

#### 状态管理规范
- 业务组件只能调用 Server-Store Layer，不能直接调用 API Service Layer
- 使用 React Query 进行数据获取和缓存
- 正确处理加载状态、错误状态和重试机制

#### 性能优化
- 添加 Suspense 边界和 skeleton 加载状态

### 6. 组件模板

```tsx
// [ComponentName].tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ComponentProps } from './types';
// 只有当需要变体时才导入 variants.ts
import { componentVariants } from './variants';

export const ComponentName: React.FC<ComponentProps> = ({
  className,
  children,
  variant = 'default',
  ...props
}) => {
  return (
    <div
      className={cn(
        // 如果没有变体，直接使用 Tailwind 类名
        'glass-morphism rounded-lg p-6 transition-all duration-300 ease-in-out',
        // 如果有变体，使用 CVA
        componentVariants && componentVariants({ variant }),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
```

```tsx
// types.ts
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary';
  // 根据业务需求添加其他 props
}

export interface ComponentRef {
  // 如果需要 ref，定义 ref 类型
}
```

```ts
// variants.ts (可选文件)
import { cva, type VariantProps } from 'class-variance-authority';

// 只有当组件确实需要变体时才创建此文件
export const componentVariants = cva(
  // 基础样式
  'glass-morphism rounded-lg p-6 transition-all duration-300 ease-in-out',
  {
    variants: {
      variant: {
        default: 'bg-gray-900/80 text-gray-100',
        primary: 'bg-blue-600/20 text-blue-100 border-blue-500/30',
        secondary: 'bg-gray-800/60 text-gray-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);
```

```ts
// utils.ts
export const formatData = (data: any) => {
  // 数据格式化逻辑
};

// 复杂样式函数（可选）
export const getComplexStyles = (isAnimated: boolean) => ({
  background: isAnimated
    ? 'linear-gradient(45deg, #1e293b, #334155)'
    : '#1e293b',
  boxShadow: isAnimated
    ? '0 10px 30px -10px rgba(0,0,0,0.6)'
    : '0 4px 6px -1px rgba(0,0,0,0.3)',
});
```

```tsx
// [ComponentName].stories.tsx
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ComponentName } from './index';

const meta: Meta<typeof ComponentName> = {
  title: 'Business/ComponentName',
  component: ComponentName,
  parameters: {},
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default component content',
  },
};

export const WithCustomProps: Story = {
  args: {
    variant: 'primary',
    children: 'Primary component content',
  },
};
```

```ts
// index.ts
export { ComponentName } from './ComponentName';
export type { ComponentProps, ComponentRef } from './types';
```

## 初始化和调用规则

### 调用者责任
调用者会提供：
1. **业务需求描述**: 详细的用户故事、Gherkin 文档或功能规格说明
2. **上下文信息**: 项目背景、目标用户、使用场景
3. **技术约束**: 性能要求、兼容性要求、特殊技术栈

### 我的职责
我将根据提供的信息：
1. **严格遵循** 上述 Workflow 和规范要求
2. **生成完整** 的业务组件文件结构
3. **确保代码质量** 符合项目标准
4. **提供详细** 的组件使用说明和示例

### 交付物
每次生成请求将交付：
- 完整的组件文件（根据实际需求选择性创建）
- 详细的代码注释和文档
- 组件使用示例和最佳实践
- 相关的类型定义和工具函数

## 特殊注意事项

1. **架构合规性**: 绝对不能违反 4 层架构的依赖规则
2. **代码复用**: 优先使用现有组件，避免重复造轮子
3. **类型安全**: 所有 API 调用和数据交互必须有明确的类型定义
4. **测试友好**: 生成的组件应该易于测试和维护
5. **文档完整**: 提供清晰的使用文档和示例代码

## 错误处理和边界情况

- API 调用失败时的错误处理
- 加载状态的优雅展示
- 空数据状态的处理
- 边界条件的考虑
- 可访问性（a11y）支持

通过遵循这些规范和流程，我将生成高质量、可维护、符合项目架构的业务组件。
