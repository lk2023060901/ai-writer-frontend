# TranslatePage 组件设计文档

## 概述

本设计文档详细描述了 TranslatePage（翻译页面）的完整架构设计。该页面提供了一个功能丰富的多语言翻译界面，包括文本翻译、语言选择、历史记录、设置配置等功能。设计遵循现代 UI/UX 原则，确保良好的用户体验和代码可维护性。

## 架构设计

### 当前状态分析

现有的 TranslatePage 实现：
- 基本的翻译界面和语言选择
- 简单的文本输入输出区域
- 需要重构为模块化组件架构

### 目标架构

```
TranslatePage.tsx
├── Navbar (导航栏)
├── ContentContainer (内容容器)
│   ├── TranslateInput (翻译输入区)
│   ├── TranslateOutput (翻译输出区)
│   ├── TranslateActions (翻译操作)
│   └── TranslateHistory (翻译历史)
└── TranslateSettings (翻译设置)
```

## 组件和接口

### 1. TranslatePage (主页面)

**位置:** `src/pages/TranslatePage.tsx`

**职责:** 页面状态管理和整体布局

**状态管理:**
```typescript
interface TranslatePageState {
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  isTranslating: boolean;
  autoTranslate: boolean;
  translationHistory: TranslationRecord[];
  settings: TranslateSettings;
}
```

### 2. Navbar (导航栏)

**位置:** `src/components/translate/Navbar.tsx`

**职责:** 页面导航和全局操作

**Props 接口:**
```typescript
interface NavbarProps {
  onClearAll?: () => void;
  onExportHistory?: () => void;
  onImportFile?: () => void;
  onSettings?: () => void;
}
```

**功能特性:**
- 页面标题和图标
- 清空所有内容按钮
- 导出历史记录功能
- 导入文件翻译功能
- 设置入口

### 3. ContentContainer (内容容器)

**位置:** `src/components/translate/ContentContainer.tsx`

**职责:** 管理翻译区域的布局

**Props 接口:**
```typescript
interface ContentContainerProps {
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  isTranslating: boolean;
  autoTranslate: boolean;
  onSourceTextChange: (text: string) => void;
  onTranslatedTextChange: (text: string) => void;
  onSourceLangChange: (lang: string) => void;
  onTargetLangChange: (lang: string) => void;
  onTranslate: () => void;
  onSwapLanguages: () => void;
  onClear: () => void;
  translationHistory: TranslationRecord[];
  onHistorySelect: (record: TranslationRecord) => void;
}
```

### 4. TranslateInput (翻译输入区)

**位置:** `src/components/translate/TranslateInput.tsx`

**职责:** 源文本输入和语言选择

**Props 接口:**
```typescript
interface TranslateInputProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
}
```

**功能特性:**
- 多行文本输入
- 字符计数显示
- 语言选择下拉框
- 文本清空功能
- 粘贴优化处理

### 5. TranslateOutput (翻译输出区)

**位置:** `src/components/translate/TranslateOutput.tsx`

**职责:** 翻译结果展示和操作

**Props 接口:**
```typescript
interface TranslateOutputProps {
  value: string;
  onChange?: (value: string) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  isLoading?: boolean;
  error?: string;
  editable?: boolean;
}
```

**功能特性:**
- 翻译结果显示
- 结果复制功能
- 语音播放功能
- 结果编辑功能
- 加载和错误状态

### 6. TranslateActions (翻译操作)

**位置:** `src/components/translate/TranslateActions.tsx`

**职责:** 翻译操作按钮和控制

**Props 接口:**
```typescript
interface TranslateActionsProps {
  onTranslate: () => void;
  onSwapLanguages: () => void;
  onClear: () => void;
  onCopy: () => void;
  onSpeak: () => void;
  isTranslating: boolean;
  canSwap: boolean;
  hasContent: boolean;
  hasResult: boolean;
}
```

**功能特性:**
- 翻译按钮
- 语言交换按钮
- 清空内容按钮
- 复制结果按钮
- 语音播放按钮

### 7. TranslateHistory (翻译历史)

**位置:** `src/components/translate/TranslateHistory.tsx`

**职责:** 翻译历史记录管理

**Props 接口:**
```typescript
interface TranslateHistoryProps {
  history: TranslationRecord[];
  onSelect: (record: TranslationRecord) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  onSearch: (query: string) => void;
  maxItems?: number;
}
```

**功能特性:**
- 历史记录列表
- 记录搜索功能
- 记录删除功能
- 批量清空功能
- 分页或虚拟滚动

### 8. TranslateSettings (翻译设置)

**位置:** `src/components/translate/TranslateSettings.tsx`

**职责:** 翻译设置和配置

**Props 接口:**
```typescript
interface TranslateSettingsProps {
  settings: TranslateSettings;
  onSettingsChange: (settings: TranslateSettings) => void;
  visible: boolean;
  onClose: () => void;
}
```

**功能特性:**
- 翻译引擎选择
- 自动翻译开关
- 翻译质量设置
- 语言偏好配置
- 快捷键设置

### 9. LanguageSelector (语言选择器)

**位置:** `src/components/translate/LanguageSelector.tsx`

**职责:** 语言选择组件

**Props 接口:**
```typescript
interface LanguageSelectorProps {
  value: string;
  onChange: (lang: string) => void;
  languages: Language[];
  showAutoDetect?: boolean;
  placeholder?: string;
  disabled?: boolean;
}
```

## 数据模型

### TranslationRecord 接口
```typescript
interface TranslationRecord {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  timestamp: string;
  engine: string;
  confidence?: number;
}
```

### Language 接口
```typescript
interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
  popular?: boolean;
}
```

### TranslateSettings 接口
```typescript
interface TranslateSettings {
  defaultSourceLang: string;
  defaultTargetLang: string;
  autoTranslate: boolean;
  translationEngine: string;
  maxHistoryItems: number;
  enableSpeech: boolean;
  autoDetectLanguage: boolean;
  showConfidence: boolean;
}
```

## 设计模式

### 1. 状态提升模式
- 主要状态在 TranslatePage 中管理
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
.translate-page {
  @apply h-full flex flex-col bg-background-light dark:bg-background-dark;
}

/* 内容容器布局 */
.content-container {
  @apply flex-1 overflow-hidden p-6;
}

/* 翻译区域布局 */
.translate-area {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-6;
}

/* 历史记录侧边栏 */
.history-sidebar {
  @apply w-80 border-l border-background-dark/10 dark:border-background-light/10;
}
```

### 组件样式
```css
/* 输入输出区域样式 */
.translate-panel {
  @apply bg-card-light dark:bg-card-dark rounded-lg border;
  @apply border-background-dark/10 dark:border-background-light/10;
  @apply p-6 space-y-4;
}

/* 文本区域样式 */
.translate-textarea {
  @apply w-full min-h-32 p-4 rounded-lg border;
  @apply border-background-dark/20 dark:border-background-light/20;
  @apply bg-background-light dark:bg-background-dark;
  @apply focus:outline-none focus:ring-2 focus:ring-primary/50;
  @apply resize-none;
}

/* 操作按钮样式 */
.translate-button {
  @apply px-6 py-2 rounded-lg font-medium transition-all duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-primary/50;
}

.translate-button.primary {
  @apply bg-primary text-white hover:bg-primary/90;
}

.translate-button.secondary {
  @apply bg-background-dark/5 dark:bg-background-light/5;
  @apply text-background-dark dark:text-background-light;
  @apply hover:bg-background-dark/10 dark:hover:bg-background-light/10;
}
```

## 交互设计

### 1. 翻译流程
- 用户输入文本
- 选择源语言和目标语言
- 点击翻译或自动翻译
- 显示翻译结果
- 保存到历史记录

### 2. 语言交换
- 点击交换按钮
- 交换源语言和目标语言
- 交换输入和输出文本
- 重新执行翻译

### 3. 历史记录交互
- 点击历史记录项
- 加载到翻译界面
- 支持删除和搜索
- 支持批量操作

### 4. 实时翻译
- 输入时自动触发翻译
- 防抖优化性能
- 可开关控制
- 显示翻译状态

## 响应式设计

### 断点设计
- **移动端 (< 768px)**: 单列布局，历史记录可折叠
- **平板端 (768px - 1024px)**: 两列布局，历史记录侧边栏
- **桌面端 (> 1024px)**: 完整布局，充分利用屏幕空间

### 布局适配
```css
/* 移动端布局 */
@media (max-width: 767px) {
  .translate-area {
    @apply grid-cols-1 gap-4;
  }
  
  .history-sidebar {
    @apply w-full border-l-0 border-t;
  }
}

/* 平板端布局 */
@media (min-width: 768px) and (max-width: 1023px) {
  .translate-area {
    @apply grid-cols-1 gap-6;
  }
}
```

## 性能优化

### 1. 防抖翻译
- 输入防抖处理
- 减少API调用
- 提升用户体验

### 2. 虚拟滚动
- 历史记录虚拟滚动
- 处理大量数据
- 保持流畅性能

### 3. 缓存机制
- 翻译结果缓存
- 减少重复请求
- 提升响应速度

### 4. 懒加载
- 组件懒加载
- 减少初始包大小
- 提升加载速度

## 错误处理

### 1. 翻译错误
- 网络错误处理
- API错误提示
- 重试机制

### 2. 输入验证
- 文本长度限制
- 特殊字符处理
- 格式验证

### 3. 语言检测错误
- 检测失败处理
- 手动选择备选
- 错误提示

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

## 国际化支持

### 1. 多语言界面
- 界面文本国际化
- 语言切换功能
- RTL语言支持

### 2. 本地化
- 日期时间格式
- 数字格式
- 文化适配

## 测试策略

### 1. 单元测试
- 组件渲染测试
- 翻译功能测试
- 状态管理测试

### 2. 集成测试
- 组件间交互测试
- API集成测试
- 用户场景测试

### 3. 端到端测试
- 完整翻译流程测试
- 跨浏览器兼容性测试
- 性能测试

## 实现优先级

### 第一阶段：核心功能
1. 基础页面结构
2. 文本翻译功能
3. 语言选择功能
4. 基本操作按钮

### 第二阶段：增强功能
1. 翻译历史记录
2. 自动翻译功能
3. 语音播放功能
4. 设置配置

### 第三阶段：优化功能
1. 性能优化
2. 无障碍改进
3. 文件翻译功能
4. 高级设置