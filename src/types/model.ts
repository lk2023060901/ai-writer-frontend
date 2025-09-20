// AI模型相关类型定义

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  icon?: string;
  capabilities?: string[];
  description?: string;
  isNew?: boolean;
  isPro?: boolean;
  isDefault?: boolean;
}

export interface ModelProvider {
  id: string;
  name: string;
  icon?: string;
  models: AIModel[];
}

export interface ModelSelection {
  modelId: string;
  modelName: string;
  provider: string;
}