import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// 临时类型定义
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

interface Topic {
  id: string;
  title: string;
  assistantId: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage?: string;
}

interface ChatState {
  currentTopicId?: string;
  topics: Topic[];
  messages: Record<string, Message[]>;
  isStreaming: boolean;
  streamingTopicId?: string;
  searchQuery: string;
  searchResults: Message[];
}

const initialState: ChatState = {
  topics: [],
  messages: {},
  isStreaming: false,
  searchQuery: '',
  searchResults: [],
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentTopic: (state, action: PayloadAction<string | undefined>) => {
      state.currentTopicId = action.payload;
    },
    addTopic: (state, action: PayloadAction<Topic>) => {
      state.topics.unshift(action.payload);
      state.currentTopicId = action.payload.id;
      state.messages[action.payload.id] = [];
    },
    updateTopic: (state, action: PayloadAction<Topic>) => {
      const index = state.topics.findIndex(topic => topic.id === action.payload.id);
      if (index > -1) {
        state.topics[index] = action.payload;
      }
    },
    deleteTopic: (state, action: PayloadAction<string>) => {
      state.topics = state.topics.filter(topic => topic.id !== action.payload);
      delete state.messages[action.payload];
      if (state.currentTopicId === action.payload) {
        state.currentTopicId = undefined;
      }
    },
    setTopics: (state, action: PayloadAction<Topic[]>) => {
      state.topics = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      const { topicId } = action.payload;
      if (!state.messages[topicId]) {
        state.messages[topicId] = [];
      }
      state.messages[topicId].push(action.payload);

      // 更新话题的最后消息
      const topic = state.topics.find(t => t.id === topicId);
      if (topic) {
        topic.lastMessage = action.payload.content.substring(0, 100);
        topic.messageCount = state.messages[topicId].length;
        topic.updatedAt = action.payload.createdAt;
      }
    },
    updateMessage: (state, action: PayloadAction<Message>) => {
      const { topicId, id } = action.payload;
      const messages = state.messages[topicId];
      if (messages) {
        const index = messages.findIndex(msg => msg.id === id);
        if (index > -1) {
          messages[index] = action.payload;
        }
      }
    },
    appendToMessage: (state, action: PayloadAction<{ topicId: string; messageId: string; content: string }>) => {
      const { topicId, messageId, content } = action.payload;
      const messages = state.messages[topicId];
      if (messages) {
        const message = messages.find(msg => msg.id === messageId);
        if (message) {
          message.content += content;
        }
      }
    },
    deleteMessage: (state, action: PayloadAction<{ topicId: string; messageId: string }>) => {
      const { topicId, messageId } = action.payload;
      const messages = state.messages[topicId];
      if (messages) {
        state.messages[topicId] = messages.filter(msg => msg.id !== messageId);
      }
    },
    setMessages: (state, action: PayloadAction<{ topicId: string; messages: Message[] }>) => {
      const { topicId, messages } = action.payload;
      state.messages[topicId] = messages;
    },
    setStreaming: (state, action: PayloadAction<{ isStreaming: boolean; topicId?: string }>) => {
      state.isStreaming = action.payload.isStreaming;
      state.streamingTopicId = action.payload.topicId;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<Message[]>) => {
      state.searchResults = action.payload;
    },
    clearSearch: (state) => {
      state.searchQuery = '';
      state.searchResults = [];
    },
  },
});

export const {
  setCurrentTopic,
  addTopic,
  updateTopic,
  deleteTopic,
  setTopics,
  addMessage,
  updateMessage,
  appendToMessage,
  deleteMessage,
  setMessages,
  setStreaming,
  setSearchQuery,
  setSearchResults,
  clearSearch,
} = chatSlice.actions;

export default chatSlice.reducer;