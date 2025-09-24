/**
 * 侧边栏组件类型定义
 * 从SidePanel.tsx中抽离的类型定义
 */

// 助手数据接口
export interface Assistant {
  id: string;
  name: string;
  description: string;
  messageCount: number;
}

// 话题数据接口
export interface Topic {
  id: string;
  title: string;
  lastMessage: string;
  messageCount: number;
  lastActiveTime: string;
  createdAt: string;
}

// 侧边栏标签类型
export type SidebarTab = 'assistants' | 'topics' | 'settings';

// 设置值接口
export interface SettingsValues {
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  maxTokens: number;
  stream: boolean;
  enableCitation: boolean;
  enableWebSearch: boolean;
  enablePlugins: boolean;
}

// 设置展开状态
export interface SettingsExpanded {
  modelConfig: boolean;
  advanced: boolean;
  features: boolean;
  experimental: boolean;
  performance: boolean;
}

// 组件Props接口
export interface SidePanelProps {
  inDrawer?: boolean;
}

export interface AssistantListProps {
  assistants: Assistant[];
  selectedAssistantId: string;
  onSelectAssistant: (id: string) => void;
  onAddAssistant: () => void;
}

export interface TopicListProps {
  topics: Topic[];
  selectedTopicId: string;
  onSelectTopic: (id: string) => void;
  onCreateTopic: () => void;
  onEditTopic: (id: string, title: string) => void;
  onDeleteTopic: (id: string) => void;
  editingTopicId: string | null;
  editingTitle: string;
  onStartEdit: (id: string, title: string) => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
}

export interface SidebarTabsProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  inDrawer?: boolean;
}

export interface AssistantCardProps {
  assistant: Assistant;
  isSelected: boolean;
  onClick: () => void;
}

export interface TopicItemProps {
  topic: Topic;
  isSelected: boolean;
  isEditing: boolean;
  editingTitle: string;
  onClick: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
  onTitleChange: (title: string) => void;
}

export interface SidebarSettingsProps {
  settingsValues: SettingsValues;
  settingsExpanded: SettingsExpanded;
  onSettingsChange: (key: keyof SettingsValues, value: SettingsValues[keyof SettingsValues]) => void;
  onToggleExpanded: (key: keyof SettingsExpanded) => void;
}

export interface AddAssistantModalProps {
  visible: boolean;
  onClose: () => void;
  onAddAssistant: (assistant: Assistant) => void;
  availableAssistants: Assistant[];
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
}