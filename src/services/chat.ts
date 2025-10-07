import { apiClient } from '@/utils/api';

export interface Agent {
  id: string;
  name: string;
  emoji: string;
  tags?: string[];
  knowledge_base_ids?: string[];
  is_official?: boolean; // Deprecated, use owner_id to determine
  is_enabled: boolean;
  owner_id?: string; // Empty means official, non-empty means user-defined
  prompt: string;
  type: string;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  assistant_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ContentBlock {
  type: 'text' | 'thinking' | 'tool_use' | 'tool_result';
  text?: string;
  id?: string;
  name?: string;
  input?: any;
  tool_use_id?: string;
  content?: string;
}

export interface Message {
  id: string;
  topic_id: string;
  role: 'user' | 'assistant';
  content_blocks: ContentBlock[];
  token_count?: number;
  created_at: string;
}

export interface CreateMessageRequest {
  role: 'user' | 'assistant';
  content_blocks: ContentBlock[];
}

export interface MessagesListResponse {
  messages: Message[];
  total: number;
  limit: number;
  offset: number;
}

export interface AgentsResponse {
  items: Agent[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

export interface ImportResponse {
  success_count: number;
  fail_count: number;
  errors?: string[];
  agents: Agent[];
}

export const chatService = {
  // Agent APIs
  async getAgents(params?: { page?: number; page_size?: number; tags?: string; keyword?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.page_size) queryParams.append('page_size', params.page_size.toString());
    if (params?.tags) queryParams.append('tags', params.tags);
    if (params?.keyword) queryParams.append('keyword', params.keyword);

    const endpoint = `/api/v1/agents${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<AgentsResponse>(endpoint);
  },

  async getAgent(id: string) {
    return apiClient.get<Agent>(`/api/v1/agents/${id}`);
  },

  async createAgent(data: {
    name: string;
    emoji?: string;
    prompt: string;
    tags?: string[];
    knowledge_base_ids?: string[];
  }) {
    return apiClient.post<Agent>('/api/v1/agents', data);
  },

  async updateAgent(id: string, data: Partial<Agent>) {
    return apiClient.put<Agent>(`/api/v1/agents/${id}`, data);
  },

  async enableAgent(id: string) {
    return apiClient.patch(`/api/v1/agents/${id}/enable`);
  },

  async disableAgent(id: string) {
    return apiClient.patch(`/api/v1/agents/${id}/disable`);
  },

  async deleteAgent(id: string) {
    return apiClient.delete(`/api/v1/agents/${id}`);
  },

  async importAgentsFromFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    // Use the same base URL as the apiClient
    const baseUrl = typeof window !== 'undefined'
      ? (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080')
      : 'http://localhost:8080';
    const apiUrl = `${baseUrl}/api/v1/agents/import/file`;

    console.log('Attempting import to:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    const contentType = response.headers.get('content-type');

    if (!response.ok) {
      // Check if response is JSON or HTML
      if (contentType && contentType.includes('application/json')) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to import agents from file');
      } else {
        // Backend API might not have this endpoint yet, return a helpful message
        console.warn('Import API endpoint not available, falling back to individual creation');
        throw new Error('Bulk import endpoint not available');
      }
    }

    // Make sure response is JSON before parsing
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned invalid response format');
    }

    const result = await response.json();
    return result.data as ImportResponse;
  },

  async importAgentsFromUrl(url: string) {
    return apiClient.post<ImportResponse>('/api/v1/agents/import/url', { url });
  },

  // Topic APIs
  async getTopics(assistantId: string) {
    return apiClient.get<Topic[]>(`/api/v1/assistants/${assistantId}/topics`);
  },

  async getTopic(assistantId: string, topicId: string) {
    return apiClient.get<Topic>(`/api/v1/assistants/${assistantId}/topics/${topicId}`);
  },

  async createTopic(assistantId: string, data: { name: string }) {
    return apiClient.post<Topic>(`/api/v1/assistants/${assistantId}/topics`, data);
  },

  async updateTopic(assistantId: string, topicId: string, data: { name: string }) {
    return apiClient.put<Topic>(`/api/v1/assistants/${assistantId}/topics/${topicId}`, data);
  },

  async deleteTopic(assistantId: string, topicId: string) {
    return apiClient.delete(`/api/v1/assistants/${assistantId}/topics/${topicId}`);
  },

  async deleteAllTopics(assistantId: string) {
    return apiClient.delete(`/api/v1/assistants/${assistantId}/topics`);
  },

  // Message APIs
  async getMessages(topicId: string, params?: { limit?: number; offset?: number }) {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const endpoint = `/api/v1/topics/${topicId}/messages${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<MessagesListResponse>(endpoint);
  },

  async getMessage(topicId: string, messageId: string) {
    return apiClient.get<Message>(`/api/v1/topics/${topicId}/messages/${messageId}`);
  },

  async createMessage(topicId: string, data: CreateMessageRequest) {
    return apiClient.post<Message>(`/api/v1/topics/${topicId}/messages`, data);
  },

  async deleteAllMessages(topicId: string) {
    return apiClient.delete(`/api/v1/topics/${topicId}/messages`);
  },

  // SSE Streaming Chat
  async streamChat(params: {
    topicId: string;
    message: string;
    providers: Array<{ provider: string; model: string }>;
    onToken?: (data: { provider: string; content: string; index: number }) => void;
    onStart?: (data: { provider: string; model: string }) => void;
    onDone?: (data: { provider: string; token_count?: number; finish_reason?: string }) => void;
    onAllDone?: () => void;
    onError?: (error: Error) => void;
  }) {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    const baseUrl = typeof window !== 'undefined'
      ? (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080')
      : 'http://localhost:8080';

    const response = await fetch(`${baseUrl}/api/v1/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        topic_id: params.topicId,
        message: params.message,
        providers: params.providers,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('Response body is null');
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('event:')) {
            // Event type line, skip it as we determine type from data structure
            continue;
          }

          if (line.startsWith('data:')) {
            const dataStr = line.substring(5).trim();
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);

              // Determine event type from the previous event line
              // Since we're processing line by line, we need to track the event
              // For simplicity, we'll detect based on data structure
              if (data.provider && data.model && !data.content) {
                params.onStart?.(data);
              } else if (data.provider && data.content !== undefined) {
                params.onToken?.(data);
              } else if (data.provider && data.finish_reason) {
                params.onDone?.(data);
              } else if (data.message === 'All providers completed') {
                params.onAllDone?.();
              }
            } catch (e) {
              console.error('Failed to parse SSE data:', e, dataStr);
            }
          }
        }
      }
    } catch (error) {
      params.onError?.(error as Error);
    } finally {
      reader.releaseLock();
    }
  },
};
