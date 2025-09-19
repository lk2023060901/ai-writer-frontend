import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// 临时类型定义，直到导入问题解决
type ThemeMode = 'chatgpt' | 'claude';
type SidebarTab = 'assistants' | 'topics' | 'settings';

interface UIState {
  sidebarCollapsed: boolean;
  theme: ThemeMode;
  darkMode: boolean;
  currentTab: string;
  activeTabId?: string;
}

interface TabItem {
  id: string;
  title: string;
  type: 'chat' | 'knowledge' | 'assistant' | 'settings';
  closable: boolean;
  data?: any;
}

const initialState: UIState & {
  tabs: TabItem[];
  activeTabId: string;
  sidebarActiveTab: SidebarTab;
} = {
  sidebarCollapsed: false,
  theme: 'chatgpt',
  darkMode: false,
  currentTab: 'home',
  activeTabId: 'home',
  sidebarActiveTab: 'assistants',
  tabs: [
    {
      id: 'home',
      title: '首页',
      type: 'chat',
      closable: false,
    },
  ],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload;
    },
    setSidebarActiveTab: (state, action: PayloadAction<SidebarTab>) => {
      state.sidebarActiveTab = action.payload;
    },
    addTab: (state, action: PayloadAction<TabItem>) => {
      const existingTab = state.tabs.find(tab => tab.id === action.payload.id);
      if (!existingTab) {
        // 在加号之前插入新标签
        state.tabs.push(action.payload);
      }
      state.activeTabId = action.payload.id;
    },
    removeTab: (state, action: PayloadAction<string>) => {
      const index = state.tabs.findIndex(tab => tab.id === action.payload);
      if (index > -1 && state.tabs[index].closable) {
        state.tabs.splice(index, 1);
        // 如果删除的是当前激活的标签，切换到前一个或首页
        if (state.activeTabId === action.payload) {
          if (state.tabs.length > 0) {
            state.activeTabId = state.tabs[Math.max(0, index - 1)].id;
          } else {
            state.activeTabId = 'home';
          }
        }
      }
    },
    setActiveTab: (state, action: PayloadAction<string>) => {
      state.activeTabId = action.payload;
    },
    updateTabTitle: (state, action: PayloadAction<{ id: string; title: string }>) => {
      const tab = state.tabs.find(tab => tab.id === action.payload.id);
      if (tab) {
        tab.title = action.payload.title;
      }
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  setTheme,
  toggleDarkMode,
  setDarkMode,
  setSidebarActiveTab,
  addTab,
  removeTab,
  setActiveTab,
  updateTabTitle,
} = uiSlice.actions;

export default uiSlice.reducer;