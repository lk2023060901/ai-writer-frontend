# AgentsPage 组件设计文档

## 概述

本设计文档详细描述了 AgentsPage（智能体页面）的完整架构设计。该页面提供了一个功能丰富的智能体管理界面，包括搜索、分组、详细信息展示和操作功能。设计遵循现代 UI/UX 原则，确保良好的用户体验和代码可维护性。

## 架构设计

### 当前状态分析

现有的 AgentsPage 实现：
- 基本的页面结构和数据模型
- 缺少具体的子组件实现
- 需要完整的组件架构

### 目标架构

```
AgentsPage.tsx
├── Navbar (导航栏)
├── ContentContainer (内容容器)
    ├── AgentsSidebar (智能体侧边栏)
    │   ├── SearchInput (搜索输入)
    │   ├── GroupTabs (分组标签)
    │   └── AgentList (智能体列表)
    └── AgentContent (智能体内容)
        ├── AgentHeader (智能体头部)
        ├── AgentDescription (智能体描述)
        └── AgentActions (智能体操作)
```

## 组件和接口

### 1. AgentsPage (主页面)

**位置:** `src/pages/AgentsPage.tsx`

**职责:** 页面状态管理和整体布局

**状态管理:**
```typescript
interface AgentsPageState {
  selectedAgent: Agent | null;
  searchTerm: string;
  selectedGroup: string;
  agents: Agent[];
  loading: boolean;
  error: string | null;
}
```

### 2. Navbar (导航栏)

**位置:** `src/components/agents/Navbar.tsx`

**职责:** 页面导航和全局操作

**Props 接口:**
```typescript
interface NavbarProps {
  onCreateAgent?: () => void;
  onImportAgent?: () => void;
  onSettings?: () => void;
}
```

**功能特性:**
- 页面标题显示
- 创建新智能体按钮
- 导入智能体功能
- 设置入口
- 响应式布局

### 3. ContentContainer (内容容器)

**位置:** `src/components/agents/ContentContainer.tsx`

**职责:** 管理侧边栏和内容区域的布局

**Props 接口:**
```typescript
interface ContentContainerProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  onAgentSelect: (agent: Agent) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedGroup: string;
  onGroupChange: (group: string) => void;
}
```

### 4. AgentsSidebar (智能体侧边栏)

**位置:** `src/components/agents/AgentsSidebar.tsx`

**职责:** 智能体搜索、分组和列表展示

**Props 接口:**
```typescript
interface AgentsSidebarProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  onAgentSelect: (agent: Agent) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedGroup: string;
  onGroupChange: (group: string) => void;
}
```

### 5. SearchInput (搜索输入)

**位置:** `src/components/agents/SearchInput.tsx`

**职责:** 智能体搜索功能

**Props 接口:**
```typescript
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}
```

### 6. GroupTabs (分组标签)

**位置:** `src/components/agents/GroupTabs.tsx`

**职责:** 智能体分组筛选

**Props 接口:**
```typescript
interface GroupTabsProps {
  groups: string[];
  selectedGroup: string;
  onGroupChange: (group: string) => void;
  agentCounts: Record<string, number>;
}
```

### 7. AgentList (智能体列表)

**位置:** `src/components/agents/AgentList.tsx`

**职责:** 智能体列表展示和选择

**Props 接口:**
```typescript
interface AgentListProps {
  agents: Agent[];
  selectedAgent: Agent | null;
  onAgentSelect: (agent: Agent) => void;
  loading?: boolean;
  emptyMessage?: string;
}
```

### 8. AgentContent (智能体内容)

**位置:** `src/components/agents/AgentContent.tsx`

**职责:** 智能体详细信息展示

**Props 接口:**
```typescript
interface AgentContentProps {
  agent: Agent | null;
  onStartChat: (agent: Agent) => void;
  onFavorite: (agent: Agent) => void;
  onShare: (agent: Agent) => void;
}
```

### 9. AgentHeader (智能体头部)

**位置:** `src/components/agents/AgentHeader.tsx`

**职责:** 智能体基本信息展示

**Props 接口:**
```typescript
interface AgentHeaderProps {
  agent: Agent;
  onFavorite: (agent: Agent) => void;
  isFavorited?: boolean;
}
```

### 10. AgentDescription (智能体描述)

**位置:** `src/components/agents/AgentDescription.tsx`

**职责:** 智能体详细描述展示

**Props 接口:**
```typescript
interface AgentDescriptionProps {
  description: string;
  capabilities: string[];
  maxLength?: number;
  expandable?: boolean;
}
```

### 11. AgentActions (智能体操作)

**位置:** `src/components/agents/AgentActions.tsx`

**职责:** 智能体操作按钮

**Props 接口:**
```typescript
interface AgentActionsProps {
  agent: Agent;
  onStartChat: (agent: Agent) => void;
  onFavorite: (agent: Agent) => void;
  onShare: (agent: Agent) => void;
  disabled?: boolean;
}
```

## 数据模型

### Agent 接口
```typescript
interface Agent {
  id: string;
  name: string;
  description: string;
  avatar: string;
  category: string;
  tags: string[];
  status: 'active' | 'inactive' | 'busy';
  capabilities: string[];
  model: string;
  provider: string;
  createdAt: string;
  lastUsed?: string;
  usageCount: number;
  isFavorited?: boolean;
}
```

### 分组数据
```typescript
interface GroupData {
  id: string;
  name: string;
  count: number;
  color?: string;
}
```

## 设计模式

### 1. 状态提升模式
- 主要状态在 AgentsPage 中管理
- 通过 props 向下传递状态和回调函数
- 确保数据流的单向性

### 2. 组件组合模式
- 每个组件职责单一明确
- 通过组合构建复杂界面
- 便于测试和维护

### 3. 响应式设计模式
- 移动优先的设计理念
- 使用 Tailwind 的响应式工具类
- 断点：sm (640px), md (768px), lg (1024px), xl (1280px)

## 样式系统

### 布局样式
```css
/* 主页面布局 */
.agents-page {
  @apply h-full flex flex-col bg-background-light dark:bg-background-dark;
}

/* 内容容器布局 */
.content-container {
  @apply flex-1 flex overflow-hidden;
}

/* 侧边栏样式 */
.agents-sidebar {
  @apply w-80 border-r border-background-dark/10 dark:border-background-light/10;
  @apply bg-card-light dark:bg-card-dark;
}

/* 内容区域样式 */
.agent-content {
  @apply flex-1 overflow-auto p-6;
}
```

### 组件样式
```css
/* 搜索输入样式 */
.search-input {
  @apply w-full px-4 py-2 rounded-lg border;
  @apply border-background-dark/20 dark:border-background-light/20;
  @apply bg-background-light dark:bg-background-dark;
  @apply focus:outline-none focus:ring-2 focus:ring-primary/50;
}

/* 分组标签样式 */
.group-tab {
  @apply px-3 py-2 rounded-lg text-sm font-medium transition-colors;
  @apply text-background-dark/70 dark:text-background-light/70;
  @apply hover:bg-background-dark/5 dark:hover:bg-background-light/5;
}

.group-tab.active {
  @apply bg-primary text-white;
}

/* 智能体卡片样式 */
.agent-card {
  @apply p-4 rounded-lg border transition-all duration-200;
  @apply border-background-dark/10 dark:border-background-light/10;
  @apply hover:border-primary/30 hover:shadow-sm;
  @apply cursor-pointer;
}

.agent-card.selected {
  @apply border-primary bg-primary/5;
}
```

## 交互设计

### 1. 搜索交互
- 实时搜索，输入时立即过滤
- 搜索结果高亮匹配文本
- 空状态提示和清空功能

### 2. 分组交互
- 点击分组标签切换筛选
- 显示每个分组的智能体数量
- 活跃状态的视觉反馈

### 3. 列表交互
- 点击智能体卡片选中
- 选中状态的视觉反馈
- 悬停效果和过渡动画

### 4. 内容交互
- 描述文本的展开/收起
- 操作按钮的悬停和点击效果
- 加载和错误状态的处理

## 响应式设计

### 断点设计
- **移动端 (< 768px)**: 单列布局，侧边栏可折叠
- **平板端 (768px - 1024px)**: 侧边栏固定，内容区域自适应
- **桌面端 (> 1024px)**: 完整布局，充分利用屏幕空间

### 布局适配
```css
/* 移动端布局 */
@media (max-width: 767px) {
  .content-container {
    @apply flex-col;
  }
  
  .agents-sidebar {
    @apply w-full h-auto border-r-0 border-b;
  }
}

/* 平板端布局 */
@media (min-width: 768px) and (max-width: 1023px) {
  .agents-sidebar {
    @apply w-64;
  }
}
```

## 性能优化

### 1. 虚拟滚动
- 大量智能体列表的性能优化
- 只渲染可见区域的项目
- 平滑滚动体验

### 2. 搜索防抖
- 搜索输入的防抖处理
- 减少不必要的过滤操作
- 提升用户体验

### 3. 组件懒加载
- 非关键组件的懒加载
- 减少初始包大小
- 提升页面加载速度

### 4. 状态缓存
- 搜索结果的缓存
- 减少重复计算
- 提升响应速度

## 错误处理

### 1. 数据加载错误
- 网络错误的友好提示
- 重试机制
- 降级方案

### 2. 搜索错误
- 搜索失败的提示
- 搜索结果为空的处理
- 搜索建议功能

### 3. 操作错误
- 操作失败的反馈
- 错误信息的展示
- 操作重试机制

## 无障碍设计

### 1. 键盘导航
- 完整的键盘导航支持
- 焦点管理和指示器
- 快捷键支持

### 2. 屏幕阅读器
- 适当的 ARIA 标签
- 语义化的 HTML 结构
- 状态变化的通知

### 3. 视觉辅助
- 高对比度支持
- 字体大小适配
- 颜色无关的信息传达

## 测试策略

### 1. 单元测试
- 组件渲染测试
- 交互功能测试
- 状态管理测试

### 2. 集成测试
- 组件间交互测试
- 数据流测试
- 用户场景测试

### 3. 端到端测试
- 完整用户流程测试
- 跨浏览器兼容性测试
- 性能测试

## 实现优先级

### 第一阶段：核心功能
1. 基础页面结构
2. 智能体列表展示
3. 基本搜索功能
4. 智能体详情展示

### 第二阶段：增强功能
1. 分组筛选功能
2. 高级搜索
3. 操作按钮功能
4. 响应式优化

### 第三阶段：优化功能
1. 性能优化
2. 无障碍改进
3. 动画效果
4. 错误处理完善