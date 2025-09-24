/**
 * MainContent 组件相关常量数据
 * 从 MainContent.tsx 中抽离的常量定义
 */

import type { StreamMessage, ChatState, DemoState } from './types';

// 默认消息数据
export const defaultMessages: StreamMessage[] = [
  {
    id: '1',
    role: 'user',
    content: '你好，能帮我写一个React组件吗？',
    timestamp: '2024-01-01T10:00:00Z'
  },
  {
    id: '2',
    role: 'assistant',
    content: '当然可以！下面是一个简单的React计数器组件示例：\n\n```jsx\nimport React, { useState } from \'react\';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n\n  return (\n    <div>\n      <h2>计数器: {count}</h2>\n      <button onClick={() => setCount(count + 1)}>\n        增加\n      </button>\n      <button onClick={() => setCount(count - 1)}>\n        减少\n      </button>\n      <button onClick={() => setCount(0)}>\n        重置\n      </button>\n    </div>\n  );\n}\n\nexport default Counter;\n```\n\n这个组件使用了React的useState Hook来管理状态，包含了增加、减少和重置功能。',
    timestamp: '2024-01-01T10:00:05Z'
  }
];

// 默认聊天状态
export const defaultChatState: ChatState = {
  messages: defaultMessages,
  inputValue: '',
  isNarrowMode: false,
  isExpanded: false,
  isToolbarCollapsed: false,
  chainLength: 2,
  contextCount: 0,
  tokenCount: 6241
};

// 默认演示状态
export const defaultDemoState: DemoState = {
  showTabsDemo: false,
  showDesignSystemDemo: false,
  modelModalVisible: false
};

// 工具栏按钮配置
export const toolbarButtons = {
  search: {
    title: '搜索对话内容',
    width: 36,
    height: 36
  },
  width: {
    title: '调整对话宽度',
    width: 36,
    height: 36
  },
  expand: {
    title: '全屏显示',
    width: 36,
    height: 36
  },
  clear: {
    title: '清空对话',
    width: 36,
    height: 36
  }
};

// 消息样式配置
export const messageStyles = {
  container: {
    marginBottom: '16px',
    width: '100%'
  },
  wrapper: {
    gap: '12px',
    maxWidth: '70%'
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    flexShrink: 0
  },
  bubble: {
    padding: '10px 16px',
    lineHeight: '1.5',
    wordWrap: 'break-word' as const,
    whiteSpace: 'pre-wrap' as const,
    maxWidth: '100%',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)'
  },
  actions: {
    gap: '8px',
    marginTop: '8px'
  },
  actionButton: {
    padding: '4px 10px',
    background: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    color: 'var(--text-tertiary)',
    fontSize: '12px',
    cursor: 'pointer',
    gap: '4px'
  }
};

// 输入框配置
export const inputConfig = {
  placeholder: '输入消息... (Shift+Enter 换行)',
  maxRows: 6,
  minRows: 1
};