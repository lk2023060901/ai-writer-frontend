/**
 * AssistantManager 组件相关类型定义
 * 从 AssistantManager.tsx 中抽离的类型定义
 */

// 助手数据接口
export interface Assistant {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  owner: 'my' | 'others';
  category: string;
  tags: string[];
  isFavorite: boolean;
  isPublic: boolean;
  usageCount: number;
}

// 分类数据接口
export interface Category {
  key: string;
  label: string;
  count: number;
  icon: React.ReactNode;
}

// 助手表单数据接口
export interface AssistantForm {
  emoji: string;
  name: string;
  prompt: string;
  knowledgeBase: string[];
}

// 知识库选项接口
export interface KnowledgeBaseOption {
  label: string;
  value: string;
}

// 组件 Props 接口
export interface AssistantManagerProps {
  className?: string;
}

export interface CategorySidebarProps {
  categories: Category[];
  activeCategory: string;
  onCategoryChange: (categoryKey: string) => void;
}

export interface AssistantHeaderProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  activeCategory: string;
  categories: Category[];
  filteredCount: number;
  onCreateAssistant: () => void;
  onImportAssistant: () => void;
}

export interface AssistantGridProps {
  assistants: Assistant[];
  onEditAssistant: (assistant: Assistant) => void;
  onDuplicateAssistant: (assistant: Assistant) => void;
  onDeleteAssistant: (assistant: Assistant) => void;
  onToggleFavorite: (assistantId: string) => void;
}

export interface AssistantCardProps {
  assistant: Assistant;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}

export interface AssistantCreateModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (formData: AssistantForm) => void;
  knowledgeBaseOptions: KnowledgeBaseOption[];
}

// 表单状态接口
export interface FormState {
  assistantForm: AssistantForm;
  promptHistory: string[];
  showCreateModal: boolean;
}

// 搜索和过滤状态接口
export interface FilterState {
  activeCategory: string;
  searchQuery: string;
}