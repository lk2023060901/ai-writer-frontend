/**
 * 重构后的侧边栏主容器组件
 * 将原1656行的巨型组件拆分为多个小组件的组合
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { Layout, Tabs } from 'antd';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { setCurrentTopic, setSidebarActiveTab } from '@/store/slices/uiSlice';

// 导入子组件
import AssistantList from './AssistantList';
import TopicList from './TopicList';
import SidebarSettings from './SidebarSettings';

// 导入类型和常量
import type {
  SidePanelProps,
  Assistant,
  Topic,
  SidebarTab,
  SettingsValues,
  SettingsExpanded,
} from './types';
import {
  defaultAssistants,
  defaultTopics,
  defaultSettingsValues,
  defaultSettingsExpanded,
} from './constants';

const { Sider } = Layout;

// 样式组件
const StyledSider = styled(Sider)`
  background: var(--bg-secondary) !important;
  border-right: none;
  height: calc(100vh - 48px);
  overflow: hidden;

  &.ant-layout-sider {
    background: var(--bg-secondary) !important;
  }

  .dark & {
    background: #2d2d2d !important;

    &.ant-layout-sider {
      background: #2d2d2d !important;
    }
  }

  .ant-layout-sider-children {
    display: flex;
    flex-direction: column;
    height: 100%;
    box-sizing: border-box;
    background: inherit;
  }
`;

const SidebarTabsContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;

  .ant-tabs {
    height: 100%;
    display: flex;
    flex-direction: column;

    .ant-tabs-nav {
      margin: 0;
      padding: 8px;
      background: transparent;
      box-sizing: border-box;

      &::before {
        border: none;
      }
    }

    .ant-tabs-tab {
      padding: 8px 12px;
      margin: 0;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      position: relative;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        height: 2px;
        background: var(--accent-color);
        transform: translateX(-50%) scaleX(0);
        transform-origin: center;
        transition: transform 0.3s ease;
        width: calc(100% - 16px);
      }

      &::before {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        width: calc(100% - 16px);
        height: 2px;
        background: var(--accent-color);
        transform: translateX(-50%) scaleX(0);
        transform-origin: center;
        transition: transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
        z-index: 1;
      }

      &:hover {
        color: var(--text-primary);
        background: transparent;

        &::after {
          transform: translateX(-50%) scaleX(1);
        }
      }

      &.ant-tabs-tab-active {
        color: var(--accent-color);
        background: transparent;

        &::before {
          transform: translateX(-50%) scaleX(1);
        }

        &::after {
          transform: translateX(-50%) scaleX(0);
        }

        &:hover::after {
          transform: translateX(-50%) scaleX(0);
        }
      }

      .ant-tabs-tab-btn {
        font-size: 14px;
        font-weight: 500;
        color: inherit;
        transition: color 0.3s ease;
      }
    }

    .ant-tabs-ink-bar {
      display: none;
    }

    .ant-tabs-content-holder {
      flex: 1;
      overflow: hidden;
    }

    .ant-tabs-content {
      height: 100%;
    }

    .ant-tabs-tabpane {
      height: 100%;
      overflow: hidden;
    }
  }
`;

// 主组件
const SidePanelRefactored: React.FC<SidePanelProps> = ({ inDrawer = false }) => {
  const dispatch = useAppDispatch();
  const { sidebarActiveTab, sidebarCollapsed } = useAppSelector(state => state.ui);

  // 助手管理状态
  const [assistants] = useState<Assistant[]>(defaultAssistants);
  const [selectedAssistantId, setSelectedAssistantId] = useState<string>('1');

  // 话题管理状态
  const [topics, setTopics] = useState<Topic[]>(defaultTopics);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('1');

  // 话题编辑状态
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  // 设置状态
  const [settingsValues, setSettingsValues] = useState<SettingsValues>(defaultSettingsValues);
  const [settingsExpanded, setSettingsExpanded] = useState<SettingsExpanded>(defaultSettingsExpanded);

  // 助手相关处理函数
  const handleSelectAssistant = (assistantId: string) => {
    setSelectedAssistantId(assistantId);
  };

  const handleAddAssistant = () => {
    // TODO: 实现添加助手逻辑
    console.log('添加助手');
  };

  // 话题相关处理函数
  const handleSelectTopic = (topicId: string) => {
    setSelectedTopicId(topicId);
    dispatch(setCurrentTopic(topicId));
  };

  const handleCreateTopic = () => {
    const newTopic: Topic = {
      id: Date.now().toString(),
      title: '新话题',
      lastMessage: '开始新的对话...',
      messageCount: 0,
      lastActiveTime: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    setTopics(prev => [newTopic, ...prev]);
    setSelectedTopicId(newTopic.id);
    dispatch(setCurrentTopic(newTopic.id));
  };

  const handleStartEditTopic = (topicId: string, title: string) => {
    setEditingTopicId(topicId);
    setEditingTitle(title);
  };

  const handleCancelEditTopic = () => {
    setEditingTopicId(null);
    setEditingTitle('');
  };

  const handleSaveEditTopic = () => {
    if (editingTopicId && editingTitle.trim()) {
      setTopics(prev =>
        prev.map(topic =>
          topic.id === editingTopicId
            ? { ...topic, title: editingTitle.trim() }
            : topic
        )
      );
    }
    setEditingTopicId(null);
    setEditingTitle('');
  };

  const handleEditTopic = (topicId: string, title: string) => {
    setEditingTitle(title);
  };

  const handleDeleteTopic = (topicId: string) => {
    setTopics(prev => prev.filter(topic => topic.id !== topicId));
    if (selectedTopicId === topicId) {
      const remainingTopics = topics.filter(topic => topic.id !== topicId);
      if (remainingTopics.length > 0) {
        setSelectedTopicId(remainingTopics[0].id);
        dispatch(setCurrentTopic(remainingTopics[0].id));
      } else {
        setSelectedTopicId('');
        dispatch(setCurrentTopic(undefined));
      }
    }
  };

  // 设置相关处理函数
  const handleSettingsChange = (key: keyof SettingsValues, value: SettingsValues[keyof SettingsValues]) => {
    setSettingsValues(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleToggleExpanded = (key: keyof SettingsExpanded) => {
    setSettingsExpanded(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // 标签页切换处理
  const handleTabChange = (tabKey: string) => {
    dispatch(setSidebarActiveTab(tabKey as SidebarTab));
  };

  // 标签页配置
  const tabItems = [
    {
      key: 'assistants',
      label: '助手',
      children: (
        <AssistantList
          assistants={assistants}
          selectedAssistantId={selectedAssistantId}
          onSelectAssistant={handleSelectAssistant}
          onAddAssistant={handleAddAssistant}
        />
      ),
    },
    {
      key: 'topics',
      label: '话题',
      children: (
        <TopicList
          topics={topics}
          selectedTopicId={selectedTopicId}
          onSelectTopic={handleSelectTopic}
          onCreateTopic={handleCreateTopic}
          onEditTopic={handleEditTopic}
          onDeleteTopic={handleDeleteTopic}
          editingTopicId={editingTopicId}
          editingTitle={editingTitle}
          onStartEdit={handleStartEditTopic}
          onCancelEdit={handleCancelEditTopic}
          onSaveEdit={handleSaveEditTopic}
        />
      ),
    },
    {
      key: 'settings',
      label: '设置',
      children: (
        <SidebarSettings
          settingsValues={settingsValues}
          settingsExpanded={settingsExpanded}
          onSettingsChange={handleSettingsChange}
          onToggleExpanded={handleToggleExpanded}
        />
      ),
    },
  ];

  const siderContent = (
    <SidebarTabsContainer>
      <Tabs
        activeKey={sidebarActiveTab}
        onChange={handleTabChange}
        items={tabItems}
        size="small"
        centered={!inDrawer}
      />
    </SidebarTabsContainer>
  );

  if (inDrawer) {
    return siderContent;
  }

  return (
    <StyledSider
      collapsed={sidebarCollapsed}
      collapsedWidth={0}
      width={280}
      theme="light"
    >
      {siderContent}
    </StyledSider>
  );
};

export default SidePanelRefactored;