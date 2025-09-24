/**
 * MainContent 组件统一导出
 */

// 主组件
export { default as MainContentRefactored } from './MainContentRefactored';

// 子组件
export { default as TabContentRenderer } from './TabContentRenderer';

// 类型定义
export type {
  StreamMessage,
  MainContentProps,
  TabContentRendererProps,
  ChatToolbarProps,
  MessageListProps,
  ChatInputProps,
  WelcomeAreaProps,
  MessageActionButtonProps,
  ToolbarButtonProps,
  ChatState,
  DemoState
} from './types';

// 常量和工具函数
export {
  defaultMessages,
  defaultChatState,
  defaultDemoState,
  toolbarButtons,
  messageStyles,
  inputConfig
} from './constants';