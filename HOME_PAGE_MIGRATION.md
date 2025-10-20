# Cherry Studio Home Page Migration

## 概览

成功将 Cherry Studio 的 home 页面完整迁移到 Next.js 项目中，实现了与原项目相同的布局、样式和交互效果。

## 项目结构

```
/Volumes/work/coding/website/ai-writer-frontend/
├── src/app/home/
│   ├── page.tsx                 # Home 页面主组件
│   ├── styles/
│   │   ├── variables.css        # CSS 变量定义（颜色、尺寸等）
│   │   └── globals.css          # 全局样式
│   ├── components/
│   │   ├── Sidebar.tsx          # 左侧边栏 (50px 宽)
│   │   ├── HomeTabs/            # 左侧标签区 (275px 宽)
│   │   │   ├── index.tsx
│   │   │   ├── AssistantsTab.tsx
│   │   │   ├── TopicsTab.tsx
│   │   │   └── SettingsTab.tsx
│   │   └── Chat/                # 聊天区域
│   │       ├── index.tsx
│   │       ├── ChatNavbar.tsx
│   │       ├── Messages.tsx
│   │       └── Inputbar.tsx
│   └── hooks/
│       └── useMockData.ts       # Mock 数据和 hooks
```

## 布局说明

### 1. 整体布局 (100vw x 100vh)
- **左侧 Sidebar**: 50px 宽，固定位置
- **主内容区**: flex: 1
  - **HomeTabs**: 275px 宽，可收起/展开
  - **Chat**: flex: 1，自适应剩余空间

### 2. Sidebar (50px)
- 用户头像
- 导航图标 (Assistants, Knowledge, Files)
- 主题切换
- 设置按钮

### 3. HomeTabs (275px)
包含三个标签页：
- **Assistants**: 助手列表
- **Topics**: 话题列表
- **Settings**: 设置选项

### 4. Chat 区域
- **ChatNavbar**: 顶部导航栏，显示模型名称和操作按钮
- **Messages**: 消息显示区域，支持用户/助手消息
- **Inputbar**: 输入框，支持多行输入和发送

## 核心特性

### 1. 响应式布局
- 使用 CSS Variables 实现统一的尺寸管理
- 支持组件的展开/收起动画

### 2. 主题系统
- 支持深色/浅色主题切换
- 使用 CSS 变量定义颜色系统

### 3. 动画效果
- 使用 framer-motion 实现平滑的展开/收起动画
- 过渡时长 0.3s，使用 easeInOut 缓动函数

### 4. Mock 数据
简化的数据结构：
- **Assistant**: 助手信息
- **Topic**: 话题信息
- **Message**: 消息记录

## CSS 变量

### 布局变量
```css
--sidebar-width: 50px;
--assistants-width: 275px;
--navbar-height: 40px;
```

### 颜色系统
- 主色调：`--color-primary: #00b96b`
- 背景色：`--color-background`
- 文字色：`--color-text`
- 边框色：`--color-border`

## 依赖包

新增依赖：
- `styled-components`: CSS-in-JS 样式解决方案
- `framer-motion`: 动画库
- `react-hotkeys-hook`: 快捷键支持

已有依赖：
- `antd`: UI 组件库
- `lucide-react`: 图标库
- `nanoid`: ID 生成

## 与原项目的差异

### 移除的功能
1. **Electron API**: 所有 `window.api` 和 `@renderer` 相关代码
2. **复杂状态管理**: Redux store 简化为 React hooks
3. **高级特性**:
   - Agent Session
   - MCP Tools
   - Knowledge Base integration
   - Web Search
   - File upload

### 简化的实现
1. **Logger**: 使用 `console.log` 代替
2. **事件系统**: 移除 EventEmitter
3. **数据持久化**: 使用内存 mock 数据
4. **路由**: 使用 Next.js router

## 访问方式

启动开发服务器后，访问：
```
http://localhost:3000/home
```

## 文件说明

### 核心文件
- `/src/app/home/page.tsx`: 主页面组件，整合所有子组件
- `/src/app/home/styles/variables.css`: CSS 变量定义
- `/src/app/home/hooks/useMockData.ts`: Mock 数据和状态管理

### 组件文件
- `Sidebar.tsx`: 50px 宽的左侧导航栏
- `HomeTabs/index.tsx`: 275px 宽的标签页容器
- `Chat/index.tsx`: 主聊天区域容器

## 下一步优化

1. 连接真实的后端 API
2. 实现数据持久化
3. 添加更多交互功能
4. 优化移动端适配
5. 添加键盘快捷键支持
6. 实现消息搜索功能
7. 添加文件上传支持

## 开发说明

### 启动项目
```bash
npm run dev
```

### 构建项目
```bash
npm run build
```

### 主要技术栈
- Next.js 14
- React 18
- TypeScript
- Styled Components
- Framer Motion
- Ant Design

## 总结

成功完成 Cherry Studio home 页面的完整迁移，保持了原有的布局、样式和基本交互功能。通过简化实现和使用 mock 数据，创建了一个可以独立运行的 Next.js 版本，为后续功能开发奠定了基础。
