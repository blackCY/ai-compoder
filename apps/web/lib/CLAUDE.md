# Lib Folder Documentation

> [!NOTE]
> This folder is dedicated to frontend-specific functionality and utilities.

## Overview

The `lib` directory serves as the core utility hub for the frontend application. It contains shared resources, helper functions, hooks, and store configurations that are essential for building a robust and scalable frontend architecture.

## Directory Structure

- **utils/**: General utility functions and helpers.
- **hooks/**: Custom React hooks for shared logic.
- **store/**: Client-side state management (e.g., Zustand stores).
- **server-store/**: Server-side state management and providers.
- **request/**: Network request utilities and API wrappers.
- **services/**: Domain-specific business logic and services (e.g., pipeline handling).

## Guidelines

1. **Frontend Only**: This folder should only contain code relevant to the client-side application. Backend logic should be placed elsewhere (e.g., `app/api`).
2. **Reusability**: Code placed here should be designed for reuse across multiple components or pages.
3. **Modularity**: Keep functions and files small and focused on specific tasks.

## Best Practices

- Use `index.ts` files to export public APIs from subdirectories.
- Ensure all utilities are typed with TypeScript.
- Document complex logic within the code or in accompanying markdown files.
