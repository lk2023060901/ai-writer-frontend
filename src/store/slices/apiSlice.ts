import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// 临时类型定义
interface Assistant {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  model: string;
  prompt: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Topic {
  id: string;
  title: string;
  assistantId: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage?: string;
}

interface Message {
  id: string;
  topicId: string;
  role: 'user' | 'assistant';
  content: string;
  tokens?: number;
  model?: string;
  createdAt: string;
  attachments?: any[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// interface PaginatedResponse<T> {
//   data: T[];
//   total: number;
//   page: number;
//   pageSize: number;
// }

interface KnowledgeBase {
  id: string;
  name: string;
  description: string;
  documents: Document[];
  createdAt: string;
  updatedAt: string;
}

interface Document {
  id: string;
  name: string;
  content: string;
  type: string;
  size: number;
  uploadedAt: string;
}

interface Settings {
  streaming: boolean;
  autoSave: boolean;
  darkMode: boolean;
  theme: 'chatgpt' | 'claude';
  defaultModel: string;
  providers: any[];
}

// 基础查询配置
const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers, { getState: _getState }) => {
    // 可以在这里添加认证token
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Assistant', 'Topic', 'Message', 'KnowledgeBase', 'Document'],
  endpoints: (builder) => ({
    // 助手相关API
    getAssistants: builder.query<ApiResponse<Assistant[]>, void>({
      query: () => '/assistants',
      providesTags: ['Assistant'],
    }),
    getAssistant: builder.query<ApiResponse<Assistant>, string>({
      query: (id) => `/assistants/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Assistant', id }],
    }),
    createAssistant: builder.mutation<ApiResponse<Assistant>, Partial<Assistant>>({
      query: (assistant) => ({
        url: '/assistants',
        method: 'POST',
        body: assistant,
      }),
      invalidatesTags: ['Assistant'],
    }),
    updateAssistant: builder.mutation<ApiResponse<Assistant>, { id: string; assistant: Partial<Assistant> }>({
      query: ({ id, assistant }) => ({
        url: `/assistants/${id}`,
        method: 'PUT',
        body: assistant,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Assistant', id }],
    }),
    deleteAssistant: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/assistants/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Assistant'],
    }),

    // 话题相关API
    getTopics: builder.query<ApiResponse<Topic[]>, { assistantId?: string; page?: number; pageSize?: number }>({
      query: ({ assistantId, page = 1, pageSize = 20 }) => ({
        url: '/topics',
        params: { assistantId, page, pageSize },
      }),
      providesTags: ['Topic'],
    }),
    getTopic: builder.query<ApiResponse<Topic>, string>({
      query: (id) => `/topics/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Topic', id }],
    }),
    createTopic: builder.mutation<ApiResponse<Topic>, { title: string; assistantId: string }>({
      query: (topic) => ({
        url: '/topics',
        method: 'POST',
        body: topic,
      }),
      invalidatesTags: ['Topic'],
    }),
    updateTopic: builder.mutation<ApiResponse<Topic>, { id: string; topic: Partial<Topic> }>({
      query: ({ id, topic }) => ({
        url: `/topics/${id}`,
        method: 'PUT',
        body: topic,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Topic', id }],
    }),
    deleteTopic: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/topics/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Topic'],
    }),

    // 消息相关API
    getMessages: builder.query<ApiResponse<Message[]>, { topicId: string; page?: number; pageSize?: number }>({
      query: ({ topicId, page = 1, pageSize = 50 }) => ({
        url: `/topics/${topicId}/messages`,
        params: { page, pageSize },
      }),
      providesTags: (_result, _error, { topicId }) => [{ type: 'Message', id: topicId }],
    }),
    sendMessage: builder.mutation<ApiResponse<Message>, {
      topicId: string;
      content: string;
      attachments?: any[]
    }>({
      query: ({ topicId, content, attachments }) => ({
        url: `/topics/${topicId}/messages`,
        method: 'POST',
        body: { content, attachments },
      }),
      invalidatesTags: (_result, _error, { topicId }) => [{ type: 'Message', id: topicId }],
    }),
    deleteMessage: builder.mutation<ApiResponse<void>, { topicId: string; messageId: string }>({
      query: ({ topicId, messageId }) => ({
        url: `/topics/${topicId}/messages/${messageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { topicId }) => [{ type: 'Message', id: topicId }],
    }),
    regenerateMessage: builder.mutation<ApiResponse<Message>, string>({
      query: (messageId) => ({
        url: `/messages/${messageId}/regenerate`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, _messageId) => ['Message'],
    }),

    // 知识库相关API
    getKnowledgeBases: builder.query<ApiResponse<KnowledgeBase[]>, void>({
      query: () => '/knowledge-bases',
      providesTags: ['KnowledgeBase'],
    }),
    getKnowledgeBase: builder.query<ApiResponse<KnowledgeBase>, string>({
      query: (id) => `/knowledge-bases/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'KnowledgeBase', id }],
    }),
    createKnowledgeBase: builder.mutation<ApiResponse<KnowledgeBase>, Partial<KnowledgeBase>>({
      query: (kb) => ({
        url: '/knowledge-bases',
        method: 'POST',
        body: kb,
      }),
      invalidatesTags: ['KnowledgeBase'],
    }),
    updateKnowledgeBase: builder.mutation<ApiResponse<KnowledgeBase>, { id: string; kb: Partial<KnowledgeBase> }>({
      query: ({ id, kb }) => ({
        url: `/knowledge-bases/${id}`,
        method: 'PUT',
        body: kb,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'KnowledgeBase', id }],
    }),
    deleteKnowledgeBase: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({
        url: `/knowledge-bases/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['KnowledgeBase'],
    }),

    // 文档相关API
    uploadDocument: builder.mutation<ApiResponse<Document>, { kbId: string; file: File }>({
      query: ({ kbId, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: `/knowledge-bases/${kbId}/documents`,
          method: 'POST',
          body: formData,
        };
      },
      invalidatesTags: (_result, _error, { kbId }) => [{ type: 'KnowledgeBase', id: kbId }],
    }),
    deleteDocument: builder.mutation<ApiResponse<void>, { kbId: string; docId: string }>({
      query: ({ kbId, docId }) => ({
        url: `/knowledge-bases/${kbId}/documents/${docId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { kbId }) => [{ type: 'KnowledgeBase', id: kbId }],
    }),

    // 设置相关API
    getSettings: builder.query<ApiResponse<Settings>, void>({
      query: () => '/settings',
    }),
    updateSettings: builder.mutation<ApiResponse<Settings>, Partial<Settings>>({
      query: (settings) => ({
        url: '/settings',
        method: 'PUT',
        body: settings,
      }),
    }),

    // 搜索API
    search: builder.query<ApiResponse<any[]>, { query: string; type?: 'all' | 'topics' | 'messages' }>({
      query: ({ query, type = 'all' }) => ({
        url: '/search',
        params: { q: query, type },
      }),
    }),
  }),
});

// 导出hooks
export const {
  useGetAssistantsQuery,
  useGetAssistantQuery,
  useCreateAssistantMutation,
  useUpdateAssistantMutation,
  useDeleteAssistantMutation,

  useGetTopicsQuery,
  useGetTopicQuery,
  useCreateTopicMutation,
  useUpdateTopicMutation,
  useDeleteTopicMutation,

  useGetMessagesQuery,
  useSendMessageMutation,
  useDeleteMessageMutation,
  useRegenerateMessageMutation,

  useGetKnowledgeBasesQuery,
  useGetKnowledgeBaseQuery,
  useCreateKnowledgeBaseMutation,
  useUpdateKnowledgeBaseMutation,
  useDeleteKnowledgeBaseMutation,

  useUploadDocumentMutation,
  useDeleteDocumentMutation,

  useGetSettingsQuery,
  useUpdateSettingsMutation,

  useSearchQuery,
} = apiSlice;