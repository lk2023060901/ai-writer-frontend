import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import uiSlice from './slices/uiSlice';
import chatSlice from './slices/chatSlice';
import assistantSlice from './slices/assistantSlice';
import { apiSlice } from './slices/apiSlice';

export const store = configureStore({
  reducer: {
    ui: uiSlice,
    chat: chatSlice,
    assistant: assistantSlice,
    api: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }).concat(apiSlice.middleware),
  devTools: process.env.NODE_ENV !== 'production',
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;