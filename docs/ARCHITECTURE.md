# AI Writer Frontend 架构设计

## 🏗️ 项目架构

```
ai-writer-frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── (routes)/
│   ├── components/             # 可复用组件
│   │   ├── ui/                # 基础UI组件
│   │   ├── layout/            # 布局组件
│   │   ├── forms/             # 表单组件
│   │   └── business/          # 业务组件
│   ├── hooks/                 # 自定义Hooks
│   ├── stores/                # 状态管理
│   ├── utils/                 # 工具函数
│   ├── types/                 # TypeScript类型定义
│   ├── styles/                # 样式文件
│   └── constants/             # 常量定义
├── public/                    # 静态资源
├── docs/                      # 项目文档
└── tests/                     # 测试文件
```

## 🎨 设计系统

### 响应式断点
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### 主题色彩
- Primary: #1677ff (Ant Design Blue)
- Success: #52c41a
- Warning: #faad14
- Error: #ff4d4f
- Gray Scale: #f5f5f5 → #000000

## 🧩 核心组件设计

### 1. Layout System
```typescript
// 参考 Cherry Studio 的 Layout 组件设计
interface LayoutProps {
  children: React.ReactNode
  sidebar?: boolean
  header?: boolean
  footer?: boolean
}
```

### 2. 用户表格页面结构
```typescript
interface UserTablePageProps {
  data: User[]
  loading: boolean
  pagination: PaginationConfig
  filters: FilterConfig
  exportOptions: ExportConfig
}
```

## 📱 自适应策略

### Desktop First 设计
1. **Large Screen (≥1024px)**: 完整功能布局
2. **Tablet (768px-1023px)**: 折叠侧边栏，保持主要功能
3. **Mobile (<768px)**: 堆叠布局，简化操作

### 关键适配点
- 表格 → 卡片列表 (移动端)
- 多列筛选 → 抽屉筛选
- 批量操作 → 长按选择
- 复杂表单 → 分步表单