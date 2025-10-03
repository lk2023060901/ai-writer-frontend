# AI Writer Frontend 项目结构详解

## 📁 完整目录结构

```
ai-writer-frontend/
├── 📄 package.json                          # 项目依赖和脚本配置
├── 📄 next.config.js                        # Next.js 配置文件
├── 📄 tailwind.config.js                    # TailwindCSS 配置
├── 📄 tsconfig.json                         # TypeScript 配置
├── 📄 .eslintrc.json                        # ESLint 代码检查配置
├── 📄 .prettierrc                           # Prettier 代码格式化配置
├── 📄 .env.local                            # 环境变量配置
├── 📄 README.md                             # 项目说明文档
├── 📄 DEVELOPMENT_FLOW.md                   # 开发流程文档
├── 📄 ARCHITECTURE.md                       # 架构设计文档
├── 📄 PROJECT_STRUCTURE.md                  # 项目结构说明（本文件）
│
├── 📁 public/                               # 静态资源目录
│   ├── 🖼️ favicon.ico                        # 网站图标
│   ├── 🖼️ logo.svg                          # 项目Logo
│   └── 📁 images/                           # 图片资源
│       ├── 🖼️ avatar-placeholder.png         # 用户头像占位图
│       └── 🖼️ empty-state.svg               # 空状态插图
│
├── 📁 src/                                  # 源代码目录
│   ├── 📁 app/                             # Next.js App Router 目录
│   │   ├── 📄 layout.tsx                    # 根布局组件
│   │   ├── 📄 page.tsx                      # 首页组件
│   │   ├── 📄 globals.css                   # 全局样式
│   │   ├── 📄 loading.tsx                   # 全局加载组件
│   │   ├── 📄 error.tsx                     # 全局错误组件
│   │   ├── 📄 not-found.tsx                 # 404页面组件
│   │   │
│   │   ├── 📁 users/                        # 用户管理路由
│   │   │   ├── 📄 page.tsx                  # 用户列表页
│   │   │   ├── 📄 loading.tsx               # 用户页面加载状态
│   │   │   └── 📁 [id]/                     # 动态用户详情路由
│   │   │       ├── 📄 page.tsx              # 用户详情页
│   │   │       └── 📄 edit/                 # 用户编辑页
│   │   │           └── 📄 page.tsx
│   │   │
│   │   ├── 📁 dashboard/                    # 仪表盘路由
│   │   │   └── 📄 page.tsx                  # 仪表盘页面
│   │   │
│   │   └── 📁 api/                          # API 路由
│   │       ├── 📁 users/                    # 用户相关API
│   │       │   ├── 📄 route.ts              # 用户列表API
│   │       │   ├── 📁 [id]/                 # 用户详情API
│   │       │   │   └── 📄 route.ts
│   │       │   └── 📁 export/               # 用户导出API
│   │       │       └── 📄 route.ts
│   │       └── 📁 health/                   # 健康检查API
│   │           └── 📄 route.ts
│   │
│   ├── 📁 components/                       # 可复用组件目录
│   │   ├── 📁 ui/                          # 基础UI组件
│   │   │   ├── 📄 Button.tsx                # 按钮组件
│   │   │   ├── 📄 Input.tsx                 # 输入框组件
│   │   │   ├── 📄 Modal.tsx                 # 模态框组件
│   │   │   ├── 📄 Table.tsx                 # 表格组件
│   │   │   ├── 📄 Pagination.tsx            # 分页组件
│   │   │   ├── 📄 Loading.tsx               # 加载组件
│   │   │   ├── 📄 Empty.tsx                 # 空状态组件
│   │   │   ├── 📄 ErrorBoundary.tsx         # 错误边界组件
│   │   │   └── 📄 index.ts                  # 组件导出文件
│   │   │
│   │   ├── 📁 layout/                       # 布局组件
│   │   │   ├── 📄 AppLayout.tsx             # 主应用布局
│   │   │   ├── 📄 Header.tsx                # 顶部导航栏
│   │   │   ├── 📄 Sidebar.tsx               # 侧边栏
│   │   │   ├── 📄 Footer.tsx                # 底部栏
│   │   │   ├── 📄 MobileNav.tsx             # 移动端导航
│   │   │   └── 📄 Breadcrumb.tsx            # 面包屑导航
│   │   │
│   │   ├── 📁 forms/                        # 表单组件
│   │   │   ├── 📄 UserForm.tsx              # 用户表单
│   │   │   ├── 📄 SearchForm.tsx            # 搜索表单
│   │   │   ├── 📄 FilterForm.tsx            # 筛选表单
│   │   │   └── 📄 ExportForm.tsx            # 导出表单
│   │   │
│   │   ├── 📁 business/                     # 业务组件
│   │   │   ├── 📄 UserTable.tsx             # 用户表格
│   │   │   ├── 📄 UserCard.tsx              # 用户卡片（移动端）
│   │   │   ├── 📄 UserSearch.tsx            # 用户搜索
│   │   │   ├── 📄 UserFilters.tsx           # 用户筛选器
│   │   │   ├── 📄 BatchOperations.tsx       # 批量操作
│   │   │   ├── 📄 ExportTools.tsx           # 导出工具
│   │   │   └── 📄 ColumnSettings.tsx        # 列设置
│   │   │
│   │   └── 📁 providers/                    # 提供者组件
│   │       ├── 📄 ThemeProvider.tsx         # 主题提供者
│   │       ├── 📄 AuthProvider.tsx          # 认证提供者
│   │       └── 📄 QueryProvider.tsx         # 查询提供者
│   │
│   ├── 📁 hooks/                           # 自定义Hooks
│   │   ├── 📄 useUsers.ts                   # 用户数据Hook
│   │   ├── 📄 useTable.ts                   # 表格状态Hook
│   │   ├── 📄 usePagination.ts              # 分页Hook
│   │   ├── 📄 useSearch.ts                  # 搜索Hook
│   │   ├── 📄 useFilters.ts                 # 筛选Hook
│   │   ├── 📄 useExport.ts                  # 导出Hook
│   │   ├── 📄 useResponsive.ts              # 响应式Hook
│   │   ├── 📄 useLocalStorage.ts            # 本地存储Hook
│   │   └── 📄 useDebounce.ts                # 防抖Hook
│   │
│   ├── 📁 stores/                          # 状态管理
│   │   ├── 📄 userStore.ts                  # 用户状态存储
│   │   ├── 📄 uiStore.ts                    # UI状态存储
│   │   ├── 📄 authStore.ts                  # 认证状态存储
│   │   └── 📄 index.ts                      # 状态存储入口
│   │
│   ├── 📁 services/                        # 服务层
│   │   ├── 📄 api.ts                        # API基础配置
│   │   ├── 📄 userService.ts                # 用户服务
│   │   ├── 📄 authService.ts                # 认证服务
│   │   ├── 📄 exportService.ts              # 导出服务
│   │   └── 📄 uploadService.ts              # 上传服务
│   │
│   ├── 📁 utils/                           # 工具函数
│   │   ├── 📄 format.ts                     # 格式化工具
│   │   ├── 📄 validation.ts                 # 验证工具
│   │   ├── 📄 export.ts                     # 导出工具
│   │   ├── 📄 date.ts                       # 日期工具
│   │   ├── 📄 constants.ts                  # 常量定义
│   │   ├── 📄 helpers.ts                    # 辅助函数
│   │   └── 📄 cn.ts                         # className合并工具
│   │
│   ├── 📁 types/                           # TypeScript类型定义
│   │   ├── 📄 user.ts                       # 用户类型
│   │   ├── 📄 api.ts                        # API类型
│   │   ├── 📄 table.ts                      # 表格类型
│   │   ├── 📄 common.ts                     # 通用类型
│   │   └── 📄 index.ts                      # 类型导出
│   │
│   ├── 📁 styles/                          # 样式文件
│   │   ├── 📄 globals.css                   # 全局样式
│   │   ├── 📄 components.css                # 组件样式
│   │   ├── 📄 utilities.css                 # 工具样式
│   │   └── 📄 themes.css                    # 主题样式
│   │
│   └── 📁 constants/                       # 常量定义
│       ├── 📄 routes.ts                     # 路由常量
│       ├── 📄 api.ts                        # API常量
│       ├── 📄 ui.ts                         # UI常量
│       └── 📄 config.ts                     # 配置常量
│
├── 📁 tests/                               # 测试文件
│   ├── 📁 __mocks__/                       # Mock文件
│   │   └── 📄 api.ts                        # API Mock
│   ├── 📁 components/                       # 组件测试
│   │   ├── 📄 UserTable.test.tsx            # 用户表格测试
│   │   └── 📄 AppLayout.test.tsx            # 布局测试
│   ├── 📁 hooks/                           # Hook测试
│   │   └── 📄 useUsers.test.ts              # 用户Hook测试
│   ├── 📁 utils/                           # 工具函数测试
│   │   └── 📄 format.test.ts                # 格式化测试
│   └── 📄 setup.ts                          # 测试设置
│
├── 📁 docs/                                # 项目文档
│   ├── 📄 API.md                            # API文档
│   ├── 📄 COMPONENTS.md                     # 组件文档
│   ├── 📄 DEPLOYMENT.md                     # 部署文档
│   └── 📄 CONTRIBUTING.md                   # 贡献指南
│
└── 📁 .next/                               # Next.js构建输出（自动生成）
    └── ...
```

## 🔍 关键文件作用详解

### 📁 配置文件层
- **package.json**: 项目依赖、脚本、元信息
- **next.config.js**: Next.js框架配置、构建优化
- **tailwind.config.js**: TailwindCSS样式配置
- **tsconfig.json**: TypeScript编译配置

### 📁 应用层 (src/app/)
- **layout.tsx**: 根布局，包含Provider、全局样式
- **page.tsx**: 首页，Dashboard重定向
- **globals.css**: 全局CSS重置、Ant Design样式覆盖

### 📁 组件层 (src/components/)
- **ui/**: 无状态基础组件，纯UI展示
- **layout/**: 应用框架组件，处理导航、布局
- **forms/**: 表单组件，处理用户输入验证
- **business/**: 业务组件，包含具体业务逻辑

### 📁 逻辑层
- **hooks/**: 自定义Hook，状态逻辑复用
- **stores/**: Zustand状态管理，全局状态
- **services/**: API服务，数据获取抽象层
- **utils/**: 纯函数工具，无副作用辅助函数

### 📁 类型层 (src/types/)
- **user.ts**: 用户相关类型定义
- **api.ts**: API请求响应类型
- **table.ts**: 表格组件类型
- **common.ts**: 通用类型定义