/**
 * 分类侧边栏组件
 * 从 AssistantManager.tsx 中抽离的分类导航
 */

import React from 'react';
import styled from 'styled-components';
import type { CategorySidebarProps } from './types';

// 样式组件
const Sidebar = styled.div`
  width: 240px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  height: 100vh;

  .dark & {
    background: #2d2d2d !important;
    border-right-color: rgba(255, 255, 255, 0.1) !important;
  }

  &[data-theme="dark"] {
    background: #2d2d2d !important;
    border-right-color: rgba(255, 255, 255, 0.1) !important;
  }
`;

const CategoryList = styled.div`
  flex: 1;
  padding: 16px 16px 0 16px;
  overflow-y: auto;
`;

const CategoryItem = styled.button<{ $active: boolean }>`
  width: 100%;
  padding: 8px 12px;
  margin-bottom: 4px;
  background: ${props => props.$active ? 'var(--accent-color)' : 'transparent'};
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.$active ? 'white' : 'var(--text-primary)'};
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background: ${props => props.$active ? 'var(--accent-color)' : 'var(--bg-tertiary)'};
  }
`;

const CategoryContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const CategoryIcon = styled.span`
  display: flex;
  align-items: center;
  font-size: 16px;
`;

const CategoryCount = styled.span`
  font-size: 12px;
  opacity: 0.7;
`;

const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  activeCategory,
  onCategoryChange
}) => {
  return (
    <Sidebar data-theme={document.documentElement.classList.contains('dark') ? 'dark' : 'light'}>
      <CategoryList>
        {categories.map(category => (
          <CategoryItem
            key={category.key}
            $active={activeCategory === category.key}
            onClick={() => onCategoryChange(category.key)}
          >
            <CategoryContent>
              <CategoryIcon>{category.icon}</CategoryIcon>
              <span>{category.label}</span>
            </CategoryContent>
            <CategoryCount>({category.count})</CategoryCount>
          </CategoryItem>
        ))}
      </CategoryList>
    </Sidebar>
  );
};

export default CategorySidebar;