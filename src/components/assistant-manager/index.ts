/**
 * AssistantManager 组件统一导出
 */

// 主组件
export { default as AssistantManagerRefactored } from './AssistantManagerRefactored';

// 子组件
export { default as AssistantCard } from './AssistantCard';
export { default as AssistantCreateModal } from './AssistantCreateModal';
export { default as AssistantGrid } from './AssistantGrid';
export { default as AssistantHeader } from './AssistantHeader';
export { default as CategorySidebar } from './CategorySidebar';

// 类型定义
export type {
  Assistant,
  Category,
  AssistantForm,
  KnowledgeBaseOption,
  AssistantManagerProps,
  CategorySidebarProps,
  AssistantHeaderProps,
  AssistantGridProps,
  AssistantCardProps,
  AssistantCreateModalProps,
  FormState,
  FilterState
} from './types';

// 常量和工具函数
export {
  categories,
  knowledgeBaseOptions,
  mockAssistants,
  getAssistantIcon,
  filterAssistants
} from './constants';