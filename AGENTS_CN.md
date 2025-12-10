# AGENTS_CN.md

本文档为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

**AI Compoder** 是一个基于 AI 辅助的代码生成和业务开发平台，使用 Next.js 16+ 构建。该平台利用 AI 理解业务需求，并使用内部私有组件库快速构建高质量的业务页面，支持实时代码流式生成。

## 开发命令

```bash
# 开发服务器
pnpm dev

# 生产构建
pnpm build

# 启动生产服务器
pnpm start

# ESLint 检查
pnpm lint
```

## 架构与分层

本项目遵循**严格的 4 层架构**，具有强制依赖规则：

### 1. 页面层 (`/app`)
- **位置**: `/app` 目录使用 Next.js App Router
- **职责**: 整体页面布局和组件组装
- **关键文件**: `app/page.tsx`（带 hero、features 和聊天功能的落地页）、`app/layout.tsx`（根布局）、`app/api/generate/route.ts`（AI 生成 API 端点）
- **交互规则**: 仅调用 Server-Store 层，绝不直接调用 API Service 层或后端 API

### 2. Server-Store 层 (`/lib/server-store`)
- **用途**: 使用 TanStack Query 的数据交互枢纽，负责缓存、加载/错误状态和重试机制
- **关键文件**: `lib/server-store/providers/QueryProvider.tsx`（React Query 提供者）、`lib/server-store/index.ts`（主入口）
- **技术栈**: `@tanstack/react-query`
- **交互规则**: 仅调用 API Service 层，处理数据包装和缓存

### 3. API Service 层 (`/lib/services`)
- **用途**: 使用请求实例的纯 API 调用函数
- **关键文件**: `lib/request/index.ts`（全面的 HTTP 请求工具）
- **交互规则**: 使用请求实例调用后端 API，不包含业务逻辑、状态管理或缓存
- **类型组织**: API 类型放在 `services/types/` 中，与相应的服务文件共享

### 4. 组件层
- **业务组件** (`/components/biz`): 可复用的业务模块（聊天界面、AI 生成等）
- **基础组件** (`/components/ui`): 来自 Shadcn/ui 的原子级 UI 组件

### 严格的依赖规则

**✅ 允许的依赖：**
- 页面层 → Server-Store 层 → API Service 层 → 后端 API 端点
- 页面层 → 业务组件层 → 基础组件层
- 业务组件层 → 基础组件层
- API Service 层 → 后端 API 端点（通过请求实例）

**❌ 禁止的依赖：**
- 页面层 → API Service 层（必须经过 Server-Store 层）
- 页面层 → 后端 API 端点（必须经过 Server-Store 层）
- Server-Store 层 → 后端 API 端点（必须经过 API Service 层）
- 业务组件层 → API Service 层（必须经过 Server-Store 层）
- 基础组件层 → 业务组件层

## 技术栈

### 核心框架
- **Next.js 16+** 使用 App Router
- **React 19.2.0** 使用 TypeScript
- **Tailwind CSS v4** 用于样式
- **Node.js** 后端使用 API 路由

### AI 集成
- **@ai-sdk/react** (v2.0.101) 用于 AI 集成
- **@ai-sdk/openai-compatible** 支持灵活的 AI 提供商
- **流式代码生成** 实时显示

### UI 组件
- **Shadcn/ui** 组件系统使用 "new-york" 风格
- **Radix UI** 基元（avatar、scroll-area、slot）
- **Class Variance Authority (CVA)** 用于组件变体
- **Framer Motion** (v12.23.24) 用于动画
- **Lucide React** 用于图标

### 开发工具
- **ESLint** 使用 Next.js 配置
- **TypeScript** 严格模式
- **Geist 字体**（sans 和 mono）
- **PostCSS** 使用 Tailwind v4

## 关键特性

### AI 代码生成界面
- **实时流式**代码生成与实时显示
- **交互式聊天界面**带示例提示
- **代码高亮**和矩阵背景效果显示
- **键盘快捷键** (Ctrl+Enter) 快速生成
- **位置**: `/components/biz/chat/` 目录

### 高级 UI/UX
- **玻璃拟态**效果带背景滤镜
- **高级动画**使用 Framer Motion 和自定义 CSS
- **深色主题**带翠绿色/蓝色强调色
- **响应式设计**支持移动端优化
- **自定义滚动条**样式
- **加载状态**带骨架屏组件

### 组件系统
- **CVA 驱动**的组件变体
- **Radix UI** 基元保证可访问性
- **Shadcn/ui** 配置带 magicui 注册表
- **类型安全**的组件属性和 TypeScript

## 代码标准

### 命名约定
- **组件**: `PascalCase` (e.g., `UserProfile.tsx`)
- **Hooks**: `camelCase` 带 `use` 前缀 (e.g., `useUserData.ts`)
- **文件**: 具有清晰用途的描述性名称
- **Server Store**: `use` + 业务领域 + 功能（e.g., `useChatHistory`, `useUserProfile`）

### 架构规则
- **严格分层**: 完全遵循 4 层架构
- **组件组合**: 优先使用组合而非继承
- **类型安全**: 不使用 `any` 类型，为所有 API 响应定义明确接口
- **Suspense 边界**: 所有异步客户端组件用 Suspense 包裹，带骨架屏 fallback

### 性能优化
- 为动画使用 `will-change`
- 优化重新渲染，使用正确的依赖数组
- Suspense 边界带骨架屏 fallback
- 支持可访问性的减少动画

## 项目结构

```
/Users/fengye/Desktop/Wind/test/AI/ai-compoder/
├── app/                          # Next.js App Router 页面
│   ├── api/generate/             # AI 生成 API 端点
│   ├── page.tsx                  # 落地页
│   ├── layout.tsx                # 根布局和提供者
│   └── globals.css               # 全局样式使用 Tailwind v4
├── components/
│   ├── biz/                      # 业务组件
│   │   └── chat/                 # AI 聊天界面和流式传输
│   └── ui/                       # 基础 UI 组件 (Shadcn/ui)
├── lib/
│   ├── server-store/             # TanStack Query 数据层
│   ├── request/                  # HTTP 请求工具
│   ├── services/                 # API 服务函数
│   └── utils.ts                  # 工具函数 (cn 辅助函数)
├── docs/                         # 项目文档
└── public/                       # 静态资源
```

## 环境配置

必需的环境变量：
- `OPENAI_API_KEY`: OpenAI API 密钥或兼容提供商
- `OPENAI_BASE_URL`: OpenAI 兼容 API 的基础 URL (可选)
- `AI_PROVIDER`: AI 提供商名称 (e.g., 'openai', 'anthropic')
- `AI_MODEL`: AI 生成使用的模型名称

## 开发指南

### 处理 AI 生成时
- 始终使用 `components/biz/chat/` 中现有的 AI 聊天界面
- 遵循流式模式进行实时代码显示
- 与现有 API 端点结构集成
- 使用矩阵背景和玻璃拟态效果保持一致性

### 组件开发
- 优先使用 `components/ui/` 中的现有基础组件
- 业务组件应在多页面间高度可复用
- 避免过度抽象 - 将一次性逻辑保留在页面层

### API 集成
- 所有 API 调用必须通过 Server-Store 层
- API Service Layer 函数是纯函数且类型化
- `lib/request/` 中的请求实例处理超时、错误和拦截器
- Server-Store 使用 TanStack Query 进行缓存和状态管理

### 样式指南
- 使用 Tailwind CSS v4 工具类
- 不允许单独的 CSS 文件
- 可以抽象为 variants 工具函数但保持简洁
- 维护深色主题和翠绿色/蓝色强调色
- 使用玻璃拟态效果和背景滤镜营造高级感

## 包管理器

本项目使用 **pnpm** 作为包管理器。始终使用 `pnpm` 命令进行依赖管理。