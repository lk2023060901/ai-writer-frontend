/**
 * 助手网格组件
 * 从 AssistantManager.tsx 中抽离的助手列表网格容器
 */

import React from 'react';
import styled from 'styled-components';
import AssistantCard from './AssistantCard';
import type { AssistantGridProps } from './types';

// 样式组件
const MainContent = styled.div`
  flex: 1;
  overflow-y: auto;
  background: var(--bg-primary);
`;

const MainContentInner = styled.div`
  padding: 24px 32px;
  max-width: 1200px;
  margin: 0 auto;
`;

const AssistantGridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
  margin-top: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  @media (min-width: 1400px) {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: var(--text-secondary);

  .empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  .empty-title {
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 8px;
    color: var(--text-primary);
  }

  .empty-description {
    font-size: 14px;
    line-height: 1.5;
  }
`;

const AssistantGrid: React.FC<AssistantGridProps> = ({
  assistants,
  onEditAssistant,
  onDuplicateAssistant,
  onDeleteAssistant,
  onToggleFavorite
}) => {
  if (assistants.length === 0) {
    return (
      <MainContent>
        <MainContentInner>
          <EmptyState>
            <div className="empty-icon">🤖</div>
            <div className="empty-title">暂无助手</div>
            <div className="empty-description">
              还没有找到相关的助手，试试调整搜索条件或创建一个新的助手吧
            </div>
          </EmptyState>
        </MainContentInner>
      </MainContent>
    );
  }

  return (
    <MainContent>
      <MainContentInner>
        <AssistantGridContainer>
          {assistants.map(assistant => (
            <AssistantCard
              key={assistant.id}
              assistant={assistant}
              onEdit={() => onEditAssistant(assistant)}
              onDuplicate={() => onDuplicateAssistant(assistant)}
              onDelete={() => onDeleteAssistant(assistant)}
              onToggleFavorite={() => onToggleFavorite(assistant.id)}
            />
          ))}
        </AssistantGridContainer>
      </MainContentInner>
    </MainContent>
  );
};

export default AssistantGrid;