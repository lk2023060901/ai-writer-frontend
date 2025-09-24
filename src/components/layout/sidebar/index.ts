/**
 * 侧边栏组件统一导出
 */

// 主组件
export { default as SidePanelRefactored } from './SidePanelRefactored';

// 子组件
export { default as AssistantList } from './AssistantList';
export { default as TopicList } from './TopicList';
export { default as SidebarTabs } from './SidebarTabs';
export { default as SidebarSettings } from './SidebarSettings';

// 类型定义
export type {
  SidePanelProps,
  Assistant,
  Topic,
  SidebarTab,
  SettingsValues,
  SettingsExpanded,
  AssistantListProps,
  TopicListProps,
  SidebarTabsProps,
  AssistantCardProps,
  TopicItemProps,
  SidebarSettingsProps,
  AddAssistantModalProps,
} from './types';

// 常量
export {
  allAvailableAssistants,
  defaultAssistants,
  defaultTopics,
  defaultSettingsValues,
  defaultSettingsExpanded,
  formatTimeAgo,
  formatMessageCount,
} from './constants';