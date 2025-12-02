# Services Architecture

This directory contains backend services that can be called directly from Server Components or other backend services. **No API routes needed!**

## Structure

Each service follows this pattern (like your embedding service):

```
services/
  ai/
    types.ts      # Data type definitions (LLMRequest, LLMResponse, etc.)
    config.ts     # Configuration constants
    deps.ts       # Dependency types
    internal.ts   # Internal utilities/validation
    service.ts    # Service interface + factory function (ILLMService)
    index.ts      # Exports
```

**Note:** The service interface (`ILLMService`) is defined in `service.ts`, not `types.ts`. This gives you a clear overview of all available functions when opening the service file.

## Usage

### From Server Components

```typescript
// app/page.tsx (Server Component)
import { llmService } from "@/lib/services";

export default async function Page() {
  // ✅ Direct call - no API routes!
  const result = await llmService.getResponse({
    prompt: "Hello!",
  });
  
  return <div>{result.content}</div>;
}
```

### From Other Services

```typescript
// lib/services/another-service.ts
import { llmService } from "@/lib/services";

export async function myService() {
  // ✅ Call other services directly
  const response = await llmService.getResponse({
    prompt: "Process this data",
  });
  
  return response;
}
```

### From Server Actions (for Client Components)

```typescript
// lib/actions.ts
"use server";

import { llmService } from "@/lib/services";

export async function callLLMAction(prompt: string) {
  return await llmService.getResponse({ prompt });
}
```

## Adding a New Service

1. Create service directory: `lib/services/my-service/`
2. Create files:
   - `types.ts` - Type definitions
   - `config.ts` - Configuration
   - `deps.ts` - Dependency types
   - `internal.ts` - Internal utilities
   - `service.ts` - Service factory
   - `index.ts` - Exports
3. Initialize in `lib/services/index.ts`:

```typescript
import { createMyService } from "./my-service";
import { MY_SERVICE_CONFIG } from "./my-service/config";

export const myService = createMyService({
  config: MY_SERVICE_CONFIG,
  // other deps
});
```

## Benefits

- ✅ **No API routes** - Call services directly
- ✅ **Type-safe** - Full TypeScript support
- ✅ **Testable** - Easy to mock dependencies
- ✅ **Reusable** - Services can call other services
- ✅ **Clean architecture** - Separation of concerns

## Authentication

Services can access authentication via `auth()` from `@clerk/nextjs/server`:

```typescript
import { auth } from "@clerk/nextjs/server";

const { userId } = await auth();
```

