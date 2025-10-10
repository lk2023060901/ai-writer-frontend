/**
 * SSE 统一类型定义
 */

// SSE 客户端配置
export interface SSEClientOptions {
  /** 是否启用日志 */
  enableLogging?: boolean;
  /** 请求超时时间(ms) */
  timeout?: number;
  /** 重连配置 */
  retry?: {
    /** 最大重连次数 */
    maxAttempts?: number;
    /** 重连延迟(ms) */
    delay?: number;
  };
  /** 请求头 */
  headers?: Record<string, string>;
}

// SSE 事件处理器
export type SSEEventHandlers<TEventMap extends Record<string, any>> = {
  [K in keyof TEventMap]?: (data: TEventMap[K]) => void;
};

// 通用 SSE 响应
export interface SSEResponse<T = any> {
  event: string;
  data: T;
  id?: string;
  retry?: number;
}

// ============================================
// 聊天流事件定义
// ============================================
export interface ChatStreamEvents {
  /** 流开始事件 */
  start: {
    provider: string;
    model: string;
  };
  /** Token 事件 */
  token: {
    provider: string;
    content: string;
    index: number;
  };
  /** 单个提供商完成 */
  done: {
    provider: string;
    token_count?: number;
    finish_reason?: string;
  };
  /** 所有提供商完成 */
  complete: {
    message: string;
  };
  /** 错误事件 */
  error: {
    provider?: string;
    error: string;
  };
}

// ============================================
// 文档上传流事件定义（适配后端新格式）
// ============================================

/** 后端返回的文档对象 */
export interface DocumentResponse {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  status: string;
  chunk_count: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentUploadEvents {
  /** SSE 连接建立 */
  connected: {
    client_id: string;
    resource: string;
  };
  /** 批量上传开始 */
  'batch-start': {
    total_count: number;
    message: string;
  };
  /** 文件上传成功 */
  'file-success': {
    index: number;
    total: number;
    completed: number;
    item_name: string;  // ← 后端改为 item_name
    message: string;
    data: DocumentResponse;  // ← 后端改为 data 嵌套
  };
  /** 文件上传失败 */
  'file-failed': {  // ← 后端改为 file-failed
    index: number;
    total: number;
    completed: number;
    item_name: string;
    error: string;
    message: string;
  };
  /** 批量上传完成 */
  'batch-complete': {
    total_count: number;
    success_count: number;
    failed_count: number;
    message: string;
  };
}

// ============================================
// 知识库状态流事件定义
// ============================================
export interface KnowledgeBaseStreamEvents {
  /** 文档状态更新 */
  'doc-status': {
    doc_id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    progress?: number;
  };
  /** 知识库统计更新 */
  'kb-stats': {
    total_docs: number;
    processing_docs: number;
    completed_docs: number;
    failed_docs: number;
  };
}
