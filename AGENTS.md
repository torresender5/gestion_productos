# AGENTS.md - Codebase Guide

This is a React 19 + TypeScript + Vite product management application for a small business (facturación/inventario system).

## Build, Lint, and Test Commands

```bash
# Development
npm run dev          # Start dev server at http://localhost:5173

# Production
npm run build        # Type-check with tsc -b, then build with Vite
npm run preview      # Preview production build locally

# Type-checking (built into build command)
tsc -b               # Type-check all TypeScript files
```

**No test framework is currently configured.** Do not add tests unless explicitly requested.

---

## Tech Stack

- **React 19** with hooks (useState, useEffect, useCallback, useMemo, useRef)
- **TypeScript 5** with strict mode enabled
- **Vite 7** for bundling
- **Tailwind CSS 4** for styling (CSS-based, no config file)
- **Zustand 5** for state management
- **React Router 7** for routing
- **Zod 4** + **React Hook Form 7** for validation
- **Axios** for HTTP requests
- **Lucide React** for icons
- **Recharts** for charts

---

## Project Structure

```
src/
├── components/       # Shared UI components (Modal, Layout, Sidebar, etc.)
├── pages/            # Route page components (Dashboard, Products, Sales, etc.)
├── stores/           # Zustand stores (productStore, cartStore, authStore, etc.)
├── services/         # API service modules (productService, authService, etc.)
├── types/            # TypeScript interfaces and types
├── lib/              # Utilities (api.ts, utils.ts)
└── App.tsx           # Root component with routes
```

---

## Code Style Guidelines

### Naming Conventions

| Type              | Convention       | Example                          |
|-------------------|------------------|----------------------------------|
| Components        | PascalCase       | `Products.tsx`, `CartPanel.tsx`  |
| Functions/Vars    | camelCase        | `fetchProducts`, `isModalOpen`    |
| Types/Interfaces  | PascalCase       | `Product`, `CreateProductDto`     |
| Constants         | PascalCase       | `TAX_RATE`, `CATEGORIES`          |
| CSS classes       | Tailwind classes | `className="flex items-center"`  |

### Imports

- Use **path aliases**: `@/*` maps to `src/*`
  ```typescript
  import { useProductStore } from '@/stores/productStore'
  import type { Product } from '@/types'
  ```
- Use **named imports** for types: `import type { Product } from '@/types'`
- Order: React → third-party → internal (named imports) → internal (default imports)

### TypeScript

- **Always use TypeScript types** - no `any` without good reason
- Use **interfaces** for data shapes (API responses, store state)
- Use **type** for unions, DTOs, and utility types
- Avoid using `// @ts-ignore` or `// @ts-nocheck`
- `noUnusedLocals: false` and `noUnusedParameters: false` in tsconfig (not enforced)

### React Components

- Use **function components** exclusively (no class components)
- **Default export** for page components, **named export** for reusable components
- Destructure props in function signature
- Prefer **inline handlers** for simple events, **useCallback** for expensive operations
- Use **React.memo** sparingly for performance-critical components

### State Management (Zustand)

```typescript
interface ProductStore {
  products: Product[]
  loading: boolean
  error: string | null
  fetchProducts: () => Promise<void>
  // methods...
}

export const useProductStore = create<ProductStore>()((set, get) => ({
  // state and methods
}))
```

- Store errors in `error` state, not thrown (caller decides handling)
- Methods that can fail return `{ ok: boolean; error?: string }` pattern
- Use `get()` for cross-slice access, `useProductStore.getState()` for access outside React

### API Services

```typescript
export const productService = {
  getAll: async (): Promise<Product[]> => {
    const { data } = await api.get<Product[]>('/products')
    return data
  },
  // ...
}
```

- Use **barrel exports** in service files
- Use **DTOs** (Data Transfer Objects) for create/update payloads
- Axios instance with interceptors is in `src/lib/api.ts`
- API base URL from `VITE_API_URL` env var, defaults to `http://localhost:3000/`

### Error Handling

- **Store errors**: Store in `error` state, display in UI
- **Service errors**: Re-throw or return error result objects
- **API errors**: Use `err.response?.data?.message` for user-friendly messages
- **Form errors**: Display using react-hook-form validation

### Styling (Tailwind CSS v4)

- Use **utility classes** exclusively (no custom CSS except `@layer base`)
- Tailwind v4 uses `@import "tailwindcss"` (no config file needed)
- Common patterns:
  - Layout: `flex items-center justify-between`
  - Spacing: `p-4`, `m-2`, `gap-3`, `space-y-4`
  - Typography: `text-lg font-bold text-gray-500`
  - Interactive: `hover:bg-blue-50 transition-colors`
  - Responsive: `flex-col sm:flex-row`, `hidden sm:inline`

### File Organization

- **One export per file** for stores and services (named export)
- **Types in single file**: All types/interfaces in `src/types/index.ts`
- **Constants grouped**: `utils.ts` contains formatting functions and constants
- **Barrel exports** where appropriate for clean imports

### Common Patterns

**Form handling with React Hook Form + Zod:**
```typescript
// Use zod schemas with react-hook-form resolver
// Handle submit in onSubmit, validate with zod schema
```

**Cart operations:**
```typescript
// Cart is managed via useCartStore with addItem, removeItem, updateQuantity, clearCart
```

**Protected routes:**
```typescript
// Wrap protected routes with <ProtectedRoute> component
// Checks auth token in localStorage
```

---

## Environment Variables

```
VITE_API_URL=http://localhost:3000/   # Backend API URL
```

---

## Working with this Codebase

1. **Adding a new store**: Create in `src/stores/`, follow Zustand pattern
2. **Adding a new service**: Create in `src/services/`, follow service pattern
3. **Adding a new page**: Create in `src/pages/`, default export, add route in App.tsx
4. **Adding a new type**: Add to `src/types/index.ts`
5. **Styling**: Use Tailwind utility classes inline, avoid custom CSS

---

## Notes

- Backend API expected at port 3000 (configurable via VITE_API_URL)
- Auth token stored in `localStorage` as `auth-token`
- 401 responses trigger automatic redirect to `/login`
- Currency formatting uses Colombian Peso (COP) locale `es-CO`
- Comments and UI text are in Spanish
