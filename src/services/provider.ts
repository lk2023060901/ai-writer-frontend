import { apiClient } from '@/utils/api';

export interface AIProviderConfig {
  id: string;
  provider_type: string;
  provider_name: string;
  api_key: string;
  api_base_url?: string;
  embedding_model?: string;
  embedding_dimensions?: number;
  supports_chat: boolean;
  supports_embedding: boolean;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProviderRequest {
  provider_type: string;
  provider_name: string;
  api_key: string;
  api_base_url?: string;
  embedding_model?: string;
  embedding_dimensions?: number;
  supports_chat?: boolean;
  supports_embedding?: boolean;
}

export const providerService = {
  async getProviders() {
    return apiClient.get<AIProviderConfig[]>('/api/v1/ai-providers');
  },

  async getProvider(id: string) {
    return apiClient.get<AIProviderConfig>(`/api/v1/ai-providers/${id}`);
  },

  async createProvider(data: CreateProviderRequest) {
    return apiClient.post<AIProviderConfig>('/api/v1/ai-providers', data);
  },

  async updateProvider(id: string, data: Partial<CreateProviderRequest>) {
    return apiClient.put<AIProviderConfig>(`/api/v1/ai-providers/${id}`, data);
  },

  async deleteProvider(id: string) {
    return apiClient.delete(`/api/v1/ai-providers/${id}`);
  },

  async toggleProvider(id: string, enabled: boolean) {
    return apiClient.patch<AIProviderConfig>(`/api/v1/ai-providers/${id}`, {
      enabled,
    });
  },
};
