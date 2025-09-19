// 基础类型定义

// 类型别名
export type ThemeMode = 'chatgpt' | 'claude';
export type SidebarTab = 'assistants' | 'topics' | 'settings';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Assistant {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  model: string;
  prompt: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Topic {
  id: string;
  title: string;
  assistantId: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage?: string;
}

export interface Message {
  id: string;
  topicId: string;
  role: 'user' | 'assistant';
  content: string;
  tokens?: number;
  model?: string;
  createdAt: string;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'document';
  name: string;
  url: string;
  size: number;
  mimeType: string;
}

export interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  documents: Document[];
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  name: string;
  content: string;
  type: string;
  size: number;
  uploadedAt: string;
}

// UI 状态类型
export interface UIState {
  sidebarCollapsed: boolean;
  theme: 'chatgpt' | 'claude';
  darkMode: boolean;
  currentTab: string;
  activeTabId?: string;
}

export interface TabItem {
  id: string;
  title: string;
  type: 'chat' | 'knowledge' | 'assistant' | 'settings';
  closable: boolean;
  data?: any;
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 聊天流式响应
export interface StreamChunk {
  id: string;
  content: string;
  finished: boolean;
  tokens?: number;
}

// Provider 配置
export interface ProviderConfig {
  id: string;
  name: string;
  apiKey: string;
  baseUrl?: string;
  models: string[];
  enabled: boolean;
}

// 设置类型
export interface Settings {
  streaming: boolean;
  autoSave: boolean;
  darkMode: boolean;
  theme: 'chatgpt' | 'claude';
  defaultModel: string;
  providers: ProviderConfig[];
}

// 搜索结果
export interface SearchResult {
  type: 'topic' | 'message';
  id: string;
  title: string;
  content: string;
  highlight: string;
  createdAt: string;
}