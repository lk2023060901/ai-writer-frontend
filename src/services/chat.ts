import { apiClient } from '@/utils/api';

export interface Agent {
  id: string;
  name: string;
  emoji: string;
  prompt: string;
  knowledge_base_ids?: string[];
  tags?: string[];
  enabled: boolean;
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

export const chatService = {
  // Agent APIs
  async getAgents(params?: { tags?: string; keyword?: string }) {
    return apiClient.get<Agent[]>('/api/v1/agents', params);
  },

  async getAgent(id: string) {
    return apiClient.get<Agent>(`/api/v1/agents/${id}`);
  },

  async createAgent(data: Partial<Agent>) {
    return apiClient.post<Agent>('/api/v1/agents', data);
  },

  async updateAgent(id: string, data: Partial<Agent>) {
    return apiClient.put<Agent>(`/api/v1/agents/${id}`, data);
  },

  async deleteAgent(id: string) {
    return apiClient.delete(`/api/v1/agents/${id}`);
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
};
