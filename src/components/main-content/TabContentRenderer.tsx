/**
 * 标签页内容渲染器组件
 * 从 MainContent.tsx 中抽离的标签页路由逻辑
 */

import React from 'react';
import styled from 'styled-components';
import { Button } from 'antd';
import { useAppSelector } from '@/hooks/redux';
import TabsTypeDemo from '@/components/demo/TabsTypeDemo';
import DesignSystemDemo from '@/components/demo/DesignSystemDemo';
import { AssistantManagerRefactored as AssistantManager } from '@/components/assistant-manager';
import KnowledgeBase from '@/components/pages/KnowledgeBase';
import type { TabContentRendererProps } from './types';

// 样式组件
const StyledContent = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--ds-bg-primary);
  overflow: hidden;
`;

const BackButton = styled(Button)`
  margin: var(--ds-spacing-md);
  align-self: flex-start;
  border: 1px solid var(--ds-border-default);
  background: var(--ds-bg-secondary);
  color: var(--ds-text-primary);

  &:hover {
    border-color: var(--ds-accent-primary);
    background: var(--ds-bg-tertiary);
    color: var(--ds-text-primary);
  }
`;

const TabContentRenderer: React.FC<TabContentRendererProps> = () => {
  const { tabs, activeTabId } = useAppSelector(state => state.ui);
  const currentTab = tabs.find(tab => tab.id === activeTabId);

  // 如果当前标签页是知识库页面
  if (currentTab && currentTab.type === 'knowledge') {
    return (
      <StyledContent>
        <KnowledgeBase />
      </StyledContent>
    );
  }

  // 如果当前标签页是助手管理页面
  if (currentTab && currentTab.type === 'assistant') {
    return (
      <StyledContent>
        <AssistantManager />
      </StyledContent>
    );
  }

  // 返回 null 表示应该显示默认的聊天界面
  return null;
};

export default TabContentRenderer;