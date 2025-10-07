import { apiClient } from '@/utils/api';

export interface AssistantFavorite {
  id: string;
  user_id: string;
  assistant_id: string;
  sort_order: number;
  created_at: string;
}

export interface AssistantFavoriteWithDetails extends AssistantFavorite {
  assistant_name: string;
  assistant_emoji: string;
  assistant_type: string;
  assistant_tags?: string[];
}

export interface AddFavoriteRequest {
  assistant_id: string;
}

export const favoritesService = {
  /**
   * Get user's favorite assistants
   */
  async getFavorites() {
    return apiClient.get<AssistantFavoriteWithDetails[]>('/api/v1/favorites');
  },

  /**
   * Add assistant to favorites
   */
  async addFavorite(data: AddFavoriteRequest) {
    return apiClient.post<AssistantFavorite>('/api/v1/favorites', data);
  },

  /**
   * Remove assistant from favorites
   */
  async removeFavorite(assistantId: string) {
    return apiClient.delete(`/api/v1/favorites/${assistantId}`);
  },
};
