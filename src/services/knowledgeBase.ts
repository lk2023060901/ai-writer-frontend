import { apiClient } from '@/utils/api';

export interface KnowledgeBase {
  id: string;
  user_id: string;
  name: string;
  ai_provider_config_id: string;
  chunk_size: number;
  chunk_overlap: number;
  chunk_strategy: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  knowledge_base_id: string;
  filename: string;
  file_path: string;
  file_size: number;
  file_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  total_chunks?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateKnowledgeBaseRequest {
  name: string;
  ai_provider_config_id: string;
  chunk_size?: number;
  chunk_overlap?: number;
  chunk_strategy?: string;
}

export interface SearchRequest {
  query: string;
  top_k?: number;
  use_rerank?: boolean;
}

export interface SearchResult {
  chunk_id: string;
  content: string;
  score: number;
  document_id: string;
  metadata: Record<string, any>;
}

export const knowledgeBaseService = {
  // Knowledge Base APIs
  async getKnowledgeBases(params?: { page?: number; page_size?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

    const endpoint = `/api/v1/knowledge-bases${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<KnowledgeBase[]>(endpoint);
  },

  async getKnowledgeBase(id: string) {
    return apiClient.get<KnowledgeBase>(`/api/v1/knowledge-bases/${id}`);
  },

  async createKnowledgeBase(data: CreateKnowledgeBaseRequest) {
    return apiClient.post<KnowledgeBase>('/api/v1/knowledge-bases', data);
  },

  async updateKnowledgeBase(id: string, data: Partial<CreateKnowledgeBaseRequest>) {
    return apiClient.put<KnowledgeBase>(`/api/v1/knowledge-bases/${id}`, data);
  },

  async deleteKnowledgeBase(id: string) {
    return apiClient.delete(`/api/v1/knowledge-bases/${id}`);
  },

  // Document APIs
  async getDocuments(
    kbId: string,
    params?: { page?: number; page_size?: number; status?: string }
  ) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.status) queryParams.append('status', params.status);

    const endpoint = `/api/v1/knowledge-bases/${kbId}/documents${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<Document[]>(endpoint);
  },

  async getDocument(kbId: string, docId: string) {
    return apiClient.get<Document>(`/api/v1/knowledge-bases/${kbId}/documents/${docId}`);
  },

  async uploadDocument(kbId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/knowledge-bases/${kbId}/documents`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return { data };
  },

  async deleteDocument(kbId: string, docId: string) {
    return apiClient.delete(`/api/v1/knowledge-bases/${kbId}/documents/${docId}`);
  },

  async reprocessDocument(kbId: string, docId: string) {
    return apiClient.post<Document>(
      `/api/v1/knowledge-bases/${kbId}/documents/${docId}/reprocess`,
      {}
    );
  },

  async searchDocuments(kbId: string, data: SearchRequest) {
    return apiClient.post<{ results: SearchResult[] }>(
      `/api/v1/knowledge-bases/${kbId}/search`,
      data
    );
  },
};
