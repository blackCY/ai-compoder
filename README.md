# AI Compoder

<div align="center">

**AI 驱动的智能代码生成平台**

基于 AI 的代码理解和生成，准确把握业务需求，利用内部私有组件库快速构建高质量的业务页面。

[English](#english) | [中文介绍](#中文介绍)

</div>

---

## 中文介绍

### 🎯 项目简介

**AI Compoder** 是一个创新的 AI 辅助代码生成和业务开发平台，基于 Next.js 16+ 构建。平台通过 AI 理解业务需求，利用内部私有组件库实现实时流式代码生成，帮助开发者快速构建高质量的业务页面。

### ✨ 核心特性

#### 智能代码生成
- 基于 AI 的需求理解和代码生成
- 支持多种 AI 模型（OpenAI、Anthropic 等）
- 精准把握业务需求，生成符合规范的高质量代码

#### Pipeline 工作流
- 多阶段处理流程设计
- 可视化流程图配置和管理
- 灵活的阶段编排和资源管理

#### 实时流式生成
- 实时展示代码生成过程
- 基于 Server-Sent Events (SSE) 的流式数据传输
- 即时反馈和交互体验

#### 可视化配置
- 图形化 Pipeline 编辑器
- 节点拖拽和连线
- 系统提示词和 Schema 配置

#### 代码编辑和预览
- 集成 Monaco Editor
- 实时代码预览和编辑
- 语法高亮和智能补全

### 🏗️ 技术架构

#### 前端技术栈
- **Next.js 16.0.7** - React 全栈框架
- **React 19.2.1** - UI 框架
- **TypeScript** - 类型安全
- **Tailwind CSS v4** - 样式框架

#### AI 集成
- **@ai-sdk/react** - AI 集成 SDK
- **@ai-sdk/openai** - OpenAI 支持
- **@ai-sdk/openai-compatible** - 开放式 AI 提供商支持

#### UI 组件库
- **Shadcn/ui** - 组件系统
- **Radix UI** - 无障碍原语
- **Framer Motion** - 动画库
- **Lucide React** - 图标系统

#### 状态管理
- **@tanstack/react-query** - 服务端状态管理
- **jotai** - 客户端原子状态管理

#### 数据库
- **Supabase** - 后端服务和数据库

### 📁 项目结构

```
ai-compoder/
├── apps/
│   └── web/                      # Next.js Web 应用
│       ├── app/                  # App Router（页面、api、actions）
│       ├── lib/                  # Web 端内部模块
│       ├── db/                   # Web 端数据库访问层
│       ├── public/               # Web 静态资源
│       └── package.json
├── packages/
│   └── react-renderer/           # 可复用渲染器包（workspace）
└── package.json                  # workspace 根编排脚本
```

### 🏛️ 四层架构

项目严格遵循**四层架构设计**：

1. **页面层** (`/apps/web/app`) - 页面布局和组件组装
2. **Server-Store 层** (`/apps/web/lib/serverStore`) - 数据交互和缓存
3. **API Service 层** (`/apps/web/lib/services`) - 纯粹的 API 调用
4. **组件层** (`/apps/web/lib/components`) - UI 组件复用

**依赖规则**：
- ✅ 页面层 → Server-Store 层 → API Service 层 → 后端 API
- ❌ 禁止跨层调用

### 🚀 快速开始

#### 环境要求
- Node.js 18+
- pnpm（推荐）或 npm/yarn

#### 安装依赖

```bash
pnpm install
```

#### 配置环境变量

创建 `apps/web/.env.local` 文件：

```bash
# AI 提供商配置
OPENAI_API_KEY=your_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1  # 可选
AI_PROVIDER=openai
AI_MODEL=gpt-4

# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 启动开发服务器

```bash
pnpm web:dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

#### 构建生产版本

```bash
pnpm web:build
pnpm web:start
```

#### Monorepo 工作区命令

```bash
pnpm ws:build
pnpm ws:lint
pnpm ws:test
pnpm ws:typecheck
```

### 📖 主要功能页面

#### 首页 (`/`)
- 产品定位展示
- 功能特性介绍
- Pipeline 网格展示
- 创建新 Pipeline 入口

#### 配置页 (`/configuration/[id]`)
- Pipeline 流程图可视化
- Stage 配置编辑
- 系统提示词编辑
- 资源管理
- Schema 配置

#### 编辑器页 (`/editor`)
- 代码实时生成和预览
- Monaco Editor 集成
- 终端输出展示
- 使用统计面板

### 🎨 设计系统

- **深色主题** - 以 `bg-gray-950` 为主的深色设计
- **玻璃拟态** - `backdrop-filter: blur()` 实现现代感
- **翠蓝渐变** - emerald 和 blue 系列强调色
- **响应式设计** - 完整的移动端适配

### 📜 许可证

[MIT](LICENSE)

---

## English

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, install dependencies:

```bash
pnpm install
```

Then, run the development server:

```bash
pnpm web:dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment Variables

Create a `.env.local` file:

```bash
# AI Provider Configuration
OPENAI_API_KEY=your_api_key_here
OPENAI_BASE_URL=https://api.openai.com/v1  # Optional
AI_PROVIDER=openai
AI_MODEL=gpt-4

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Build for Production

```bash
pnpm web:build
pnpm web:start
```

## Features

- **AI-Powered Code Generation** - Understand requirements and generate high-quality code
- **Pipeline Workflow** - Multi-stage processing with visual configuration
- **Real-time Streaming** - Live code generation with instant feedback
- **Visual Editor** - Graphical Pipeline editor with drag-and-drop
- **Monaco Integration** - Professional code editing experience

## Tech Stack

- **Framework**: Next.js 16+, React 19
- **AI SDK**: @ai-sdk/react, @ai-sdk/openai
- **UI**: Shadcn/ui, Radix UI, Framer Motion
- **State**: TanStack Query, Jotai
- **Database**: Supabase
- **Styling**: Tailwind CSS v4

## License

[MIT](LICENSE)
