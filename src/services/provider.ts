import { apiClient } from '@/utils/api';

export interface AIProviderConfig {
  id: string;
  provider_type: string;
  provider_name: string;
  is_official: boolean;
  owner_id: string;
  api_key: string;
  api_base_url?: string;
  embedding_model?: string;
  embedding_dimensions?: number;
  is_enabled: boolean;
  created_at?: string;
  updated_at?: string;
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

export interface AIModel {
  id: string;
  model_name: string;
  display_name?: string;
  max_tokens?: number | null;
  is_enabled: boolean;
  verification_status: string;
  capabilities: string[]; // ["chat", "embedding", "rerank"]
  supports_stream: boolean;
  supports_vision: boolean;
  supports_function_calling: boolean;
  supports_reasoning: boolean;
  supports_web_search: boolean;
  embedding_dimensions?: number;
  created_at: string;
  updated_at: string;
}

export interface AIProviderWithModels {
  id: string;
  provider_type: string;
  provider_name: string;
  api_base_url: string;
  is_enabled: boolean;
  models: AIModel[];
}

export const providerService = {
  async getProvidersWithModels() {
    return apiClient.get<AIProviderWithModels[]>('/api/v1/ai-providers/with-models');
  },


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

  async toggleProvider(id: string, is_enabled: boolean) {
    return apiClient.patch<AIProviderConfig>(`/api/v1/ai-providers/${id}/status`, {
      is_enabled,
    });
  },

  async getAIModel(id: string) {
    return apiClient.get<AIModel>(`/api/v1/ai-models/${id}`);
  },

  async syncProviderModels(providerId: string) {
    return apiClient.post<{
      sync_log_id: string;
      provider_id: string;
      provider_name: string;
      synced_at: string;
      models_added: number;
      models_updated: number;
      models_removed: number;
      total_models: number;
    }>(`/api/v1/ai-providers/${providerId}/models/sync`, {});
  },

  async getProviderModels(providerId: string, params?: { page?: number; page_size?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

    const endpoint = `/api/v1/ai-providers/${providerId}/models${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<{
      items: AIModel[];
      total: number;
    }>(endpoint);
  },
};
