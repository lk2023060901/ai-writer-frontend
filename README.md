# AI Writer Frontend

企业级 Next.js + HeroUI 前端项目，遵循 SOLID 原则，基于 Context 的可扩展架构。

## 🏗️ 架构特点

### 1. **Context-First 设计**
所有核心服务的第一个参数都是 Context 对象，方便扩展和追踪：

```typescript
// API 调用
const context = contextFactory.createApiContext(token);
const response = await apiClient.get(context, '/users');

// 日志记录
const logCtx = createLogContext('MyModule');
logger.info(logCtx, 'Operation completed', { userId: '123' });
```

### 2. **SOLID 原则**

- **单一职责原则 (SRP)**: 每个类只负责一个功能
- **开放封闭原则 (OCP)**: 通过拦截器扩展功能，无需修改核心代码
- **里氏替换原则 (LSP)**: 所有实现都基于接口，可替换
- **接口隔离原则 (ISP)**: 接口职责单一，避免臃肿
- **依赖倒置原则 (DIP)**: 依赖抽象接口，而非具体实现

### 3. **类型安全**
- 避免使用 `any` 类型
- 完善的 TypeScript 类型定义
- 严格的类型检查

### 4. **统一处理**
- 统一的 API 客户端
- 统一的日志系统
- 统一的错误处理
- 统一的路由管理

## 📁 项目结构

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # 认证路由组
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/             # 业务路由组（登录后）
│   │   ├── chat/
│   │   └── launchpad/
│   └── api/                     # API 路由
├── components/
│   ├── ui/                      # 基础 UI 组件
│   ├── forms/                   # 表单组件
│   ├── layouts/                 # 布局组件
│   └── shared/                  # 共享业务组件
├── lib/
│   ├── api/                     # API 客户端
│   │   ├── ApiClient.ts
│   │   └── interceptors/
│   ├── context/                 # Context 工厂
│   ├── logger/                  # 日志系统
│   ├── error/                   # 错误处理
│   ├── hooks/                   # 自定义 Hooks
│   └── utils/                   # 工具函数
├── stores/                      # Zustand stores
├── types/                       # TypeScript 类型定义
│   ├── api.ts
│   ├── auth.ts
│   ├── context.ts
│   ├── error.ts
│   ├── logger.ts
│   └── route.ts
├── features/                    # 特性域模块（业务组件、hooks、样式）
│   └── chat/                    # Chat 功能模块
├── shared/                      # 跨特性共享代码
│   ├── api/                     # API 客户端与拦截器
│   ├── context/                 # React Context 定义
│   ├── hooks/                   # 公共 Hooks
│   ├── providers/               # 主题/Antd Provider 等
│   ├── guards/                  # 路由守卫组件
│   └── ui/                      # 基础 UI 与容器
├── assets/                      # 静态资源与样式
├── stores/                      # Zustand stores
├── types/                       # TypeScript 类型定义
└── styles/                      # 全局样式
```

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env.local` 文件：

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_LOG_LEVEL=info

# 可选：启用前端 Mock API
# NEXT_PUBLIC_API_USE_MOCK=true
```

### 3. 启动开发服务器

```bash
npm run dev
```

### Mock API

在没有后端的情况下可使用内置 Mock API：

```bash
NEXT_PUBLIC_API_USE_MOCK=true npm run dev
```

默认账号：`demo@example.com`，密码：`demo123`。

更多配置与扩展说明见 [`docs/mock-api.md`](docs/mock-api.md)。

## 📖 使用指南

### API 调用示例

```typescript
import { apiClient, contextFactory } from '@/shared';

// 创建 API 上下文
const context = contextFactory.createApiContext(token);

// GET 请求
const users = await apiClient.get<User[]>(context, '/users');

// POST 请求
const newUser = await apiClient.post<User>(context, '/users', {
  name: 'John Doe',
  email: 'john@example.com',
});

// 带参数的 GET 请求
const searchResults = await apiClient.get<User[]>(
  context,
  '/users/search',
  { q: 'john', limit: 10 }
);
```

### 日志记录示例

```typescript
import { logger, createLogContext } from '@/shared/logger';

// 创建模块专属的日志上下文
const logCtx = createLogContext('UserService');

// 记录不同级别的日志
logger.debug(logCtx, 'Debug information', { userId: '123' });
logger.info(logCtx, 'User logged in', { userId: '123' });
logger.warn(logCtx, 'User attempted invalid action', { action: 'delete' });
logger.error(logCtx, 'Failed to save user', error, { userId: '123' });
```

### 自定义 API 拦截器

```typescript
import { apiClient } from '@/shared/api';
import type { IRequestInterceptor, IApiContext, IApiRequestConfig } from '@/types';

// 创建自定义拦截器
class CustomHeaderInterceptor implements IRequestInterceptor {
  readonly name = 'custom-header';

  onRequest(context: IApiContext, config: IApiRequestConfig): IApiRequestConfig {
    config.headers = {
      ...config.headers,
      'X-Custom-Header': 'my-value',
    };
    return config;
  }
}

// 注册拦截器
apiClient.addRequestInterceptor(new CustomHeaderInterceptor());
```

### 错误处理示例

```typescript
import { errorManager, ErrorType } from '@/shared/error';

// 创建并处理错误
const error = errorManager.createError(
  ErrorType.VALIDATION,
  'INVALID_INPUT',
  'Email is required',
  { field: 'email' }
);

await errorManager.handleError(error);
```

### Next.js Middleware 路由保护

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token =
    request.cookies.get('access_token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  const protectedRoutes = ['/chat', '/launchpad'];
  const isProtected = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route));

  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (request.nextUrl.pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/launchpad', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

### 使用 Zustand 进行状态管理

```typescript
// src/stores/authStore.ts
import { create } from 'zustand';
import type { IAuthState, IUser } from '@/types';

interface AuthStore extends IAuthState {
  setUser: (user: IUser | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isLoading: false,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  reset: () =>
    set({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
    }),
}));
```

### React Query 集成示例

```typescript
// src/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, contextFactory } from '@/shared';
import type { IUser } from '@/types';

export function useUsers() {
  const context = contextFactory.createApiContext();

  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await apiClient.get<IUser[]>(context, '/users');
      return response.data;
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const context = contextFactory.createApiContext();

  return useMutation({
    mutationFn: async (userData: Partial<IUser>) => {
      const response = await apiClient.post<IUser>(context, '/users', userData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

## 🔧 扩展指南

### 添加新的日志传输

```typescript
import type { ILogTransport, ILogEntry, LogLevel } from '@/types';

class RemoteLogTransport implements ILogTransport {
  readonly name = 'remote';
  readonly minLevel: LogLevel = 'error';

  async log(entry: ILogEntry): Promise<void> {
    // 发送日志到远程服务器
    await fetch('/api/logs', {
      method: 'POST',
      body: JSON.stringify(entry),
    });
  }
}

// 注册到 logger
import { logger } from '@/shared/logger';
logger.addTransport(new RemoteLogTransport());
```

### 添加错误恢复策略

```typescript
import type { IErrorRecoveryStrategy, IAppError, ErrorType } from '@/types';
import { errorManager } from '@/shared/error';

class TokenRefreshStrategy implements IErrorRecoveryStrategy {
  readonly name = 'token-refresh';

  canRecover(error: IAppError): boolean {
    return error.type === ErrorType.AUTH && error.code === 'TOKEN_EXPIRED';
  }

  async recover(error: IAppError): Promise<void> {
    // 刷新 token
    const newToken = await refreshAuthToken();
    localStorage.setItem('access_token', newToken);
  }
}

errorManager.registerRecoveryStrategy(new TokenRefreshStrategy());
```

## 🧪 测试

```bash
# 运行单元测试
npm run test

# 运行 E2E 测试
npm run test:e2e

# 类型检查
npm run type-check
```

## 📝 代码规范

- 使用 ESLint 和 Prettier 保持代码风格一致
- 提交前自动运行 lint 和格式化（通过 husky 和 lint-staged）
- 遵循 Conventional Commits 规范

## 🔑 核心原则

1. **Context First**: 所有方法第一个参数都是 Context
2. **Type Safety**: 避免使用 `any`，使用严格的类型定义
3. **Single Responsibility**: 每个类/函数只做一件事
4. **Open/Closed**: 通过拦截器、策略模式扩展功能
5. **Dependency Inversion**: 依赖抽象接口，不依赖具体实现

## 📚 相关文档

- [Next.js Documentation](https://nextjs.org/docs)
- [HeroUI Documentation](https://heroui.com)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://zustand-demo.pmnd.rs)

## 📄 License

MIT
