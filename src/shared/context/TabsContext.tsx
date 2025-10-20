'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';

export interface Tab {
  id: string;
  name: string;
  icon: React.ReactNode;
  path: string;
  closable: boolean;
}

interface TabsContextType {
  tabs: Tab[];
  activeTabId: string;
  addTab: (tab: Tab) => void;
  removeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  getTabById: (tabId: string) => Tab | undefined;
  reorderTabs: (sourceId: string, targetId: string) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export function TabsProvider({ children }: { children: ReactNode }) {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('');

  const addTab = useCallback((tab: Tab) => {
    setTabs((prevTabs) => {
      // 检查标签页是否已存在
      const exists = prevTabs.find(t => t.id === tab.id);
      if (exists) {
        return prevTabs;
      }
      return [...prevTabs, tab];
    });
    setActiveTabId(tab.id);
  }, []);

  const removeTab = useCallback((tabId: string) => {
    setTabs((prevTabs) => {
      const filtered = prevTabs.filter(t => t.id !== tabId);

      // 如果删除的是当前活动标签，切换到其他标签
      if (tabId === activeTabId && filtered.length > 0) {
        const tabIndex = prevTabs.findIndex(t => t.id === tabId);
        const nextTab = filtered[tabIndex] || filtered[tabIndex - 1] || filtered[0];
        if (nextTab) {
          setActiveTabId(nextTab.id);
        }
      }

      return filtered;
    });
  }, [activeTabId]);

  const setActiveTab = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  const getTabById = useCallback((tabId: string) => {
    return tabs.find(t => t.id === tabId);
  }, [tabs]);

  const reorderTabs = useCallback((sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    setTabs((prevTabs) => {
      const sourceIndex = prevTabs.findIndex((tab) => tab.id === sourceId);
      const targetIndex = prevTabs.findIndex((tab) => tab.id === targetId);
      if (sourceIndex === -1 || targetIndex === -1) {
        return prevTabs;
      }
      const nextTabs = [...prevTabs];
      const [removed] = nextTabs.splice(sourceIndex, 1);
      nextTabs.splice(targetIndex, 0, removed);
      return nextTabs;
    });
  }, []);

  const value = useMemo(
    () => ({ tabs, activeTabId, addTab, removeTab, setActiveTab, getTabById, reorderTabs }),
    [tabs, activeTabId, addTab, removeTab, setActiveTab, getTabById, reorderTabs]
  );

  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
}

export function useTabs() {
  const context = useContext(TabsContext);
  if (context === undefined) {
    throw new Error('useTabs must be used within a TabsProvider');
  }
  return context;
}
