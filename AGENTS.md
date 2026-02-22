# AGENTS.md - Coding Agent Guidelines

This document provides guidelines for AI coding agents working in this repository.

## Project Overview

- **Framework:** Next.js 16.1 with App Router
- **React Version:** 19.2
- **UI Framework:** Chakra UI 3.33
- **Language:** TypeScript (strict mode)
- **Package Manager:** pnpm 10.26+
- **Node Version:** >=22

## Build/Lint/Test Commands

### Development
```bash
pnpm dev          # Start development server (http://localhost:3000)
```

### Build
```bash
pnpm build        # Production build
pnpm start        # Start production server
```

### Linting
```bash
pnpm lint         # Run ESLint
pnpm lint --fix   # Run ESLint with auto-fix
```

### Testing
No test framework is currently configured. When tests are added:
```bash
# Future test commands (placeholder)
pnpm test                        # Run all tests
pnpm test <file>                 # Run single test file
pnpm test --watch                # Watch mode
```

### Installation
```bash
pnpm install      # Install dependencies
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
└── components/
    └── ui/                 # Reusable UI components
        └── provider.tsx    # Chakra UI provider
```

## Code Style Guidelines

### Imports

1. **Order imports** in this sequence:
   - React/Next.js imports
   - Third-party libraries
   - Internal modules (using `@/` alias)
   - Types (using `import type`)

2. **Use path aliases** - always use `@/` instead of relative paths:
```typescript
// ✓ Good
import { Provider } from "@/components/ui/provider";

// ✗ Bad
import { Provider } from "../../components/ui/provider";
```

3. **Use type-only imports** for types:
```typescript
import type { Metadata } from "next";
```

### TypeScript

1. **Strict mode is enabled** - never use `any` unless absolutely necessary
2. **Type all function parameters and return values**
3. **Use interface for objects, type for unions/primitives**
4. **Prefer `Readonly<>` for immutable props**

```typescript
// Component props typing
export default function Component({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ...
}
```

### React/Next.js Components

1. **Use `"use client"` directive** at the top of client components
2. **Export default** for page components
3. **Named exports** for utility/shared components
4. **PascalCase** for component names

```typescript
// Server component (default)
export default function Page() { ... }

// Client component
"use client";
export function InteractiveComponent() { ... }
```

### Chakra UI Styling

1. **Use Chakra UI components** instead of raw HTML elements
2. **Style with props** instead of CSS classes
3. **Use responsive arrays** for breakpoint-specific styles
4. **Dark mode** via `_dark` pseudo-selector

```typescript
<Box
  bg="white"
  _dark={{ bg: "gray.900" }}
  px={{ base: 4, md: 8 }}
  py={6}
>
  {children}
</Box>
```

### Formatting

- **Indentation:** 2 spaces
- **Semicolons:** Required
- **Quotes:** Double quotes for JSX, double for strings
- **Trailing commas:** ES5 compatible
- **Max line length:** Prefer ~100 characters, break JSX props when needed

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `UserProfile` |
| Functions | camelCase | `getUserData` |
| Variables | camelCase | `isLoading` |
| Constants | SCREAMING_SNAKE | `API_BASE_URL` |
| Types/Interfaces | PascalCase | `UserData` |
| Files (components) | PascalCase | `UserProfile.tsx` |
| Files (utilities) | camelCase | `formatDate.ts` |
| Folders | kebab-case | `user-profile/` |

### Error Handling

1. **Use try-catch** for async operations
2. **Provide meaningful error messages**
3. **Log errors with context**
4. **Handle loading and error states in UI**

```typescript
try {
  const data = await fetchData();
} catch (error) {
  console.error("Failed to fetch data:", error);
  // Handle error state
}
```

## Configuration Files

| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript configuration (strict mode) |
| `eslint.config.mjs` | ESLint rules (Next.js + TypeScript) |
| `next.config.ts` | Next.js configuration |
| `opencode.jsonc` | OpenCode AI agent configuration |

## Path Aliases

```typescript
// tsconfig.json paths
"@/*" → "./src/*"
```

## MCP Tools Available

This project has MCP (Model Context Protocol) tools configured:
- **chakra-ui:** Chakra UI component reference and examples
- **chrome-devtools:** Browser automation and debugging

## Common Tasks

### Adding a New Page
1. Create file in `src/app/<route>/page.tsx`
2. Export default function component
3. Add metadata export if needed

### Adding a New Component
1. Create in `src/components/ui/<name>.tsx`
2. Use named export
3. Add `"use client"` if interactive

### Styling Guidelines
- Prefer Chakra UI style props over CSS
- Use semantic color tokens when available
- Support dark mode with `_dark` prop
- Use responsive breakpoint notation

## Git Workflow

- Commit messages should be concise and descriptive
- Format: `<type>: <description>` (e.g., `feat: add user profile page`)
- Types: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`

## Notes for AI Agents

1. **Always check for existing patterns** before introducing new ones
2. **Prefer editing existing files** over creating new ones
3. **Run `pnpm lint`** after making changes
4. **Use Chakra UI components** - do not introduce other styling systems
5. **TypeScript strict mode** - ensure all types are correct
6. **Path aliases** - always use `@/` for imports
