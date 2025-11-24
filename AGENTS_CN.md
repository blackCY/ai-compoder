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
    1. 调用 **API Data Layer**。
    2. 负责数据的包装、缓存管理、Loading/Error 状态处理。
    3. 向 **Page Layer** 暴露干净的数据 Hooks。

- **Business Component Layer (业务组件层，位于 /components/biz)**

  - **职责：** 封装具有**高复用性**的业务模块（如 Header, Menu, UserProfile）。
  - **关键约束：** **避免过度封装**。只有在多个页面确实重复使用的业务逻辑才下沉到此层；一次性的业务逻辑应保留在 Page Layer。

- **Base Component Layer (基础组件层，位于 /components/ui)**

  - **职责：** 提供原子级的 UI 基础组件（Button, Input, Modal 等）。
  - **交互规则：** AI 生成代码时，**必须**优先使用此层的组件，禁止手写原生 HTML。

- **API Data Layer (前端 API 层，位于 /app/api)**
  - **职责：** 纯粹的数据传输通道。
  - **交互规则：** 负责对接后端 endpoint，接收后端生成的代码（包括流式数据处理）。

#### 允许的依赖关系（必须遵守）

Page Layer → server-store 层 → API 数据层
Page Layer → 业务组件层 → 基础组件层
业务组件层 → 基础组件层

#### 禁止的依赖（必须遵守）

❌ 页面层 → API 数据层（必须经过 server-store）
❌ 业务组件层 → API（必须经过 server-store）
❌ 基础组件层 → 业务组件层
❌ UI 层反向依赖数据层

### Backend Architecture (后端架构)

- **API Data Layer (后端 API 层)**
  - **职责：** 处理 AI 代码生成请求。
  - **核心行为：** 通过 API endpoint 将 AI 生成的代码以**流式 (Streaming)** 方式传输到前端。

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