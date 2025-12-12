<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**AI Compoder** is an AI-assisted code generation and business development platform built with Next.js 16+. The platform leverages AI to understand business requirements and uses an internal private component library to rapidly build high-quality business pages with real-time streaming code generation.

## Development Commands

```bash
# Development server
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# ESLint checking
pnpm lint
```

## Front-end Architecture & Layering

This front-end part of this project follows a **strict 4-layer architecture** with enforced dependency rules:

### 1. Page Layer (`/app`)
- **Location**: `/app` directory with Next.js App Router
- **Responsibility**: Overall page layout and component assembly
- **Key Files**: `app/page.tsx` (landing page with hero, features, and chat), `app/layout.tsx` (root layout), `app/api/generate/route.ts` (AI generation API endpoint)
- **Interaction Rules**: Calls Server-Store Layer only, NEVER calls API Service Layer or backend APIs directly

### 2. Server-Store Layer (`/lib/server-store`)
- **Purpose**: Data interaction hub using TanStack Query for caching, loading/error states, and retry mechanisms
- **Key Files**: `lib/server-store/providers/QueryProvider.tsx` (React Query provider), `lib/server-store/index.ts` (main entry)
- **Tech Stack**: `@tanstack/react-query`
- **Interaction Rules**: Calls API Service Layer only, handles data wrapping and caching

### 3. API Service Layer (`/lib/services`)
- **Purpose**: Pure API calling functions using the request instance
- **Key Files**: `lib/request/index.ts` (comprehensive HTTP request utility)
- **Interaction Rules**: Uses request instance to call backend APIs, contains NO business logic, state management, or caching
- **Type Organization**: API types in `services/types/`, shared with corresponding service files

### 4. Component Layers
- **Business Components** (`/components/biz`): Reusable business modules (chat interface, AI generation)
- **Base Components** (`/components/ui`): Atomic UI components from Shadcn/ui

## Strict Dependency Rules

**✅ Allowed Dependencies:**
- Page Layer → Server-Store Layer → API Service Layer → Backend API Endpoints
- Page Layer → Business Component Layer → Base Component Layer
- Business Component Layer → Base Component Layer
- API Service Layer → Backend API Endpoints (via request instance)

**❌ Forbidden Dependencies:**
- Page Layer → API Service Layer (must go through Server-Store Layer)
- Page Layer → Backend API Endpoints (must go through Server-Store Layer)
- Server-Store Layer → Backend API Endpoints (must go through API Service Layer)
- Business Component Layer → API Service Layer (must go through Server-Store Layer)
- Base Component Layer → Business Component Layer

## Tech Stack

### Core Framework
- **Next.js 16+** with App Router
- **React 19.2.0** with TypeScript
- **Tailwind CSS v4** for styling
- **Node.js** backend with API routes

### AI Integration
- **@ai-sdk/react** (v2.0.101) for AI integration
- **@ai-sdk/openai-compatible** for flexible AI provider support
- **Streaming code generation** with real-time display

### UI Components
- **Shadcn/ui** component system with "new-york" style
- **Radix UI** primitives (avatar, scroll-area, slot)
- **Class Variance Authority (CVA)** for component variants
- **Framer Motion** (v12.23.24) for animations
- **Lucide React** for icons

### Development Tools
- **ESLint** with Next.js configuration
- **TypeScript** strict mode
- **Geist fonts** (sans and mono)
- **PostCSS** with Tailwind v4

## Key Features

### AI Code Generation Interface
- **Real-time streaming** code generation with live display
- **Interactive chat interface** with example prompts
- **Code highlighting** and display with matrix background effects
- **Keyboard shortcuts** (Ctrl+Enter) for quick generation
- **Location**: `/components/biz/chat/` directory

### Advanced UI/UX
- **Glass morphism** effects with backdrop filters
- **Premium animations** using Framer Motion and custom CSS
- **Dark theme** with emerald/blue accent colors
- **Responsive design** with mobile optimization
- **Custom scrollbar** styling
- **Loading states** with skeleton components

### Component System
- **CVA-powered** component variants
- **Radix UI** primitives for accessibility
- **Shadcn/ui** configuration with magicui registry
- **Type-safe** component props with TypeScript

## Code Standards

### Directory-Specific Guidelines
- **CRITICAL**: When working in any subdirectory that contains an `AGENTS.md` or `CLAUDE.md` file, you MUST read and strictly follow the specifications defined in that file
- **Examples**: 
  - `components/biz/CLAUDE.md` - Contains specific rules for business component development
  - Other directories may have their own `AGENTS.md` files with domain-specific requirements
- **Priority**: Directory-specific guidelines take precedence over general project guidelines when working within that directory
- **Discovery**: Always check for `AGENTS.md` or `CLAUDE.md` files when entering a new directory structure

### Naming Conventions
- **Components**: `PascalCase` (e.g., `UserProfile.tsx`)
- **Hooks**: `camelCase` with `use` prefix (e.g., `useUserData.ts`)
- **Files**: Descriptive names with clear purpose
- **Server Store**: `use` + business domain + functionality (e.g., `useChatHistory`, `useUserProfile`)

### Architectural Rules
- **Strict layering**: Follow the 4-layer architecture exactly
- **Component composition**: Prefer composition over inheritance
- **Type safety**: No `any` types, explicit interfaces for all API responses
- **Suspense boundaries**: All async client components wrapped in Suspense with skeleton fallback

### Performance Optimizations
- `will-change` for animations
- Optimized re-renders with proper dependency arrays
- Suspense boundaries with skeleton fallbacks
- Reduced motion support for accessibility

## Front-end Project Structure

```
/Users/fengye/Desktop/Wind/test/AI/ai-compoder/
├── app/                          # Next.js App Router
│   ├── (main)/                   # Main route group - all page route files are defined here
│   │   │                        # Route groups allow shared layouts without affecting URL paths
│   │   ├── page.tsx             # Homepage (root path /)
│   ├── api/                      # API routes - backend interface endpoints
│   │   │                        # Supports HTTP methods like GET, POST, PUT, DELETE
│   ├── actions/                  # Server Actions - server-side operation functions
│   │   │                        # Server functions callable from client, supporting database operations
│   ├── layout.tsx                # Root layout and providers - global app layout
│   │   │                        # Contains global styles, fonts, theme providers, etc.
│   ├── not-found.tsx            # 404 page - custom not found page
│   └── globals.css               # Global styles with Tailwind v4
├── components/
│   ├── biz/                      # Business components (reusable business modules)
│   └── ui/                       # Base UI components (Shadcn/ui)
│       │                        # Atomic UI components like buttons, inputs, cards, etc.
├── lib/
│   ├── server-store/             # TanStack Query data layer
│   │   │                        # Manages server data fetching, caching, state synchronization
│   ├── store/                    # Client state management (like pipeline store)
│   │   │                        # Uses Zustand or Context API for client state management
│   ├── request/                  # HTTP request utilities
│   │   │                        # Encapsulates fetch/axios, unified handling of headers, errors
│   ├── services/                 # API service functions
│   │   │                        # Pure functions encapsulating specific API call logic
│   └── utils.ts                  # Common utility functions (cn helper function)
│       │                        # Cross-component shared pure utility functions, like class name merging
└── public/                       # Static assets
    │                           # Images, fonts, icons and other static files
```

### Page Route Resource Management Principles

1. **Page-specific Resources**: Each page route directory's `components/`, `utils/`, `types/` are for that page only
2. **Shared Resource Extraction**: When a component or utility function needs to be used by multiple pages, extract it to:
   - `components/biz/` - Reusable business components
   - `components/ui/` - Reusable base UI components
   - `lib/utils.ts` - Reusable common utility functions
3. **Naming Conventions**: Page-specific resources should use clear prefixes or namespaces to avoid conflicts with shared resources

### Route Group Advantages

Benefits of using `(main)` route group:
- **Shared Layout**: Can provide unified layout for all pages in the group
- **Code Organization**: Related pages can be organized together for easier management
- **Clean URLs**: Does not affect actual URL paths (like `/editor` instead of `/main/editor`)

## Environment Configuration

Required environment variables:
- `OPENAI_API_KEY`: OpenAI API key or compatible provider
- `OPENAI_BASE_URL`: Base URL for OpenAI-compatible API (optional)
- `AI_PROVIDER`: AI provider name (e.g., 'openai', 'anthropic')
- `AI_MODEL`: Model name for AI generation

## Development Guidelines

### When Working with AI Generation
- Always use the existing AI chat interface in `components/biz/chat/`
- Follow the streaming pattern for real-time code display
- Integrate with the existing API endpoint structure
- Use the matrix background and glass morphism effects for consistency

### Component Development
- Prioritize using existing base components from `components/ui/`
- Business components should be highly reusable across pages
- Avoid over-abstraction - keep one-off logic in Page Layer

### API Integration
- All API calls must go through the Server-Store Layer
- API Service Layer functions are pure and typed
- Request instance in `lib/request/` handles timeout, errors, and interceptors
- Server-Store uses TanStack Query for caching and state management

### Styling Guidelines
- Use Tailwind CSS v4 utility classes
- No separate CSS files allowed
- Can abstract into variants utility functions but keep them concise
- Maintain the dark theme with emerald/blue accents
- Use glass morphism effects and backdrop filters for premium feel

## Package Manager

This project uses **pnpm** as the package manager. Always use `pnpm` commands for dependency management.