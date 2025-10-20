# Mock API 使用指南

为了在没有后端服务的情况下验证前端功能，项目内置了一个可开关的 Mock API 方案。该方案默认在开发环境启用，能够模拟常用接口并返回与后端约定一致的数据结构，不会对生产环境性能造成影响。

## 开关配置

通过环境变量 `NEXT_PUBLIC_API_USE_MOCK` 控制是否启用 Mock：

```bash
# 启用 Mock（默认开发环境即为此设置）
NEXT_PUBLIC_API_USE_MOCK=true

# 关闭 Mock，使用真实后端接口
NEXT_PUBLIC_API_USE_MOCK=false
```

可选的额外配置：

```bash
# 自定义后端地址（关闭 Mock 时使用）
NEXT_PUBLIC_API_BASE_URL=https://api.example.com

# 调整 Mock 响应延迟，单位毫秒（默认 150ms，用于模拟真实网络耗时）
NEXT_PUBLIC_API_MOCK_LATENCY=0
```

## 工作原理

- `src/config/appConfig.ts` 统一读取环境变量，决定当前是否启用 Mock。
- `src/shared/api/index.ts` 根据配置返回真实 `ApiClient` 或 `MockApiClient` 实例。
- `MockApiClient`（见 `src/shared/api/MockApiClient.ts`）实现了 `IApiClient` 接口，内置知识库、智能体、文件等核心 API 的模拟逻辑，并保留拦截器能力用于调试。
- 当 `NEXT_PUBLIC_API_USE_MOCK=false` 时，自动切换回基于 Axios 的真实接口调用，不引入额外的运行时代码。

## 扩展 Mock 数据

可在 `src/features/launchpad/data/` 中添加或修改初始数据，也可以直接扩展 `MockApiClient` 内的路由分发逻辑，快速覆盖新的 API。

示例：

```ts
// 为 /projects 接口追加 Mock 返回
case 'projects':
  if (config.method === 'GET') {
    return this.wrapSuccess(projectList);
  }
  break;
```

## 已内置的 Mock 端点

- `/api/v1/auth/login`：任意邮箱/用户名 + 密码校验（默认账号 `demo@example.com / demo123`）。
- `/api/v1/auth/register`：注册后存入内存，后续可使用新用户登录。
- `/api/v1/auth/me`：根据 `Authorization` 头或 `access_token` Cookie 返回当前用户。
- Launchpad 相关接口：知识库、智能体模版、文件列表的 CRUD。

## 与真实后端联调

1. 设置 `NEXT_PUBLIC_API_USE_MOCK=false`，并配置 `NEXT_PUBLIC_API_BASE_URL` 指向真实后端。
2. 重新启动开发服务，即可在不修改前端代码的情况下切换到真实接口。

通过上述方式，可在开发阶段随时切换 Mock 与真实 API，保证功能验证和联调效率。EOF
