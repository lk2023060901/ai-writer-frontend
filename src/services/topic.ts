import { apiClient } from '@/utils/api';

export interface Topic {
  id: string;
  assistant_id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTopicRequest {
  name?: string;
}

export interface UpdateTopicRequest {
  name: string;
}

export const topicService = {
  // Get all topics for current user (across all assistants)
  async getAllTopics() {
    return apiClient.get<Topic[]>('/api/v1/topics');
  },

  // Create a new topic
  async createTopic(assistantId: string, data: CreateTopicRequest) {
    return apiClient.post<Topic>(`/api/v1/assistants/${assistantId}/topics`, data);
  },

  // Get topic details
  async getTopic(assistantId: string, topicId: string) {
    return apiClient.get<Topic>(`/api/v1/assistants/${assistantId}/topics/${topicId}`);
  },

  // List all topics for an assistant
  async getTopics(assistantId: string) {
    return apiClient.get<Topic[]>(`/api/v1/assistants/${assistantId}/topics`);
  },

  // Update topic name
  async updateTopic(assistantId: string, topicId: string, data: UpdateTopicRequest) {
    return apiClient.put<Topic>(`/api/v1/assistants/${assistantId}/topics/${topicId}`, data);
  },

  // Delete a specific topic
  async deleteTopic(assistantId: string, topicId: string) {
    return apiClient.delete<{ message: string }>(`/api/v1/assistants/${assistantId}/topics/${topicId}`);
  },

  // Delete all topics (will create a new default topic)
  async deleteAllTopics(assistantId: string) {
    return apiClient.delete<{ message: string }>(`/api/v1/assistants/${assistantId}/topics`);
  },
};
