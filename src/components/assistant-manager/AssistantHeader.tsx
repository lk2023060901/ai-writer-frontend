/**
 * 助手管理页头部组件
 * 从 AssistantManager.tsx 中抽离的搜索和操作头部
 */

import React from 'react';
import styled from 'styled-components';
import { Button, Input } from 'antd';
import { GlobalOutlined, PlusOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import type { AssistantHeaderProps } from './types';

// 样式组件
const MainHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px 16px 32px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
`;

const CategoryTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const CategoryTitleIcon = styled.span`
  font-size: 20px;
  color: var(--accent-color);
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SearchContainer = styled.div`
  position: relative;
`;

const SearchInput = styled(Input)`
  width: 300px;
  height: 40px;
  border-radius: 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);

  &:focus, &:focus-within {
    border-color: var(--accent-color);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
  }

  .ant-input {
    background: transparent;
    color: var(--text-primary);

    &::placeholder {
      color: var(--text-secondary);
    }
  }

  .ant-input-prefix {
    margin-right: 8px;
  }
`;

const ImportButton = styled(Button)`
  height: 40px;
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    border-color: var(--accent-color) !important;
    color: var(--text-primary) !important;
    background: var(--bg-secondary) !important;
  }
`;

const CreateButton = styled(Button)`
  height: 40px;
  background: var(--accent-color);
  border-color: var(--accent-color);
  color: white;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: var(--accent-color) !important;
    border-color: var(--accent-color) !important;
    opacity: 0.9;
  }
`;

const AssistantHeader: React.FC<AssistantHeaderProps> = ({
  searchQuery,
  onSearch,
  activeCategory,
  categories,
  filteredCount,
  onCreateAssistant,
  onImportAssistant
}) => {
  const currentCategory = categories.find(cat => cat.key === activeCategory);

  const getTitle = () => {
    if (searchQuery.trim()) {
      return (
        <>
          <CategoryTitleIcon>
            <SearchOutlined />
          </CategoryTitleIcon>
          <span>搜索结果 ({filteredCount})</span>
        </>
      );
    }

    return (
      <>
        <CategoryTitleIcon>
          {currentCategory?.icon || <UserOutlined />}
        </CategoryTitleIcon>
        <span>
          {currentCategory?.label || '我的'} ({currentCategory?.count || 0})
        </span>
      </>
    );
  };

  return (
    <MainHeader>
      <CategoryTitle>
        {getTitle()}
      </CategoryTitle>

      <HeaderActions>
        <SearchContainer>
          <SearchInput
            placeholder="搜索智能体..."
            prefix={<SearchOutlined style={{ color: 'var(--text-secondary)' }} />}
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            allowClear
          />
        </SearchContainer>

        <ImportButton
          icon={<GlobalOutlined />}
          onClick={onImportAssistant}
        >
          从外部导入
        </ImportButton>

        <CreateButton
          type="primary"
          icon={<PlusOutlined />}
          onClick={onCreateAssistant}
        >
          创建智能体
        </CreateButton>
      </HeaderActions>
    </MainHeader>
  );
};

export default AssistantHeader;