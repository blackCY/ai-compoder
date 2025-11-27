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
    1. Calls the **API Service Layer** (NOT backend API endpoints directly).
    2. Handles data wrapping, caching, and Loading/Error states.
    3. Exposes clean data hooks to the **Page Layer**.
  - **Structure Specifications:**
    - All functionality must be encapsulated as individual hooks calling tanstack/react-query
    - Organize by business modules in directories (e.g., auth/, chat/, user/)
    - Use `use` + business domain + specific functionality naming format
    - Each hook has single responsibility, handling one specific data fetching/operation logic
    - Unified error handling and retry mechanisms with clear TypeScript type definitions

- **API Service Layer (Located in /lib/services or /lib/api)**

  - **Responsibility:** Pure API calling functions using the request instance.
  - **Interaction Rules:**
    1. Uses the `request` instance (from `/lib/request`) to call backend API endpoints.
    2. Defines typed API functions (e.g., `fetchChatHistory()`, `postMessage()`).
    3. **NO business logic, state management, or caching** - just pure data fetching/posting.
    4. Called ONLY by the **Server-Store Layer**, never directly by Page or Component layers.
    5. Returns raw API responses with proper TypeScript types.
  - **Structure Specifications:**
    - APIs of the same business type are encapsulated in the same file (e.g., auth.ts, chat.ts, user.ts)
    - Type definitions are uniformly placed in services/types/ directory, sharing the same name as the corresponding API service file
    - Use clear verb + noun format for function naming, such as fetchUserProfile, createChatMessage
    - Follow pure function principles, without business logic, only responsible for API calls and data transformation

- **Business Component Layer (Located in /components/biz)**

  - **Responsibility:** Encapsulates **highly reusable** business modules (e.g., Header, Menu, UserProfile).
  - **Critical Constraint:** **Avoid over-abstraction.** Only encapsulate logic that is truly reused across multiple pages. One-off business logic should remain in the Page Layer.
  - **Structure Specifications:**
    - Each business component is an independent module structure similar to src
    - Contains its own components/, utils/, hooks/, types/ and other directory structures
    - components/ directory stores internal sub-components
    - utils/ directory stores component-specific utility functions
    - hooks/ directory stores internal state management Hooks for the component
    - types/ defines component-related types
    - Use index.tsx as the main entry point, with index.ts for unified exports to maintain clear API
    - Component filenames: `PascalCase` (e.g., `UserProfile.tsx`).

- **Base Component Layer (Located in /components/ui)**

  - **Responsibility:** Provides atomic, reusable UI components (Button, Input, Modal, etc.).
  - **Interaction Rules:** The AI **MUST** prioritize using components from this layer when generating code. Do not use raw HTML unless absolutely necessary.

#### Allowed dependencies (must be adhered to)

Page Layer → Server-Store Layer → API Service Layer → Backend API Endpoints
Page Layer → Business Component Layer → Base Component Layer
Business Component Layer → Base Component Layer
API Service Layer → Backend API Endpoints (via request instance)

#### Forbidden dependencies (must be adhered to)

❌ Page Layer → API Service Layer (must go through Server-Store Layer)
❌ Page Layer → Backend API Endpoints (must go through Server-Store Layer)
❌ Server-Store Layer → Backend API Endpoints (must go through API Service Layer)
❌ Business Component Layer → API Service Layer (must go through Server-Store Layer)
❌ Base Component Layer → Business Component Layer
❌ UI Layer reverse dependency data layer

### Backend Architecture

- **Backend API Endpoints (Located in /app/api)**
  - **Responsibility:** Backend API routes that handle requests from the frontend.
  - **Note:** These are called by the frontend **API Service Layer**, not directly by frontend components or pages.

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