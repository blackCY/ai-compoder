# Project Context

## 1. Project Overview

本项目是一个 **基于 AI 辅助的代码生成与业务开发平台**。
核心目标是利用 AI 理解业务需求，并调用**内部私有组件库**快速构建高质量的业务页面。

**核心原则：** 优先复用现有 UI 组件，通过流式传输接收 AI 生成的代码并渲染。

## 2. Architecture & Layers

本项目分为前端与后端两部分，遵循以下严格的分层架构

### Frontend Architecture (前端架构)

- **Page Layer (页面层，位于 /app)**

  - **职责：** 负责页面的整体布局与组装。
  - **交互规则：**
    1. 调用 **Server-Store Layer** 获取或处理后台数据。
    2. 组合 **Business Component Layer** 和 **Base Component Layer** 进行展示。
    3. **不直接**进行 API 调用。

- **Server-Store Layer (服务端状态管理层，位于 /lib/server-store)**

  - **职责：** 数据交互的中转站。
  - **核心技术：** `@tanstack/react-query`。
  - **交互规则：**
    1. 调用 **API Service Layer**（不直接调用后端 API endpoint）。
    2. 负责数据的包装、缓存管理、Loading/Error 状态处理。
    3. 向 **Page Layer** 暴露干净的数据 Hooks。
  - **结构规范：**
    - 所有功能必须封装成一个个调用 tanstack/react-query 的 hook
    - 按业务模块分目录组织（如 auth/、chat/、user/）
    - 使用 `use` + 业务领域 + 具体功能 的命名格式
    - 每个 hook 职责单一，负责一个特定的数据获取/操作逻辑
    - 统一的错误处理和重试机制，明确的 TypeScript 类型定义

- **API Service Layer (API 服务层，位于 /lib/services 或 /lib/api)**

  - **职责：** 使用 request 实例调用后端 API 的纯函数层。
  - **交互规则：**
    1. 使用 `request` 实例（来自 `/lib/request`）调用后端 API endpoints。
    2. 定义类型化的 API 函数（如 `fetchChatHistory()`、`postMessage()`）。
    3. **不包含业务逻辑、状态管理或缓存** - 仅负责纯粹的数据获取/提交。
    4. 仅被 **Server-Store Layer** 调用，页面层和组件层不能直接调用。
    5. 返回带有正确 TypeScript 类型的原始 API 响应。
  - **结构规范：**
    - 同一业务类型的 API 封装到同一个文件中（如 auth.ts、chat.ts、user.ts）
    - 类型定义统一放在 services/types/ 目录下，与对应的 api service 文件同名
    - 使用明确的动词 + 名词格式命名函数，如 fetchUserProfile、createChatMessage
    - 遵循纯函数原则，不包含业务逻辑，仅负责 API 调用和数据转换

- **Business Component Layer (业务组件层，位于 /components/biz)**

  - **职责：** 封装具有**高复用性**的业务模块（如 Header, Menu, UserProfile）。
  - **关键约束：** **避免过度封装**。只有在多个页面确实重复使用的业务逻辑才下沉到此层；一次性的业务逻辑应保留在 Page Layer。
  - **结构规范：**
    - 每个 business component 都是一个类似 src 的独立模块结构
    - 包含自己的 components/、utils/、hooks/、types/ 等目录结构
    - components/ 目录存放内部子组件
    - utils/ 目录存放组件专用的工具函数
    - hooks/ 目录存放组件内部的状态管理 Hooks
    - types/ 定义组件相关的类型
    - 通过 index.tsx 作为主入口，index.ts 统一导出保持清晰的 API

- **Base Component Layer (基础组件层，位于 /components/ui)**

  - **职责：** 提供原子级的 UI 基础组件（Button, Input, Modal 等）。
  - **交互规则：** AI 生成代码时，**必须**优先使用此层的组件，禁止手写原生 HTML。

#### 允许的依赖关系（必须遵守）

Page Layer → Server-Store 层 → API Service 层 → 后端 API Endpoints
Page Layer → 业务组件层 → 基础组件层
业务组件层 → 基础组件层
API Service 层 → 后端 API Endpoints（通过 request 实例）

#### 禁止的依赖（必须遵守）

❌ 页面层 → API Service 层（必须经过 Server-Store 层）
❌ 页面层 → 后端 API Endpoints（必须经过 Server-Store 层）
❌ Server-Store 层 → 后端 API Endpoints（必须经过 API Service 层）
❌ 业务组件层 → API Service 层（必须经过 Server-Store 层）
❌ 基础组件层 → 业务组件层
❌ UI 层反向依赖数据层

### Backend Architecture (后端架构)

- **Backend API Endpoints (后端 API 路由，位于 /app/api)**
  - **职责：** 处理来自前端请求的后端 API 路由。
  - **注意：** 这些 API 由前端的 **API Service 层** 调用，不会被前端组件或页面直接调用。

## 3. Tech Stack

- **Framework:** Next.js 16+ (App Router)
- **Styling:** Tailwind CSS (Utility-first)
- **State/Data:** TanStack Query (React Query)
- **Language:** TypeScript

## 4. Global Code Style

- **Component Pattern:**
  - 严格使用 **Function Components** 和 **Hooks**。
  - 提倡 **组合优于继承 (Composition over Inheritance)**。
- **Naming Conventions:**
  - 组件文件名使用 `PascalCase` (e.g., `UserProfile.tsx`).
  - Hooks 文件名使用 `camelCase` 并以 `use` 开头 (e.g., `useUserData.ts`).
- **Type Safety:**
  - 严禁使用 `any`。
  - 必须为 API 响应定义明确的 Interface。
- **Tailwind CSS 规范:**
  - 禁止写独立的 .css 文件
  - 可以抽象为 variants 工具函数，但尽量简洁