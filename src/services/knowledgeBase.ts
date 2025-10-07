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
    [key: string]: any;
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

  uploadDocumentSSE(kbId: string, file: File, onProgress?: (event: any) => void) {
    const formData = new FormData();
    formData.append('file', file);

    console.log('🚀 Starting SSE upload for:', file.name);
    console.log('📍 Upload URL:', `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/knowledge-bases/${kbId}/documents`);

    // 使用 fetch + ReadableStream 来处理 SSE
    return fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/knowledge-bases/${kbId}/documents`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          Accept: 'text/event-stream',
        },
        body: formData,
      }
    ).then(async (response) => {
      console.log('📥 Response received:', {
        status: response.status,
        contentType: response.headers.get('content-type'),
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      // 检查响应类型
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('text/event-stream')) {
        console.warn('⚠️ Response is not SSE, content-type:', contentType);
        console.warn('⚠️ Expected SSE but got different content type. This might indicate a backend configuration issue.');
        
        // 尝试按JSON处理，但这通常表示配置问题
        const data = await response.json();
        console.log('📦 Fallback JSON Response:', data);

        // 简单的事件触发，不模拟复杂流程
        if (onProgress && data.data) {
          onProgress({
            type: 'document_created',
            ...data.data
          });
        }

        return { data: data.data };
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let buffer = '';
      console.log('🎯 Starting to read SSE stream...');

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('✅ SSE stream finished');
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        // 保留最后一个可能不完整的行
        buffer = lines.pop() || '';

        for (const line of lines) {
          console.log('📝 SSE Line:', line);

          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              console.log('🏁 SSE stream done signal received');
              return { success: true };
            }

            try {
              const event = JSON.parse(data);
              console.log('🔔 SSE Event parsed:', {
                type: event.type,
                status: event.status,
                document_id: event.document_id || event.id,
                file_size: event.file_size,
                created_at: event.created_at,
                full_event: event
              });

              if (onProgress) {
                onProgress(event);
              }

              // 如果是最终状态，返回结果
              if (event.status === 'completed' || event.status === 'failed') {
                if (event.status === 'failed') {
                  throw new Error(event.error || 'Processing failed');
                }
                return { data: event };
              }
            } catch (e) {
              console.warn('Failed to parse SSE data:', data, e);
            }
          }
        }
      }

      return { success: true };
    });
  },

  async deleteDocument(kbId: string, docId: string) {
    return apiClient.delete<{ message: string }>(`/api/v1/knowledge-bases/${kbId}/documents/${docId}`);
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
