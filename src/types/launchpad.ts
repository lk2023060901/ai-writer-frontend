export type KnowledgeItemStatus = 'ready' | 'processing' | 'failed';

export interface BaseKnowledgeItem {
  id: string;
  title: string;
  createdAt: string;
  status: KnowledgeItemStatus;
  tags?: string[];
}

export interface KnowledgeFileItem extends BaseKnowledgeItem {
  size: string;
  tokens: number;
}

export interface KnowledgeNoteItem extends BaseKnowledgeItem {
  author: string;
}

export interface KnowledgeDirectoryItem extends BaseKnowledgeItem {
  path: string;
  documentCount: number;
}

export interface KnowledgeUrlItem extends BaseKnowledgeItem {
  url: string;
  lastCrawlAt?: string;
}

export interface KnowledgeSitemapItem extends BaseKnowledgeItem {
  rootUrl: string;
  pageCount: number;
}

export interface KnowledgeBaseModelInfo {
  provider: string;
  model: string;
  embeddingModel: string;
}

export interface KnowledgeBaseStats {
  documents: number;
  tokens: number;
  size: string;
  lastUpdated: string;
}

export interface KnowledgeBaseMeta {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  knowledgeRecognition: 'on' | 'off';
  modelInfo: KnowledgeBaseModelInfo;
  stats: KnowledgeBaseStats;
}

export interface KnowledgeBase extends KnowledgeBaseMeta {
  files: KnowledgeFileItem[];
  notes: KnowledgeNoteItem[];
  directories: KnowledgeDirectoryItem[];
  urls: KnowledgeUrlItem[];
  sitemaps: KnowledgeSitemapItem[];
}

export interface KnowledgeSearchMetadata {
  source: string;
  type: 'text' | 'video';
  video?: {
    path?: string;
  };
}

export interface KnowledgeSearchResult {
  id: string;
  title: string;
  pageContent: string;
  score: number;
  metadata: KnowledgeSearchMetadata;
  file?: {
    name: string;
    originName: string;
    path?: string;
  } | null;
}

export type AssistantPresetSource = 'system' | 'custom' | 'community';

export interface AssistantPreset {
  id: string;
  name: string;
  description?: string;
  category: string;
  tags: string[];
  model: string;
  prompt?: string;
  source: AssistantPresetSource;
  avatar?: string;
}

export interface AssistantGroup {
  id: string;
  name: string;
  presets: AssistantPreset[];
  description?: string;
}

export type FileCategory = 'all' | 'document' | 'image' | 'audio' | 'video' | 'archive';

export interface FileEntry {
  id: string;
  name: string;
  category: FileCategory;
  extension: string;
  size: number;
  formattedSize: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  owner: string;
}

export interface FileLibrary {
  entries: FileEntry[];
}
