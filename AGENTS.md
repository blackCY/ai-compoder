# Project Context

## 1. Project Overview

This project is an **AI-assisted code generation and business development platform**.
The core objective is to leverage AI to understand business requirements and strictly utilize the **internal private component library** to rapidly build high-quality business pages.

- **Core Principle:** Prioritize reusing existing UI components. Receive and render AI-generated code via streaming data.

## 2. Architecture & Layers

The project is divided into Frontend and Backend, strictly adhering to the following layering logic:

### Frontend Architecture

- **Page Layer (Located in /app)**

  - **Responsibility:** Handles overall page layout and assembly.
  - **Interaction Rules:**
    1. Calls the **Server-Store Layer** to fetch or process backend data.
    2. Assembles **Business Components** and **Base Components** for display.
    3. **DOES NOT** make direct API calls.

- **Server-Store Layer (Located in /lib/server-store)**

  - **Responsibility:** Acts as the data interaction hub.
  - **Core Tech:** `@tanstack/react-query`.
  - **Interaction Rules:**
    1. Calls the **API Data Layer**.
    2. Handles data wrapping, caching, and Loading/Error states.
    3. Exposes clean data hooks to the **Page Layer**.

- **Business Component Layer (Located in /components/biz)**

  - **Responsibility:** Encapsulates **highly reusable** business modules (e.g., Header, Menu, UserProfile).
  - **Critical Constraint:** **Avoid over-abstraction.** Only encapsulate logic that is truly reused across multiple pages. One-off business logic should remain in the Page Layer.

- **Base Component Layer (Located in /components/ui)**

  - **Responsibility:** Provides atomic, reusable UI components (Button, Input, Modal, etc.).
  - **Interaction Rules:** The AI **MUST** prioritize using components from this layer when generating code. Do not use raw HTML unless absolutely necessary.

- **API Data Layer (Located in /app/api)**
  - **Responsibility:** Pure data transmission channel.
  - **Interaction Rules:** Receives backend-generated code (via API endpoints), specifically handling **streaming** data reception.

#### Allowed dependencies (must be adhered to)

Page Layer → server-store Layer → API Data Layer
Page Layer → Business Component Layer → Base Component Layer
Business Component Layer → Base Component Layer

#### Forbidden dependencies (must be adhered to)

❌ Page Layer → API Data Layer (must go through server-store)
❌ Business Component Layer → API (must go through server-store)
❌ Base Component Layer → Business Component Layer
❌ UI Layer reverse dependency data layer

### Backend Architecture

- **API Data Layer**
  - **Responsibility:** Handles AI code generation requests.
  - **Core Behavior:** Streams AI-generated code to the frontend via API endpoints.

## 3. Tech Stack

- **Framework:** Next.js 16+ (App Router)
- **Styling:** Tailwind CSS (Utility-first)
- **State/Data:** TanStack Query (React Query)
- **Language:** TypeScript

## 4. Global Code Style

- **Component Pattern:**
  - Strictly use **Function Components** and **Hooks**.
  - Prefer **Composition over Inheritance**.
- **Naming Conventions:**
  - Component filenames: `PascalCase` (e.g., `UserProfile.tsx`).
  - Hook filenames: `camelCase` prefixed with `use` (e.g., `useUserData.ts`).
- **Type Safety:**
  - Use of `any` is **strictly prohibited**.
  - Explicit TypeScript Interfaces/Types must be defined for all API responses.
- **Tailwind CSS Specification:**
  - Writing independent .css files is prohibited
  - Can be abstracted into variants utility functions, but keep them as concise as possible