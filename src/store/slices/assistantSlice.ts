import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

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

interface AssistantState {
  assistants: Assistant[];
  currentAssistantId?: string;
  loading: boolean;
  error?: string;
}

const initialState: AssistantState = {
  assistants: [],
  loading: false,
};

const assistantSlice = createSlice({
  name: 'assistant',
  initialState,
  reducers: {
    setAssistants: (state, action: PayloadAction<Assistant[]>) => {
      state.assistants = action.payload;
    },
    addAssistant: (state, action: PayloadAction<Assistant>) => {
      state.assistants.push(action.payload);
    },
    updateAssistant: (state, action: PayloadAction<Assistant>) => {
      const index = state.assistants.findIndex(a => a.id === action.payload.id);
      if (index > -1) {
        state.assistants[index] = action.payload;
      }
    },
    deleteAssistant: (state, action: PayloadAction<string>) => {
      state.assistants = state.assistants.filter(a => a.id !== action.payload);
      if (state.currentAssistantId === action.payload) {
        state.currentAssistantId = undefined;
      }
    },
    setCurrentAssistant: (state, action: PayloadAction<string | undefined>) => {
      state.currentAssistantId = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | undefined>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setAssistants,
  addAssistant,
  updateAssistant,
  deleteAssistant,
  setCurrentAssistant,
  setLoading,
  setError,
} = assistantSlice.actions;

export default assistantSlice.reducer;