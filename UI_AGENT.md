# UI 组件开发规范

## 概述

本文档定义了 AI Compoder 项目中所有 UI 相关开发的统一规范，包括 UI 规范、样式规范和设计系统原则。所有业务组件和页面开发都必须遵循这些规范。

## UI 规范

### 组件优先级

1. **优先使用现有组件**
   - 优先在 `components/ui/` 下搜索可用的基础组件
   - 如果没有找到合适的组件，使用官方 shadcn 库搜索
   - 检查现有业务组件是否可以复用或扩展

2. **组件选择原则**
   - `components/ui/`: 原子级 UI 组件（按钮、输入框、卡片等）
   - `components/biz/`: 可复用的业务模块（聊天界面、AI 生成等）
   - 页面专属组件: 仅用于当前页面的组件，放在页面目录下的 `components/` 中

### 技术栈要求

- **Shadcn/ui**: 组件系统使用 "new-york" 风格
- **Radix UI**: 使用原语保证可访问性（avatar、scroll-area、slot）
- **Class Variance Authority (CVA)**: 用于组件变体管理
- **Framer Motion** (v12.23.24): 用于动画效果
- **Lucide React**: 用于图标系统

## 样式规范

### 主题色彩

- **主色调**: 深色主题 (`bg-gray-950`, `text-gray-100`)
- **强调色**: 翠绿色/蓝色 (`emerald`, `blue`) 系列
- **背景色**: 灰色系列 (`gray-900`, `gray-800`) 带透明度
- **文本色**: 主要为 `text-gray-100`，次要为 `text-gray-400`

### 样式管理规范

#### 1. 样式优先级
- **优先**: Tailwind CSS 类名
- **其次**: 内联样式（用于动态值、特殊动画、复杂背景等）

#### 2. 内联样式规范
允许使用内联样式的情况：
- 动态值计算（如宽度、高度、位置）
- 特殊动画效果
- 复杂的背景渐变
- 无法用 Tailwind 类名表达的样式

#### 3. CVA 使用原则
- **尽量少使用变体**，只有当组件确实有多种状态或样式变化时才使用
- **CVA 文件位置**: 如果需要使用 CVA，所有变体定义必须放在 `variants.ts` 文件中
- **CVA 导入规范**: `import { cva, type VariantProps } from 'class-variance-authority'`

#### 4. 变体命名规范
- 使用清晰的布尔或枚举变体名称（如 `visible`, `variant`, `status`）
- 必须设置 `defaultVariants`，确保组件有合理的默认状态
- 基础样式写在 cva 第一个参数，变体样式写在 variants 对象中

### 设计系统

#### 1. Glass Morphism 效果
```css
/* 基础玻璃拟态样式 */
glass-morphism {
  backdrop-filter: blur(10px);
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

#### 2. 标准间距
- `p-4`: 基础内边距 (16px)
- `p-6`: 中等内边距 (24px)
- `p-8`: 大内边距 (32px)
- `gap-4`: 基础间距 (16px)
- `gap-6`: 中等间距 (24px)

#### 3. 圆角规范
- `rounded-md`: 小圆角 (6px)
- `rounded-lg`: 标准圆角 (8px)
- `rounded-xl`: 大圆角 (12px)
- `rounded-2xl`: 超大圆角 (16px)

#### 4. 阴影规范
- `shadow-sm`: 小阴影
- `shadow-md`: 标准阴影
- `shadow-lg`: 大阴影
- `shadow-xl`: 超大阴影

#### 5. 过渡动画
```css
/* 标准过渡效果 */
transition-all duration-300 ease-in-out
```

## 高级效果

### 1. 玻璃拟态 (Glass Morphism)
- 使用 `backdrop-filter: blur()` 实现背景模糊
- 结合半透明背景色 `bg-gray-900/80`
- 添加细边框 `border border-gray-700/50`

### 2. 矩阵背景效果
用于 AI 相关组件的背景效果：
```css
matrix-background {
  background-image:
    linear-gradient(rgba(0, 255, 0, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 0, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
}
```

### 3. 动画规范
- **Framer Motion**: 使用 `motion` 组件实现复杂动画
- **CSS 动画**: 简单的过渡效果使用 CSS transitions
- **性能优化**: 使用 `will-change` 属性优化动画性能

### 4. 响应式设计
- **断点**: `sm:`, `md:`, `lg:`, `xl:`
- **容器**: 使用 `container mx-auto px-4` 实现居中布局
- **网格**: 使用 CSS Grid 或 Flexbox 实现响应式布局

## 可访问性 (Accessibility)

### 1. 键盘导航
- 所有交互元素都支持键盘访问
- 使用正确的 HTML 语义标签
- 提供焦点指示器

### 2. 屏幕阅读器
- 使用 ARIA 标签增强可访问性
- 提供替代文本 (alt text)
- 使用语义化的 HTML 结构

### 3. 减少动画
- 支持 `prefers-reduced-motion` 媒体查询
- 为动画提供替代方案

### 4. 对比度
- 确保文本与背景有足够的对比度
- 遵循 WCAG 2.1 AA 标准

## 性能优化

### 1. CSS 优化
- 避免过度嵌套的选择器
- 使用 Tailwind 的 JIT 编译
- 移除未使用的 CSS 类

### 2. 动画优化
- 使用 `will-change` 属性
- 避免影响布局的动画
- 使用 transform 和 opacity 进行动画

### 3. 图片优化
- 使用 Next.js Image 组件
- 提供合适的图片格式
- 实现懒加载

## 代码示例

### 1. 标准组件模板
```tsx
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { componentVariants } from './variants';

interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary';
}

export const ComponentName: React.FC<ComponentProps> = ({
  className,
  children,
  variant = 'default',
}) => {
  return (
    <div
      className={cn(
        'glass-morphism rounded-lg p-6 transition-all duration-300 ease-in-out',
        componentVariants && componentVariants({ variant }),
        className
      )}
    >
      {children}
    </div>
  );
};
```

### 2. CVA 变体模板
```ts
// variants.ts
import { cva, type VariantProps } from 'class-variance-authority';

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

### 3. 样式工具函数
```ts
// utils.ts
export const getComplexStyles = (isAnimated: boolean) => ({
  background: isAnimated
    ? 'linear-gradient(45deg, #1e293b, #334155)'
    : '#1e293b',
  boxShadow: isAnimated
    ? '0 10px 30px -10px rgba(0,0,0,0.6)'
    : '0 4px 6px -1px rgba(0,0,0,0.3)',
});
```

## 特殊注意事项

1. **样式一致性**: 所有组件必须保持一致的视觉风格
2. **主题维护**: 遵循项目的深色主题和强调色规范
3. **组件复用**: 优先使用现有组件，避免重复造轮子
4. **性能考虑**: 避免过度的样式嵌套和不必要的动画
5. **可维护性**: 保持样式的可读性和可维护性

## 修改和扩展

当需要修改或扩展此规范时：
1. 评估影响的组件和页面范围
2. 确保向后兼容性
3. 更新相关文档和示例
4. 与团队讨论和确认变更

通过遵循这些 UI 开发规范，我们可以确保整个项目的视觉一致性和代码质量。