import { apiClient } from '@/utils/api';

export interface KnowledgeBase {
  id: string;
  name: string;
  is_official: boolean;
  document_count: number;
  owner_id: string;
  embedding_model_id: string;
  rerank_model_id?: string | null;
  chunk_size: number;
  chunk_overlap: number;
  chunk_strategy: string;
  milvus_collection?: string;
  created_at: string;
  updated_at: string;
}

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_page: number;
}

export interface KnowledgeBaseListResponse {
  items: KnowledgeBase[];
  pagination: Pagination;
}

export interface Document {
  id: string;
  knowledge_base_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  process_status: 'pending' | 'processing' | 'completed' | 'failed';
  chunk_count: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentListResponse {
  items: Document[];
  pagination: Pagination;
}

export interface CreateKnowledgeBaseRequest {
  name: string;
  embedding_model_id: string;
  rerank_model_id?: string;
  chunk_size?: number;
  chunk_overlap?: number;
  chunk_strategy?: string;
}

export interface UpdateKnowledgeBaseRequest {
  name?: string;
}

export interface SearchRequest {
  query: string;
  top_k?: number;
  use_rerank?: boolean;
}

export interface SearchResult {
  document_id: string;
  content: string;
  score: number;
  metadata: {
    file_name: string;
    page?: number;
    chunk_index?: number;
    [key: string]: unknown;
  };
}

export interface DocumentProvider {
  id: number;
  provider_name: string;
}

export const knowledgeBaseService = {
  // Document Provider APIs
  async getDocumentProviders() {
    return apiClient.get<DocumentProvider[]>('/api/v1/document-providers');
  },

  // Knowledge Base APIs
  async getKnowledgeBases(params?: { page?: number; page_size?: number; keyword?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.keyword) queryParams.append('keyword', params.keyword);

    const endpoint = `/api/v1/knowledge-bases${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<KnowledgeBaseListResponse>(endpoint);
  },

  async getKnowledgeBase(id: string) {
    return apiClient.get<KnowledgeBase>(`/api/v1/knowledge-bases/${id}`);
  },

  async createKnowledgeBase(data: CreateKnowledgeBaseRequest) {
    return apiClient.post<KnowledgeBase>('/api/v1/knowledge-bases', data);
  },

  async updateKnowledgeBase(id: string, data: UpdateKnowledgeBaseRequest) {
    return apiClient.patch<KnowledgeBase>(`/api/v1/knowledge-bases/${id}`, data);
  },

  async deleteKnowledgeBase(id: string) {
    return apiClient.delete<{ message: string }>(`/api/v1/knowledge-bases/${id}`);
  },

  async batchDeleteKnowledgeBases(ids: string[]) {
    return apiClient.delete<{ message: string }>('/api/v1/knowledge-bases/batch', { ids });
  },

  // Document APIs
  async getDocuments(
    kbId: string,
    params?: { page?: number; page_size?: number }
  ) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

    const endpoint = `/api/v1/knowledge-bases/${kbId}/documents${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<DocumentListResponse>(endpoint);
  },

  async getDocument(kbId: string, docId: string) {
    return apiClient.get<Document>(`/api/v1/knowledge-bases/${kbId}/documents/${docId}`);
  },

  async uploadDocument(kbId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post<{ document: Document; message: string }>(
      `/api/v1/knowledge-bases/${kbId}/documents/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  // 批量上传文档 - 使用 SSE 流式响应
  async batchUploadDocuments(
    kbId: string,
    files: File[],
    onEvent?: (eventType: string, data: Record<string, unknown>) => void
  ): Promise<{ success: boolean }> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const token = localStorage.getItem('access_token');

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/knowledge-bases/${kbId}/documents/batch-upload`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // 不要设置 Content-Type，让浏览器自动设置 multipart/form-data
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    // 处理 SSE 流响应
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.substring(6));
            onEvent?.(data.type, data);
          } catch (e) {
            console.error('Failed to parse SSE data:', e);
          }
        }
      }
    }

    return { success: true };
  },

  // 监控单个文档处理状态
  createDocumentStatusStream(kbId: string, docId: string): EventSource {
    const token = localStorage.getItem('access_token');
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/knowledge-bases/${kbId}/document-stream/${docId}?resource=doc:${docId}&token=${encodeURIComponent(token || '')}`;
    
    return new EventSource(url);
  },

  // 监控知识库级别的文档状态
  createKnowledgeBaseStatusStream(kbId: string): EventSource {
    const token = localStorage.getItem('access_token');
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/knowledge-bases/${kbId}/document-stream/dummy?resource=kb:${kbId}&token=${encodeURIComponent(token || '')}`;
    
    return new EventSource(url);
  },

  async deleteDocument(kbId: string, docId: string) {
    return apiClient.delete<{ message: string }>(`/api/v1/knowledge-bases/${kbId}/documents/${docId}`);
  },

  async batchDeleteDocuments(kbId: string, documentIds: string[]) {
    return apiClient.post<{
      total_count: number;
      success_count: number;
      failed_count: number;
      failed_items?: Array<{ document_id: string; error: string }>;
    }>(`/api/v1/knowledge-bases/${kbId}/documents/batch-delete`, {
      document_ids: documentIds,
    });
  },

  async reprocessDocument(kbId: string, docId: string) {
    return apiClient.post<{ message: string }>(
      `/api/v1/knowledge-bases/${kbId}/documents/${docId}/reprocess`,
      {}
    );
  },

  async searchDocuments(kbId: string, data: SearchRequest) {
    return apiClient.post<SearchResult[]>(
      `/api/v1/knowledge-bases/${kbId}/search`,
      data
    );
  },
};
