/**
 * MainContent 组件相关类型定义
 * 从 MainContent.tsx 中抽离的类型定义
 */

import type { ReactNode } from 'react';

// 消息接口
export interface StreamMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

// 主容器Props
export interface MainContentProps {
  onDrawerOpen?: () => void;
}

// 标签页内容渲染器Props
export interface TabContentRendererProps {
  // 无需任何 props，从 Redux 状态中获取当前标签页信息
}

// 聊天工具栏Props
export interface ChatToolbarProps {
  sidebarCollapsed: boolean;
  currentModelName: string;
  isNarrowMode: boolean;
  onToggleSidebar: () => void;
  onDrawerOpen?: () => void;
  onOpenModelModal: () => void;
  onToggleWidth: () => void;
  onToggleExpanded: () => void;
  onClearMessages: () => void;
}

// 消息列表Props
export interface MessageListProps {
  messages: StreamMessage[];
  isStreaming: boolean;
  onCopyMessage: (content: string, messageId: string, role: string) => void;
  onRegenerateMessage: (messageId: string) => void;
}

// 聊天输入Props
export interface ChatInputProps {
  inputValue: string;
  isStreaming: boolean;
  isToolbarCollapsed: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onStopGeneration: () => void;
  onToggleToolbar: () => void;
  onAttachFile: () => void;
  onOpenWebSearch: () => void;
  onOpenTranslate: () => void;
  onOpenSummary: () => void;
}

// 欢迎区域Props
export interface WelcomeAreaProps {
  onShowDesignSystemDemo: () => void;
  onShowTabsDemo: () => void;
}

// 消息操作按钮Props
export interface MessageActionButtonProps {
  icon: ReactNode;
  text: string;
  onClick: () => void;
  disabled?: boolean;
}

// 工具栏按钮Props
export interface ToolbarButtonProps {
  icon: ReactNode;
  title: string;
  onClick: () => void;
  style?: React.CSSProperties;
}

// 聊天区域状态
export interface ChatState {
  messages: StreamMessage[];
  inputValue: string;
  isNarrowMode: boolean;
  isExpanded: boolean;
  isToolbarCollapsed: boolean;
  chainLength: number;
  contextCount: number;
  tokenCount: number;
}

// 演示状态
export interface DemoState {
  showTabsDemo: boolean;
  showDesignSystemDemo: boolean;
  modelModalVisible: boolean;
}